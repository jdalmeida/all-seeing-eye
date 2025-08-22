"use client";

import { useNotifications } from "@/app/_hooks/use-notifications";

export function NotificationCounter() {
	const { unreadCount } = useNotifications();

	return (
		<div className="rounded border border-primary/40 bg-black/40 p-4">
			<div className="text-text-secondary text-xs">Notificações</div>
			<div className="font-bold text-lg text-neon">{unreadCount}</div>
		</div>
	);
}
