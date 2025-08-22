"use client";

import { useChatNotifications } from "@/app/_hooks/use-chat-notifications";
import { useNotifications } from "@/app/_hooks/use-notifications";
import { api } from "@/trpc/react";
import {
	Bell,
	Brain,
	Edit3,
	Eye,
	EyeOff,
	MessageCircle,
	MessageSquare,
	Plus,
	Save,
	Send,
	Settings,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
	id: number;
	role: "user" | "assistant";
	content: string;
	createdAt: Date;
}

interface Conversation {
	id: number;
	title: string;
	systemPrompt: string;
	createdAt: Date;
	updatedAt: Date;
}

interface SystemPromptTemplate {
	id: number;
	name: string;
	description: string;
	prompt: string;
	isDefault: boolean;
	createdAt: Date;
	updatedAt: Date;
}

interface AIChatProps {
	isSidebar?: boolean;
}

export function AIChat({ isSidebar = false }: AIChatProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [selectedConversationId, setSelectedConversationId] = useState<
		number | null
	>(null);
	const [inputMessage, setInputMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showSystemPromptModal, setShowSystemPromptModal] = useState(false);
	const [showTemplatesModal, setShowTemplatesModal] = useState(false);
	const [editingTemplate, setEditingTemplate] =
		useState<SystemPromptTemplate | null>(null);
	const [newTemplate, setNewTemplate] = useState({
		name: "",
		description: "",
		prompt: "",
		isDefault: false,
	});

	// Estados para edição do system prompt
	const [editingSystemPrompt, setEditingSystemPrompt] = useState("");
	const [showSystemPromptPreview, setShowSystemPromptPreview] = useState(false);
	const [isUpdatingSystemPrompt, setIsUpdatingSystemPrompt] = useState(false);

	// Hook de notificações
	const { unreadCount, notifications } = useNotifications();
	const {
		notifyNewConversation,
		notifyMessageSent,
		notifyAIResponse,
		notifyError,
		notifySystemPromptUpdated,
		notifyTemplateCreated,
	} = useChatNotifications();

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// TRPC queries and mutations
	const { data: conversations, refetch: refetchConversations } =
		api.chat.getConversations.useQuery();
	const {
		data: selectedConversationData,
		refetch: refetchSelectedConversation,
	} = api.chat.getConversation.useQuery(
		{ id: selectedConversationId || 0 },
		{ enabled: !!selectedConversationId },
	);
	const { data: systemPromptTemplates, refetch: refetchTemplates } =
		api.chat.getSystemPromptTemplates.useQuery();

	const createConversation = api.chat.createConversation.useMutation({
		onSuccess: () => {
			refetchConversations();
		},
	});

	const addMessage = api.chat.addMessage.useMutation({
		onSuccess: () => {
			refetchSelectedConversation();
		},
	});

	const updateConversation = api.chat.updateConversation.useMutation({
		onSuccess: () => {
			refetchConversations();
			refetchSelectedConversation();
		},
	});

	const deleteConversation = api.chat.deleteConversation.useMutation({
		onSuccess: () => {
			refetchConversations();
			if (selectedConversationId) {
				setSelectedConversationId(null);
			}
		},
	});

	const createTemplate = api.chat.createSystemPromptTemplate.useMutation({
		onSuccess: () => {
			refetchTemplates();
			setNewTemplate({
				name: "",
				description: "",
				prompt: "",
				isDefault: false,
			});
		},
	});

	const updateTemplate = api.chat.updateSystemPromptTemplate.useMutation({
		onSuccess: () => {
			refetchTemplates();
			setEditingTemplate(null);
		},
	});

	const deleteTemplate = api.chat.deleteSystemPromptTemplate.useMutation({
		onSuccess: () => {
			refetchTemplates();
		},
	});

	// Buscar notícias para contexto
	const { data: newsData } = api.news.getAll.useQuery({
		limit: 20,
		offset: 0,
	});

	// Auto-scroll para a última mensagem
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [selectedConversationId]);

	// Selecionar primeira conversa automaticamente
	useEffect(() => {
		if (conversations && conversations.length > 0 && !selectedConversationId) {
			setSelectedConversationId(conversations[0]?.id || null);
		}
	}, [conversations, selectedConversationId]);

	// Inicializar editingSystemPrompt quando abrir o modal
	useEffect(() => {
		if (showSystemPromptModal && selectedConversationData) {
			setEditingSystemPrompt(
				selectedConversationData.conversation.systemPrompt,
			);
		}
	}, [showSystemPromptModal, selectedConversationData]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ctrl+T to toggle collapse
			if (e.ctrlKey && e.key === "t") {
				e.preventDefault();
				setIsCollapsed((prev) => !prev);
			}

			// Focus chat when typing in main area
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

	const handleCreateConversation = async () => {
		const defaultPrompt =
			"Você é um assistente de IA especializado em análise de notícias e tecnologia. Responda sempre em português brasileiro.";

		try {
			const newConversation = await createConversation.mutateAsync({
				title: `Nova Conversa ${new Date().toLocaleDateString("pt-BR")}`,
				systemPrompt: defaultPrompt,
			});
			setSelectedConversationId(newConversation?.id || null);

			// Notificar sobre nova conversa criada
			if (newConversation) {
				notifyNewConversation(newConversation.title);
			}
		} catch (error) {
			console.error("Erro ao criar conversa:", error);
			notifyError("Falha ao criar nova conversa");
		}
	};

	const handleSendMessage = async () => {
		if (!inputMessage.trim() || !selectedConversationId || isLoading) return;

		const message = inputMessage.trim();
		setInputMessage("");
		setIsLoading(true);

		try {
			// Notificar sobre mensagem enviada
			notifyMessageSent();

			// Adicionar mensagem do usuário
			await addMessage.mutateAsync({
				conversationId: selectedConversationId,
				role: "user",
				content: message,
			});

			// Gerar resposta da IA
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message,
					context: {
						news: newsData?.data || [],
						type: "news-modal",
					},
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to get chat response");
			}

			const data = await response.json();

			// Adicionar resposta da IA
			await addMessage.mutateAsync({
				conversationId: selectedConversationId,
				role: "assistant",
				content: data.response,
			});

			// Notificar sobre resposta da IA
			notifyAIResponse();
		} catch (error) {
			console.error("Erro ao enviar mensagem:", error);
			notifyError("Falha ao processar mensagem");

			// Adicionar mensagem de erro
			await addMessage.mutateAsync({
				conversationId: selectedConversationId,
				role: "assistant",
				content:
					"Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateSystemPrompt = async () => {
		if (!selectedConversationId || !editingSystemPrompt.trim()) return;

		setIsUpdatingSystemPrompt(true);
		try {
			await updateConversation.mutateAsync({
				id: selectedConversationId,
				systemPrompt: editingSystemPrompt.trim(),
			});
			setShowSystemPromptModal(false);
		} catch (error) {
			console.error("Erro ao atualizar system prompt:", error);
		} finally {
			setIsUpdatingSystemPrompt(false);
		}
	};

	const handleSaveTemplate = async () => {
		if (!newTemplate.name.trim() || !newTemplate.prompt.trim()) return;

		try {
			await createTemplate.mutateAsync(newTemplate);
			setShowTemplatesModal(false);
		} catch (error) {
			console.error("Erro ao salvar template:", error);
		}
	};

	const handleUpdateTemplate = async () => {
		if (!editingTemplate) return;

		try {
			await updateTemplate.mutateAsync({
				id: editingTemplate.id,
				name: editingTemplate.name,
				description: editingTemplate.description,
				prompt: editingTemplate.prompt,
				isDefault: editingTemplate.isDefault,
			});
		} catch (error) {
			console.error("Erro ao atualizar template:", error);
		}
	};

	const handleDeleteTemplate = async (templateId: number) => {
		if (confirm("Tem certeza que deseja excluir este template?")) {
			try {
				await deleteTemplate.mutateAsync({ id: templateId });
			} catch (error) {
				console.error("Erro ao excluir template:", error);
			}
		}
	};

	const handleUseTemplate = (template: SystemPromptTemplate) => {
		if (selectedConversationId) {
			setEditingSystemPrompt(template.prompt);
			setShowSystemPromptModal(true);
		}
		setShowTemplatesModal(false);
	};

	const effectiveCollapsed = isSidebar ? false : isCollapsed;

	return (
		<div
			className={`h-full w-full rounded-lg border border-primary bg-surface shadow-2xl transition-all duration-300 ${
				isSidebar
					? "flex flex-col"
					: `fixed right-4 bottom-4 z-50 ${effectiveCollapsed ? "h-12 w-64" : "h-[80vh] w-[min(90vw,1200px)]"}`
			}`}
		>
			{/* Chat Header */}
			<div className="flex flex-shrink-0 items-center justify-between border-primary border-b bg-surface p-2">
				<div className="flex items-center gap-2">
					<MessageSquare className="h-4 w-4 text-primary" />
					<span className="font-bold text-primary text-sm">
						{isSidebar
							? "AI CHAT"
							: effectiveCollapsed
								? "AI CHAT [MINIMIZADO]"
								: "AI CHAT"}
					</span>
					{/* Indicador de notificações */}
					{unreadCount > 0 && (
						<div className="ml-2 flex items-center gap-1">
							<Bell className="h-3 w-3 text-red-500" />
							<span className="font-medium text-red-500 text-xs">
								{unreadCount}
							</span>
						</div>
					)}
				</div>
				<div className="flex items-center gap-2">
					{/* Indicador de notificações */}
					{unreadCount > 0 && (
						<div className="mr-2 flex items-center gap-1">
							<Bell className="h-3 w-3 text-red-500" />
							<span className="font-medium text-red-500 text-xs">
								{unreadCount}
							</span>
						</div>
					)}

					{!isSidebar && !effectiveCollapsed && (
						<button
							onClick={() => setIsCollapsed(true)}
							type="button"
							className="rounded p-1 transition-colors hover:bg-primary/20"
							title="Minimizar (Ctrl+T)"
						>
							<X className="h-3 w-3 text-text-secondary" />
						</button>
					)}
					{isCollapsed && (
						<button
							onClick={() => setIsCollapsed(false)}
							type="button"
							className="rounded p-1 transition-colors hover:bg-primary/20"
							title="Maximizar (Ctrl+T)"
						>
							<Plus className="h-3 w-3 text-text-secondary" />
						</button>
					)}
				</div>
			</div>

			{/* Chat Content */}
			{(!effectiveCollapsed || isSidebar) && (
				<div className="flex h-full">
					{/* Sidebar de Conversas */}
					<div className="flex w-64 flex-col border-primary border-r bg-surface/50">
						<div className="border-primary border-b p-3">
							<button
								type="button"
								onClick={handleCreateConversation}
								className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-white transition-colors hover:bg-primary/80"
							>
								<Plus className="h-4 w-4" />
								Nova Conversa
							</button>
						</div>

						<div className="flex-1 overflow-y-auto p-2">
							{conversations?.map((conversation) => (
								// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
								<div
									key={conversation.id}
									onClick={() => setSelectedConversationId(conversation.id)}
									className={`cursor-pointer rounded-md p-2 transition-colors ${
										selectedConversationId === conversation.id
											? "border border-primary bg-primary/20"
											: "hover:bg-primary/10"
									}`}
								>
									<div className="truncate font-medium text-sm">
										{conversation.title}
									</div>
									<div className="mt-1 text-text-secondary text-xs">
										{new Date(conversation.updatedAt || new Date()).toLocaleDateString(
											"pt-BR",
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Área Principal do Chat */}
					<div className="flex flex-1 flex-col">
						{selectedConversationId ? (
							<>
								{/* Header da Conversa */}
								<div className="flex items-center justify-between border-primary border-b bg-surface/50 p-3">
									<div className="flex items-center gap-2">
										<MessageCircle className="h-4 w-4 text-primary" />
										<span className="font-medium">
											{selectedConversationData?.conversation.title}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() => setShowSystemPromptModal(true)}
											className="rounded p-1 transition-colors hover:bg-primary/20"
											title="Editar System Prompt"
										>
											<Brain className="h-4 w-4 text-primary" />
										</button>
										<button
											type="button"
											onClick={() => setShowTemplatesModal(true)}
											className="rounded p-1 transition-colors hover:bg-primary/20"
											title="Gerenciar Templates"
										>
											<Settings className="h-4 w-4 text-primary" />
										</button>
										<button
											type="button"
											onClick={() =>
												deleteConversation.mutate({
													id: selectedConversationId,
												})
											}
											className="rounded p-1 text-red-500 transition-colors hover:bg-red-500/20"
											title="Excluir Conversa"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
								</div>

								{/* Mensagens */}
								<div className="max-h-[calc(100vh-200px)] flex-1 space-y-3 overflow-y-auto p-3">
									{selectedConversationData?.messages.map((message) => (
										<div
											key={message.id}
											className={`flex ${
												message.role === "user"
													? "justify-end"
													: "justify-start"
											}`}
										>
											<div
												className={`max-w-[70%] rounded-lg p-3 ${
													message.role === "user"
														? "bg-primary text-white"
														: "border border-primary bg-surface"
												}`}
											>
												<div className="whitespace-pre-wrap text-sm">
													{message.content}
												</div>
												<div
													className={`mt-2 text-xs ${
														message.role === "user"
															? "text-primary-100"
															: "text-text-secondary"
													}`}
												>
													{new Date(message.createdAt).toLocaleTimeString(
														"pt-BR",
													)}
												</div>
											</div>
										</div>
									))}

									{isLoading && (
										<div className="flex justify-start">
											<div className="rounded-lg border border-primary bg-surface p-3">
												<div className="text-sm text-text-secondary">
													<span className="animate-pulse">▋</span> IA está
													digitando...
												</div>
											</div>
										</div>
									)}

									<div ref={messagesEndRef} />
								</div>

								{/* Input de Mensagem */}
								<div className="border-primary border-t bg-surface p-3">
									<form
										onSubmit={(e) => {
											e.preventDefault();
											handleSendMessage();
										}}
									>
										<div className="flex items-center gap-2">
											<input
												ref={inputRef}
												type="text"
												value={inputMessage}
												onChange={(e) => setInputMessage(e.target.value)}
												disabled={isLoading}
												className="flex-1 rounded-md border border-primary/30 bg-surface px-3 py-2 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-primary"
												placeholder="Digite sua mensagem..."
												autoComplete="off"
											/>
											<button
												type="submit"
												disabled={!inputMessage.trim() || isLoading}
												className="rounded-md bg-primary p-2 text-white transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
											>
												<Send className="h-4 w-4" />
											</button>
										</div>
									</form>
								</div>
							</>
						) : (
							<div className="flex flex-1 items-center justify-center text-text-secondary">
								<div className="text-center">
									<MessageSquare className="mx-auto mb-3 h-12 w-12 text-primary/50" />
									<p>Selecione uma conversa ou crie uma nova</p>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Modal de System Prompt - Melhorado */}
			{showSystemPromptModal && selectedConversationData && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="max-h-[90vh] w-full max-w-[min(95vw,1200px)] overflow-y-auto rounded-lg border border-primary bg-surface p-3 lg:p-4">
						<div className="mb-3 flex items-center justify-between lg:mb-4">
							<h3 className="font-semibold text-lg">Editar System Prompt</h3>
							<button
								type="button"
								onClick={() => setShowSystemPromptModal(false)}
								className="rounded p-1 transition-colors hover:bg-primary/20"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-2">
							{/* Editor */}
							<div>
								<p className="mb-2 block font-medium text-sm">
									System Prompt da Conversa
								</p>
								<textarea
									value={editingSystemPrompt}
									onChange={(e) => setEditingSystemPrompt(e.target.value)}
									className="h-48 w-full resize-none rounded-md border border-primary/30 bg-surface p-3 font-mono text-sm text-text-primary lg:h-64"
									placeholder="Digite o system prompt que define o comportamento da IA nesta conversa..."
								/>
								<div className="mt-2 text-text-secondary text-xs">
									{editingSystemPrompt.length} caracteres
								</div>
							</div>

							{/* Preview */}
							<div>
								<div className="mb-2 flex items-center justify-between">
									<p className="block font-medium text-sm">
										Preview do Comportamento
									</p>
									<button
										type="button"
										onClick={() =>
											setShowSystemPromptPreview(!showSystemPromptPreview)
										}
										className="flex items-center gap-1 text-primary text-xs hover:text-primary/80"
									>
										{showSystemPromptPreview ? (
											<EyeOff className="h-3 w-3" />
										) : (
											<Eye className="h-3 w-3" />
										)}
										{showSystemPromptPreview ? "Ocultar" : "Mostrar"}
									</button>
								</div>

								{showSystemPromptPreview ? (
									<div className="h-48 overflow-y-auto rounded-md border border-primary/30 bg-surface/50 p-4 lg:h-64">
										<div className="whitespace-pre-wrap text-sm text-text-primary">
											{editingSystemPrompt ||
												"Digite um system prompt para ver o preview aqui..."}
										</div>
									</div>
								) : (
									<div className="flex h-48 items-center justify-center rounded-md border border-primary/30 bg-surface/50 p-4 lg:h-64">
										<div className="text-center text-text-secondary">
											<Eye className="mx-auto mb-2 h-8 w-8 opacity-50" />
											<p className="text-sm">
												Clique em "Mostrar" para ver o preview
											</p>
										</div>
									</div>
								)}

								{/* Dicas */}
								<div className="mt-4 rounded-md bg-primary/10 p-3">
									<h4 className="mb-2 font-medium text-sm">
										💡 Dicas para System Prompts:
									</h4>
									<ul className="space-y-1 text-text-secondary text-xs">
										<li>
											• Defina o papel da IA (ex: "Você é um analista
											técnico...")
										</li>
										<li>• Especifique o tom e estilo de resposta</li>
										<li>
											• Inclua contexto sobre o domínio (tecnologia, notícias,
											etc.)
										</li>
										<li>• Defina limitações ou regras específicas</li>
									</ul>
								</div>
							</div>
						</div>

						<div className="mt-4 flex justify-end gap-2 lg:mt-6">
							<button
								type="button"
								onClick={() => setShowSystemPromptModal(false)}
								className="rounded-md border border-primary/30 px-4 py-2 transition-colors hover:bg-primary/10"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={handleUpdateSystemPrompt}
								disabled={isUpdatingSystemPrompt || !editingSystemPrompt.trim()}
								className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isUpdatingSystemPrompt ? (
									<>
										<span className="animate-spin">⏳</span>
										Salvando...
									</>
								) : (
									<>
										<Save className="h-4 w-4" />
										Salvar System Prompt
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal de Templates */}
			{showTemplatesModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="max-h-[85vh] w-full max-w-[min(95vw,1200px)] overflow-y-auto rounded-lg border border-primary bg-surface p-3 lg:p-4">
						<div className="mb-3 flex items-center justify-between lg:mb-4">
							<h3 className="font-semibold text-lg">
								Gerenciar System Prompts
							</h3>
							<button
								type="button"
								onClick={() => setShowTemplatesModal(false)}
								className="rounded p-1 transition-colors hover:bg-primary/20"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Lista de Templates */}
						<div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
							{systemPromptTemplates?.map((template) => (
								<div
									key={template.id}
									className="rounded-lg border border-primary/30 bg-surface/50 p-4"
								>
									<div className="mb-2 flex items-start justify-between">
										<div>
											<h4 className="font-medium">{template.name}</h4>
											{template.isDefault && (
												<span className="rounded-full bg-primary/20 px-2 py-1 text-primary text-xs">
													Padrão
												</span>
											)}
										</div>
										<div className="flex items-center gap-1">
											<button
												type="button"
												onClick={() => setEditingTemplate(template as SystemPromptTemplate)}
												className="rounded p-1 transition-colors hover:bg-primary/20"
												title="Editar"
											>
												<Edit3 className="h-4 w-4 text-primary" />
											</button>
											<button
												type="button"
												onClick={() => handleDeleteTemplate(template.id)}
												className="rounded p-1 text-red-500 transition-colors hover:bg-red-500/20"
												title="Excluir"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
									</div>
									{template.description && (
										<p className="mb-2 text-sm text-text-secondary">
											{template.description}
										</p>
									)}
									<p className="mb-3 line-clamp-3 text-sm text-text-primary">
										{template.prompt}
									</p>
									<button
										type="button"
										onClick={() => handleUseTemplate(template as SystemPromptTemplate)}
										className="w-full rounded-md bg-primary/20 px-3 py-2 text-primary text-sm transition-colors hover:bg-primary/30"
									>
										Usar Template
									</button>
								</div>
							))}
						</div>

						{/* Formulário para Novo Template */}
						<div className="border-primary/30 border-t pt-3 lg:pt-4">
							<h4 className="mb-2 font-medium lg:mb-3">Criar Novo Template</h4>
							<div className="space-y-3">
								<input
									type="text"
									value={newTemplate.name}
									onChange={(e) =>
										setNewTemplate({ ...newTemplate, name: e.target.value })
									}
									placeholder="Nome do template"
									className="w-full rounded-md border border-primary/30 bg-surface px-3 py-2 text-text-primary"
								/>
								<input
									type="text"
									value={newTemplate.description}
									onChange={(e) =>
										setNewTemplate({
											...newTemplate,
											description: e.target.value,
										})
									}
									placeholder="Descrição (opcional)"
									className="w-full rounded-md border border-primary/30 bg-surface px-3 py-2 text-text-primary"
								/>
								<textarea
									value={newTemplate.prompt}
									onChange={(e) =>
										setNewTemplate({ ...newTemplate, prompt: e.target.value })
									}
									placeholder="System prompt"
									className="h-20 w-full resize-none rounded-md border border-primary/30 bg-surface p-3 text-text-primary lg:h-24"
								/>
								<div className="flex items-center gap-2">
									<input
										type="checkbox"
										id="isDefault"
										checked={newTemplate.isDefault}
										onChange={(e) =>
											setNewTemplate({
												...newTemplate,
												isDefault: e.target.checked,
											})
										}
										className="rounded border-primary/30"
									/>
									<label htmlFor="isDefault" className="text-sm">
										Definir como padrão
									</label>
								</div>
								<button
									type="button"
									onClick={handleSaveTemplate}
									disabled={
										!newTemplate.name.trim() || !newTemplate.prompt.trim()
									}
									className="w-full rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<Save className="mr-2 inline h-4 w-4" />
									Salvar Template
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Modal de Edição de Template */}
			{editingTemplate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-[min(95vw,600px)] rounded-lg border border-primary bg-surface p-3 lg:p-4">
						<h3 className="mb-3 font-semibold text-lg lg:mb-4">
							Editar Template
						</h3>
						<div className="space-y-3">
							<input
								type="text"
								value={editingTemplate.name}
								onChange={(e) =>
									setEditingTemplate({
										...editingTemplate,
										name: e.target.value,
									})
								}
								placeholder="Nome do template"
								className="w-full rounded-md border border-primary/30 bg-surface px-3 py-2 text-text-primary"
							/>
							<input
								type="text"
								value={editingTemplate.description}
								onChange={(e) =>
									setEditingTemplate({
										...editingTemplate,
										description: e.target.value,
									})
								}
								placeholder="Descrição (opcional)"
								className="w-full rounded-md border border-primary/30 bg-surface px-3 py-2 text-text-primary"
							/>
							<textarea
								value={editingTemplate.prompt}
								onChange={(e) =>
									setEditingTemplate({
										...editingTemplate,
										prompt: e.target.value,
									})
								}
								placeholder="System prompt"
								className="h-28 w-full resize-none rounded-md border border-primary/30 bg-surface p-3 text-text-primary lg:h-32"
							/>
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="editIsDefault"
									checked={editingTemplate.isDefault}
									onChange={(e) =>
										setEditingTemplate({
											...editingTemplate,
											isDefault: e.target.checked,
										})
									}
									className="rounded border-primary/30"
								/>
								<label htmlFor="editIsDefault" className="text-sm">
									Definir como padrão
								</label>
							</div>
						</div>
						<div className="mt-3 flex justify-end gap-2 lg:mt-4">
							<button
								type="button"
								onClick={() => setEditingTemplate(null)}
								className="rounded-md border border-primary/30 px-4 py-2 transition-colors hover:bg-primary/10"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={handleUpdateTemplate}
								className="rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/80"
							>
								<Save className="mr-2 inline h-4 w-4" />
								Salvar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
