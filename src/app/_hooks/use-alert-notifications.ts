import { useNotificationContext } from "@/app/_contexts/notification-context";
import { useEffect } from "react";
import { useNotifications } from "./use-notifications";

export function useAlertNotifications() {
	const { notifications: alertNotifications, unreadCount } = useNotifications();
	const { addNotification } = useNotificationContext();

	// Monitorar novas notificações e criar toasts
	useEffect(() => {
		if (alertNotifications.length > 0) {
			const latestNotification = alertNotifications[0];

			// Verificar se é uma notificação recente (últimos 30 segundos)
			const isRecent =
				Date.now() - latestNotification.createdAt.getTime() < 30000;

			if (isRecent && !latestNotification.isRead) {
				// Determinar o tipo de notificação baseado no conteúdo
				let type: "info" | "success" | "warning" | "error" = "info";
				let title = "Alerta do Sistema";

				if (latestNotification.message.includes("ALERTA")) {
					type = "error";
					title = "🚨 ALERTA CRÍTICO";
				} else if (latestNotification.message.includes("caiu")) {
					type = "warning";
					title = "⚠️ Alerta de Criptomoeda";
				} else if (latestNotification.message.includes("fontes")) {
					type = "info";
					title = "📰 Alerta de Notícias";
				}

				// Criar toast de notificação
				addNotification({
					type,
					title,
					message: latestNotification.message,
					duration: type === "error" ? 10000 : 7000, // Alertas críticos ficam mais tempo
				});
			}
		}
	}, [alertNotifications, addNotification]);

	return { unreadCount };
}
