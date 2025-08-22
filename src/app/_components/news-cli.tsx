"use client";

import { useTerminalEvents } from "@/app/_hooks/use-keyboard-navigation";
import { api } from "@/trpc/react";
import { Send, Terminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CLIMessage {
	id: string;
	type: "command" | "output" | "error" | "info";
	content: string;
	timestamp: Date;
}

interface NewsItem {
	id: string;
	title: string;
	link: string;
	source: string;
	publishedAt: Date;
	createdAt: Date;
	insights: {
		id: number;
		content: string;
		createdAt: Date;
	}[];
}

interface NewsCLIProps {
	isSidebar?: boolean;
}

export function NewsCLI({ isSidebar = false }: NewsCLIProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);

	// Se estiver na sidebar, desabilitar o colapso próprio
	const effectiveCollapsed = isSidebar ? false : isCollapsed;
	const [messages, setMessages] = useState<CLIMessage[]>([
		{
			id: "welcome",
			type: "info",
			content: isSidebar
				? "┌─[NEWS TERMINAL v2.0]────────────────────────────────────┐\n│ Sistema de Vigilância Inteligente - Modo CLI          │\n│ Digite 'help' para ver comandos disponíveis           │\n│ Modo Sidebar: Use Alt+T para alternar                 │\n└───────────────────────────────────────────────────────┘"
				: "┌─[ALL-SEEING EYE TERMINAL v2.0]─────────────────────────┐\n│ Sistema de Vigilância Inteligente - Modo CLI          │\n│ Digite 'help' para ver comandos disponíveis           │\n│ Atalhos: Ctrl+Y (colapsar), Tab (auto-complete)       │\n└───────────────────────────────────────────────────────┘",
			timestamp: new Date(),
		},
		{
			id: "prompt",
			type: "command",
			content: "user@all-seeing-eye:~$ ",
			timestamp: new Date(),
		},
	]);
	const [inputCommand, setInputCommand] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [commandHistory, setCommandHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const terminalEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Buscar notícias
	const { data: newsData, isLoading: newsLoading } = api.news.getAll.useQuery({
		limit: 20,
		offset: 0,
	});

	// Alertas: hooks para criar e consultar
	const createAlert = api.alerts.create.useMutation();
	const alertsListQuery = api.alerts.list.useQuery(undefined, { enabled: false });
	const alertEventsQuery = api.alerts.events.useQuery(undefined, { enabled: false });

	const scrollToEnd = () => {
		terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ctrl+T to toggle collapse
			if (e.ctrlKey && e.key === "t") {
				e.preventDefault();
				setIsCollapsed((prev) => !prev);
			}

			// Focus terminal when typing in main area
			if (!isCollapsed && e.target === document.body) {
				const isTyping =
					e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey;
				if (isTyping) {
					inputRef.current?.focus();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isCollapsed]);

	// Listen for terminal expand events
	useTerminalEvents(() => {
		setIsCollapsed(false);
		setTimeout(() => inputRef.current?.focus(), 100);
	});

	// Focus input when clicking terminal
	const handleTerminalClick = () => {
		inputRef.current?.focus();
	};

	const addMessage = (type: CLIMessage["type"], content: string) => {
		const newMessage: CLIMessage = {
			id: Date.now().toString(),
			type,
			content,
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, newMessage]);
		setTimeout(scrollToEnd, 0);
	};

	const addPrompt = () => {
		setTimeout(() => {
			addMessage("command", "user@all-seeing-eye:~$ ");
		}, 100);
	};

	const handleCommand = async (command: string) => {
		const cmd = command.trim().toLowerCase();

		// Add to command history
		if (cmd !== "" && !commandHistory.includes(command)) {
			setCommandHistory((prev) => [...prev, command]);
		}

		if (cmd === "") {
			addPrompt();
			return;
		}

		if (cmd === "help") {
			addMessage(
				"output",
				`┌─[COMANDOS DISPONÍVEIS]─────────────────────────────┐
│ news                    - Listar últimas notícias      │
│ news [id]               - Ver notícia específica       │
│ chat [pergunta]         - Conversar sobre notícias     │
│ insights                - Ver insights de todas       │
│ insights [id]           - Ver insights de notícia     │
│ sources                 - Listar fontes disponíveis    │
│ alert create [texto]    - Criar regra de alerta NL     │
│ alert list              - Listar regras de alerta      │
│ alert events            - Últimos disparos de alertas  │
│ clear                   - Limpar terminal             │
│ about                   - Sobre o sistema             │
│ exit                    - Sair do terminal            │
└───────────────────────────────────────────────────────┘`,
			);
			addPrompt();
			return;
		}
		if (cmd.startsWith("alert ")) {
			const [, subcmd, ...rest] = command.split(" ");
			if (subcmd === "create") {
				const text = rest.join(" ").trim();
				if (!text) {
					addMessage("error", "Uso: alert create [regra em linguagem natural]");
					addPrompt();
					return;
				}

				try {
					const created = await createAlert.mutateAsync({ text });
					if (created) {
						addMessage(
							"output",
							`Regra criada: #${created.id} (${created.ruleType}) - ${created.ruleText}`,
						);
					} else {
						addMessage("error", "Falha ao criar regra");
					}
				} catch (e) {
					const msg = e instanceof Error ? e.message : "Erro ao criar regra";
					addMessage("error", msg);
				}
				addPrompt();
				return;
			}
			if (subcmd === "list") {
				const { data: rules } = await alertsListQuery.refetch();
				if (!rules || !rules.length) {
					addMessage("info", "Nenhuma regra cadastrada.");
				} else {
					const lines = rules.map((r) => `#${r.id} [${r.active ? "on" : "off"}] ${r.ruleType} :: ${r.ruleText}`);
					addMessage("output", lines.join("\n"));
				}
				addPrompt();
				return;
			}
			if (subcmd === "events") {
				const { data: events } = await alertEventsQuery.refetch();
				if (!events || !events.length) {
					addMessage("info", "Sem eventos de alerta ainda.");
				} else {
					const lines = events.map((ev) => `#${ev.id} ${new Date(ev.createdAt as unknown as string).toLocaleString()} :: ${ev.message}`);
					addMessage("output", lines.join("\n"));
				}
				addPrompt();
				return;
			}
			addMessage("error", "Comando de alert inválido. Use: alert create|list|events");
			addPrompt();
			return;
		}

		if (cmd === "news") {
			if (newsLoading) {
				addMessage("output", "Carregando notícias...");
				addPrompt();
				return;
			}

			if (!newsData?.success || !newsData.data || newsData.data.length === 0) {
				addMessage("error", "❌ Nenhuma notícia encontrada.");
				addPrompt();
				return;
			}

			let output = "┌─[ÚLTIMAS NOTÍCIAS]─────────────────────────────────┐\n";
			newsData.data.forEach((news: NewsItem, index: number) => {
				const date = new Date(news.publishedAt).toLocaleDateString("pt-BR");
				output += `│ ${index + 1}. [${news.source}] ${news.title.substring(0, 50)}${news.title.length > 50 ? "..." : ""}\n`;
				output += `│    📅 ${date} | ID: ${news.id}\n`;
				if (index < newsData.data.length - 1) output += "│\n";
			});
			output += "└──────────────────────────────────────────────────┘\n";
			output += `📊 Total: ${newsData.data.length} notícias`;

			addMessage("output", output);
			addPrompt();
			return;
		}

		if (cmd.startsWith("news ")) {
			const newsId = cmd.split(" ")[1];
			if (newsLoading) {
				addMessage("output", "Carregando notícia...");
				addPrompt();
				return;
			}

			const news = newsData?.data?.find((n) => n.id === newsId);
			if (!news) {
				addMessage("error", `❌ Notícia com ID "${newsId}" não encontrada.`);
				addPrompt();
				return;
			}

			const date = new Date(news.publishedAt).toLocaleString("pt-BR");
			let output = `┌─[NOTÍCIA DETALHADA]────────────────────────────────┐
│ 📰 Título: ${news.title}
│ 🏢 Fonte: ${news.source}
│ 📅 Data: ${date}
│ 🔗 Link: ${news.link}
│ 📊 Insights: ${news.insights.length}
└───────────────────────────────────────────────────┘`;

			if (news.insights.length > 0) {
				output += "\n\n[INSIGHTS GERADOS]:";
				news.insights.forEach((insight: { content: string }, index: number) => {
					output += `\n${index + 1}. ${insight.content}`;
				});
			}

			addMessage("output", output);
			addPrompt();
			return;
		}

		if (cmd === "insights") {
			if (newsLoading) {
				addMessage("output", "Carregando insights...");
				addPrompt();
				return;
			}

			if (!newsData?.data || newsData.data.length === 0) {
				addMessage("error", "❌ Nenhuma notícia com insights encontrada.");
				addPrompt();
				return;
			}

			let output = "┌─[INSIGHTS DE TODAS AS NOTÍCIAS]──────────────────┐\n";
			let hasInsights = false;

			newsData.data.forEach((news: NewsItem, index: number) => {
				if (news.insights.length > 0) {
					hasInsights = true;
					output += `│ 📄 Notícia ${index + 1}: ${news.title.substring(0, 40)}${news.title.length > 40 ? "..." : ""}\n`;
					news.insights.forEach((insight, i: number) => {
						output += `│    ${i + 1}. ${insight.content.substring(0, 60)}${insight.content.length > 60 ? "..." : ""}\n`;
					});
					output += "│\n";
				}
			});

			if (!hasInsights) {
				output += "│ ❌ Nenhuma notícia possui insights ainda.\n";
			}

			output += "└──────────────────────────────────────────────────┘";
			addMessage("output", output);
			addPrompt();
			return;
		}

		if (cmd.startsWith("insights ")) {
			const newsId = cmd.split(" ")[1];
			if (newsLoading) {
				addMessage("output", "Carregando insights...");
				addPrompt();
				return;
			}

			const news = newsData?.data?.find((n) => n.id === newsId);
			if (!news) {
				addMessage("error", `❌ Notícia com ID "${newsId}" não encontrada.`);
				addPrompt();
				return;
			}

			if (news.insights.length === 0) {
				addMessage(
					"output",
					`📝 A notícia "${news.title.substring(0, 50)}..." ainda não possui insights.`,
				);
				addPrompt();
				return;
			}

			let output = `┌─[INSIGHTS DA NOTÍCIA]─────────────────────────────┐
│ 📰 Título: ${news.title.substring(0, 50)}${news.title.length > 50 ? "..." : ""}
│ 📊 Total de insights: ${news.insights.length}
└─────────────────────────────────────────────────────┘\n`;

			news.insights.forEach((insight: { content: string }, index: number) => {
				output += `\n[INSIGHT ${index + 1}]:\n${insight.content}\n`;
			});

			addMessage("output", output);
			addPrompt();
			return;
		}

		if (cmd === "sources") {
			if (newsLoading) {
				addMessage("output", "Carregando fontes...");
				addPrompt();
				return;
			}

			if (!newsData?.data || newsData.data.length === 0) {
				addMessage("error", "❌ Nenhuma fonte encontrada.");
				addPrompt();
				return;
			}

			const sources = [...new Set(newsData.data.map((n) => n.source))];
			let output = "┌─[FONTES DISPONÍVEIS]─────────────────────────────┐\n";

			sources.forEach((source, index) => {
				const count = newsData.data.filter((n) => n.source === source).length;
				output += `│ ${index + 1}. ${source} (${count} notícia${count !== 1 ? "s" : ""})\n`;
			});

			output += "└───────────────────────────────────────────────────┘\n";
			output += `📊 Total de fontes: ${sources.length}`;

			addMessage("output", output);
			addPrompt();
			return;
		}

		if (cmd === "clear") {
			setMessages([
				{
					id: "cleared",
					type: "info",
					content: "Terminal limpo. Digite 'help' para ver comandos.",
					timestamp: new Date(),
				},
			]);
			setTimeout(() => {
				addMessage("command", "user@all-seeing-eye:~$ ");
			}, 100);
			return;
		}

		if (cmd === "about") {
			addMessage(
				"output",
				`┌─[SOBRE O SISTEMA]─────────────────────────────────┐
│ 🤖 ALL-SEEING EYE v2.0
│ 📊 Sistema de Vigilância Inteligente
│ 📰 Monitoramento de Notícias em Tempo Real
│ 🧠 Análise com IA Integrada
│ 💻 Interface CLI Interativa
│ 🔒 Desenvolvido com Next.js e TypeScript
└───────────────────────────────────────────────────┘`,
			);
			addPrompt();
			return;
		}

		if (cmd === "exit") {
			addMessage(
				"output",
				"👋 Saindo do terminal... Obrigado por usar o ALL-SEEING EYE!",
			);
			return;
		}

		if (cmd.startsWith("chat ")) {
			const question = command.slice(5).trim();
			if (!question) {
				addMessage(
					"error",
					"❌ Digite uma pergunta após 'chat'. Exemplo: chat Qual é a notícia mais recente?",
				);
				addPrompt();
				return;
			}

			setIsLoading(true);
			addMessage("output", `🤖 Processando: "${question}"...`);

			try {
				const response = await fetch("/api/chat", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						message: question,
						context: {
							news: newsData?.data || [],
							type: "terminal-cli",
						},
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to get chat response");
				}

				const data = await response.json();
				addMessage("output", `🤖 ${data.response}`);
			} catch (error) {
				addMessage(
					"error",
					"❌ Erro ao processar a pergunta. Tente novamente.",
				);
			} finally {
				setIsLoading(false);
				addPrompt();
			}
			return;
		}

		// Comando não reconhecido
		addMessage(
			"error",
			`❌ Comando "${cmd}" não reconhecido. Digite 'help' para ver comandos disponíveis.`,
		);
		addPrompt();
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (inputCommand.trim() && !isLoading) {
			addMessage("command", `user@all-seeing-eye:~$ ${inputCommand}`);
			handleCommand(inputCommand);
			setInputCommand("");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowUp") {
			e.preventDefault();
			if (commandHistory.length > 0) {
				const newIndex =
					historyIndex === -1
						? commandHistory.length - 1
						: Math.max(0, historyIndex - 1);
				setHistoryIndex(newIndex);
				setInputCommand(commandHistory[newIndex] || "");
			}
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			if (historyIndex >= 0) {
				const newIndex = historyIndex + 1;
				if (newIndex >= commandHistory.length) {
					setHistoryIndex(-1);
					setInputCommand("");
				} else {
					setHistoryIndex(newIndex);
					setInputCommand(commandHistory[newIndex] || "");
				}
			}
		} else if (e.key === "Tab") {
			e.preventDefault();
			// Auto-complete functionality
			const suggestions = [
				"help",
				"news",
				"chat",
				"insights",
				"sources",
				"clear",
				"about",
				"exit",
			];
			const matching = suggestions.find((s) =>
				s.startsWith(inputCommand.toLowerCase()),
			);
			if (matching) {
				setInputCommand(matching);
			}
		} else {
			// Reset history index when typing new content
			setHistoryIndex(-1);
		}
	};

	return (
		<div
			className={`h-full w-full rounded-lg border border-primary bg-terminal shadow-2xl transition-all duration-300 ${
				isSidebar
					? "flex flex-col"
					: `fixed right-4 bottom-4 z-50 ${effectiveCollapsed ? "h-12 w-64" : "h-96 w-[90dvw]"}`
			}`}
		>
			{/* Terminal Header */}
			<div className="flex flex-shrink-0 items-center justify-between border-primary border-b bg-surface p-2">
				<div className="flex items-center gap-2">
					<Terminal className="h-4 w-4 text-neon" />
					<span className="font-bold text-neon text-sm">
						{isSidebar
							? "NEWS TERMINAL"
							: effectiveCollapsed
								? "NEWS TERMINAL [MINIMIZADO]"
								: "NEWS TERMINAL"}
					</span>
				</div>
				<div className="flex items-center gap-2">
					{!isSidebar && !effectiveCollapsed && (
						<button
							onClick={() => setIsCollapsed(true)}
							type="button"
							className="rounded p-1 transition-colors hover:bg-primary/20"
							title="Minimizar (Ctrl+Y)"
						>
							<svg
								className="h-3 w-3 text-text-secondary"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<title>Minimizar (Ctrl+Y)</title>
								<path
									fillRule="evenodd"
									d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
									clipRule="evenodd"
								/>
							</svg>
						</button>
					)}
					{isCollapsed && (
						<button
							onClick={() => setIsCollapsed(false)}
							type="button"
							className="rounded p-1 transition-colors hover:bg-primary/20"
							title="Maximizar (Ctrl+Y)"
						>
							<svg
								className="h-3 w-3 text-text-secondary"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<title>Maximizar (Ctrl+Y)</title>
								<path
									fillRule="evenodd"
									d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
									clipRule="evenodd"
								/>
							</svg>
						</button>
					)}
				</div>
			</div>

			{/* Terminal Content */}
			{(!effectiveCollapsed || isSidebar) && (
				<>
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
					<div
						className={`cursor-text overflow-y-auto bg-black/20 p-3 font-mono text-sm ${
							isSidebar ? "min-h-0 flex-1" : "max-h-[calc(100%-80px)] flex-1"
						}`}
						onClick={handleTerminalClick}
					>
						{messages.map((message) => (
							<div
								key={message.id}
								className={`mb-1 ${
									message.type === "error"
										? "text-red-400"
										: message.type === "info"
											? "text-blue-400"
											: message.type === "command"
												? "text-green-400"
												: "text-text-primary"
								}`}
							>
								{message.type === "command" ? (
									<span>{message.content}</span>
								) : (
									<div className="whitespace-pre-wrap">{message.content}</div>
								)}
							</div>
						))}

						{isLoading && (
							<div className="text-yellow-400">
								<span className="animate-pulse">█</span> Processando...
							</div>
						)}

						<div ref={terminalEndRef} />
					</div>

					{/* Input Form */}
					<form
						onSubmit={handleSubmit}
						className={`border-primary border-t bg-surface p-2 ${
							isSidebar ? "flex-shrink-0" : "max-h-20"
						}`}
					>
						<div className="flex items-center gap-2">
							<span className="font-mono text-green-400 text-sm">$</span>
							<input
								ref={inputRef}
								type="text"
								value={inputCommand}
								onChange={(e) => setInputCommand(e.target.value)}
								onKeyDown={handleKeyDown}
								disabled={isLoading}
								className="flex-1 border-none bg-transparent font-mono text-sm text-text-primary placeholder-text-muted outline-none"
								placeholder="Digite um comando..."
								autoComplete="off"
								autoCapitalize="off"
								spellCheck={false}
							/>
							<button
								type="submit"
								disabled={!inputCommand.trim() || isLoading}
								className="p-1 text-primary transition-colors hover:text-neon disabled:cursor-not-allowed disabled:opacity-50"
							>
								<Send className="h-4 w-4" />
							</button>
						</div>
					</form>
				</>
			)}
		</div>
	);
}
