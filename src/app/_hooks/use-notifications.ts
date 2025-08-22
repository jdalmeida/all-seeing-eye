import { api } from "@/trpc/react";
import { useEffect, useState } from "react";

export interface Notification {
	id: number;
	message: string;
	context?: string;
	createdAt: Date;
	isRead: boolean;
}

export function useNotifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	// Buscar notificações existentes
	const { data: alertEvents, refetch: refetchEvents } =
		api.alerts.events.useQuery(undefined, {
			refetchInterval: 30000, // Atualizar a cada 30 segundos
			refetchOnWindowFocus: true,
		});

	// Buscar regras de alerta ativas
	const { data: alertRules } = api.alerts.list.useQuery();

	// Converter alert events para notificações
	useEffect(() => {
		if (alertEvents) {
			const newNotifications: Notification[] = alertEvents.map((event) => ({
				id: event.id,
				message: event.message,
				context: event.context || undefined,
				createdAt: new Date(event.createdAt),
				isRead: false,
			}));

			setNotifications(newNotifications);
			setUnreadCount(newNotifications.filter((n) => !n.isRead).length);
		}
	}, [alertEvents]);

	// Marcar notificação como lida
	const markAsRead = (id: number) => {
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
		);
		setUnreadCount((prev) => Math.max(0, prev - 1));
	};

	// Marcar todas como lidas
	const markAllAsRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
		setUnreadCount(0);
	};

	// Adicionar nova notificação (para testes)
	const addNotification = (message: string, context?: string) => {
		const newNotification: Notification = {
			id: Date.now(),
			message,
			context,
			createdAt: new Date(),
			isRead: false,
		};

		setNotifications((prev) => [newNotification, ...prev]);
		setUnreadCount((prev) => prev + 1);
	};

	// Remover notificação
	const removeNotification = (id: number) => {
		setNotifications((prev) => {
			const notification = prev.find((n) => n.id === id);
			if (notification && !notification.isRead) {
				setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
			}
			return prev.filter((n) => n.id !== id);
		});
	};

	// Limpar todas as notificações
	const clearAll = () => {
		setNotifications([]);
		setUnreadCount(0);
	};

	return {
		notifications,
		unreadCount,
		isLoading,
		markAsRead,
		markAllAsRead,
		addNotification,
		removeNotification,
		clearAll,
		refetch: refetchEvents,
	};
}
