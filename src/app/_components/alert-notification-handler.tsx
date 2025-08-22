"use client";

import { useAlertNotifications } from "@/app/_hooks/use-alert-notifications";

export function AlertNotificationHandler() {
	// Este componente apenas ativa o hook de notificações
	// Não renderiza nada visualmente
	useAlertNotifications();

	return null;
}
