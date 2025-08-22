import { useNotificationContext } from "@/app/_contexts/notification-context";

export function useChatNotifications() {
	const { addNotification } = useNotificationContext();

	// Notificar sobre nova conversa criada
	const notifyNewConversation = (title: string) => {
		addNotification({
			type: "success",
			title: "💬 Nova Conversa Criada",
			message: `Conversa "${title}" foi criada com sucesso`,
			duration: 3000,
		});
	};

	// Notificar sobre mensagem enviada
	const notifyMessageSent = () => {
		addNotification({
			type: "info",
			title: "📤 Mensagem Enviada",
			message: "Sua mensagem foi enviada para a IA",
			duration: 2000,
		});
	};

	// Notificar sobre resposta da IA
	const notifyAIResponse = () => {
		addNotification({
			type: "success",
			title: "🤖 Resposta da IA",
			message: "A IA respondeu à sua mensagem",
			duration: 3000,
		});
	};

	// Notificar sobre erro na comunicação
	const notifyError = (error: string) => {
		addNotification({
			type: "error",
			title: "❌ Erro no Chat",
			message: `Erro: ${error}`,
			duration: 5000,
		});
	};

	// Notificar sobre system prompt atualizado
	const notifySystemPromptUpdated = () => {
		addNotification({
			type: "success",
			title: "⚙️ System Prompt Atualizado",
			message: "O comportamento da IA foi configurado",
			duration: 3000,
		});
	};

	// Notificar sobre template criado
	const notifyTemplateCreated = (name: string) => {
		addNotification({
			type: "success",
			title: "📝 Template Criado",
			message: `Template "${name}" foi salvo com sucesso`,
			duration: 3000,
		});
	};

	// Notificar sobre insights importantes
	const notifyImportantInsight = (insight: string) => {
		addNotification({
			type: "warning",
			title: "💡 Insight Importante",
			message:
				insight.length > 100 ? `${insight.substring(0, 100)}...` : insight,
			duration: 7000,
		});
	};

	// Notificar sobre análise de notícias
	const notifyNewsAnalysis = (newsCount: number) => {
		addNotification({
			type: "info",
			title: "📰 Análise de Notícias",
			message: `${newsCount} notícias foram analisadas pela IA`,
			duration: 4000,
		});
	};

	return {
		notifyNewConversation,
		notifyMessageSent,
		notifyAIResponse,
		notifyError,
		notifySystemPromptUpdated,
		notifyTemplateCreated,
		notifyImportantInsight,
		notifyNewsAnalysis,
	};
}
