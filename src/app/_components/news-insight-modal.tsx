"use client";

import { api } from "@/trpc/react";
import { Bot, ExternalLink, Send, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

interface NewsInsightModalProps {
	newsItem: NewsItem;
	isOpen: boolean;
	onClose: () => void;
}

export function NewsInsightModal({
	newsItem,
	isOpen,
	onClose,
}: NewsInsightModalProps) {
	const [activeTab, setActiveTab] = useState<"insights" | "chat">("insights");
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [inputMessage, setInputMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const chatEndRef = useRef<HTMLDivElement>(null);

	// Scroll to bottom when new messages are added
	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleString("pt-BR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleSendMessage = async () => {
		if (!inputMessage.trim() || isLoading) return;

		const userMessage: ChatMessage = {
			id: Date.now().toString(),
			role: "user",
			content: inputMessage,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputMessage("");
		setIsLoading(true);

		try {
			// Chamar API route para evitar problemas com variáveis de ambiente do lado cliente
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: inputMessage,
					context: {
						news: [
							{
								title: newsItem.title,
								source: newsItem.source,
								publishedAt: newsItem.publishedAt.toISOString(),
								insights: newsItem.insights,
							},
						],
						type: "news-modal",
					},
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to get chat response");
			}

			const data = await response.json();

			const assistantMessage: ChatMessage = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: data.response,
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			console.error("Erro ao enviar mensagem:", error);
			const errorMessage: ChatMessage = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content:
					"Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
			<div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-lg border border-primary bg-terminal">
				{/* Header */}
				<div className="flex items-center justify-between border-primary border-b p-4">
					<div>
						<h2 className="neon-glow font-bold text-neon text-xl">
							[NEWS TERMINAL - {newsItem.source}]
						</h2>
						<p className="mt-1 text-sm text-text-secondary">
							{newsItem.title.length > 60
								? `${newsItem.title.substring(0, 60)}...`
								: newsItem.title}
						</p>
					</div>
					<button
						onClick={onClose}
						type="button"
						className="rounded p-2 transition-colors hover:bg-primary/20"
					>
						<X className="h-5 w-5 text-text-secondary" />
					</button>
				</div>

				{/* Tabs */}
				<div className="flex border-primary border-b">
					<button
						onClick={() => setActiveTab("insights")}
						type="button"
						className={`px-6 py-3 font-bold transition-colors ${
							activeTab === "insights"
								? "bg-primary text-black"
								: "text-text-secondary hover:bg-primary/10"
						}`}
					>
						[INSIGHTS]
					</button>
					<button
						onClick={() => setActiveTab("chat")}
						type="button"
						className={`px-6 py-3 font-bold transition-colors ${
							activeTab === "chat"
								? "bg-primary text-black"
								: "text-text-secondary hover:bg-primary/10"
						}`}
					>
						[CHATBOT]
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-hidden">
					{activeTab === "insights" && (
						<div className="h-full overflow-y-auto p-6">
							{/* News Details */}
							<div className="mb-6">
								<div className="mb-4 flex items-center justify-between">
									<h3 className="neon-glow font-bold text-lg text-neon">
										[DETALHES DA NOTÍCIA]
									</h3>
									<a
										href={newsItem.link}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 rounded bg-primary px-3 py-1 font-bold text-black transition-colors hover:bg-primary-hover"
									>
										<ExternalLink className="h-4 w-4" />
										VER ORIGINAL
									</a>
								</div>

								<div className="space-y-4">
									<div className="rounded border border-primary bg-surface p-4">
										<div className="mb-2 text-sm text-text-secondary">
											[TÍTULO]
										</div>
										<div className="font-bold text-primary">
											{newsItem.title}
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="rounded border border-primary bg-surface p-4">
											<div className="mb-2 text-sm text-text-secondary">
												[FONTE]
											</div>
											<div className="font-bold text-info">
												{newsItem.source}
											</div>
										</div>
										<div className="rounded border border-primary bg-surface p-4">
											<div className="mb-2 text-sm text-text-secondary">
												[DATA]
											</div>
											<div className="font-bold text-text-primary">
												{formatDate(newsItem.publishedAt)}
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Insights */}
							<div>
								<h3 className="neon-glow mb-4 font-bold text-lg text-neon">
									[INSIGHTS GERADOS]
								</h3>

								{newsItem.insights.length > 0 ? (
									<div className="space-y-4">
										{newsItem.insights.map((insight) => (
											<div
												key={insight.id}
												className="rounded border border-primary bg-surface p-4"
											>
												<div className="mb-3 flex items-center justify-between">
													<span className="text-text-secondary text-xs">
														GERADO EM: {formatDate(insight.createdAt)}
													</span>
													<span className="rounded bg-black/20 px-2 py-1 text-info text-xs">
														IA-ANALYSIS
													</span>
												</div>
												<div className="text-text-primary leading-relaxed">
													{insight.content}
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="rounded border border-error bg-surface p-4 text-center">
										<div className="mb-2 text-error">[SEM INSIGHTS]</div>
										<div className="text-sm text-text-secondary">
											O sistema ainda está processando esta notícia para gerar
											insights personalizados.
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{activeTab === "chat" && (
						<div className="flex h-full flex-col">
							{/* Chat Messages */}
							<div className="flex-1 space-y-4 overflow-y-auto p-6">
								{messages.length === 0 && (
									<div className="mt-8 text-center text-text-secondary">
										<Bot className="mx-auto mb-4 h-12 w-12 opacity-50" />
										<div className="mb-2">[CHATBOT ATIVO]</div>
										<div className="text-sm">
											Faça perguntas sobre esta notícia. Posso ajudar com
											resumos, análises e contexto.
										</div>
									</div>
								)}

								{messages.map((message) => (
									<div
										key={message.id}
										className={`flex items-start gap-3 ${
											message.role === "user" ? "justify-end" : "justify-start"
										}`}
									>
										{message.role === "assistant" && (
											<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
												<Bot className="h-4 w-4 text-black" />
											</div>
										)}

										<div
											className={`max-w-[70%] rounded-lg p-3 ${
												message.role === "user"
													? "bg-primary text-black"
													: "border border-primary bg-surface"
											}`}
										>
											<div className="whitespace-pre-wrap text-sm leading-relaxed">
												{message.content}
											</div>
											<div className="mt-2 text-xs opacity-60">
												{message.timestamp.toLocaleTimeString("pt-BR", {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</div>
										</div>

										{message.role === "user" && (
											<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-text-secondary">
												<User className="h-4 w-4 text-black" />
											</div>
										)}
									</div>
								))}

								{isLoading && (
									<div className="flex items-start gap-3">
										<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
											<Bot className="h-4 w-4 text-black" />
										</div>
										<div className="rounded-lg border border-primary bg-surface p-3">
											<div className="text-sm text-text-secondary">
												Processando sua mensagem...
											</div>
										</div>
									</div>
								)}

								<div ref={chatEndRef} />
							</div>

							{/* Chat Input */}
							<div className="border-primary border-t p-4">
								<div className="flex gap-2">
									<input
										type="text"
										value={inputMessage}
										onChange={(e) => setInputMessage(e.target.value)}
										onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
										placeholder="Digite sua mensagem..."
										className="flex-1 rounded border border-primary bg-surface px-3 py-2 text-text-primary placeholder-text-secondary focus:border-neon focus:outline-none"
										disabled={isLoading}
									/>
									<button
										onClick={handleSendMessage}
										disabled={!inputMessage.trim() || isLoading}
										type="button"
										className="rounded bg-primary px-4 py-2 font-bold text-black transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
									>
										<Send className="h-4 w-4" />
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
