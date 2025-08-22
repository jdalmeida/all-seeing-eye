"use client";

import { useNotifications } from "@/app/_hooks/use-notifications";
import { Bell } from "lucide-react";
import { useState } from "react";
import { NotificationsPanel } from "./notifications-panel";

export function NotificationBell() {
	const { unreadCount } = useNotifications();
	const [isPanelOpen, setIsPanelOpen] = useState(false);

	const handleBellClick = () => {
		setIsPanelOpen(true);
	};

	const handleClosePanel = () => {
		setIsPanelOpen(false);
	};

	return (
		<>
			<button
				type="button"
				onClick={handleBellClick}
				className="group relative rounded p-2 transition-colors hover:bg-primary/20"
				title="Notificações"
			>
				<Bell className="h-5 w-5 text-text-secondary transition-colors group-hover:text-primary" />

				{/* Badge de notificações não lidas */}
				{unreadCount > 0 && (
					<span className="-top-1 -right-1 absolute flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500 font-bold text-white text-xs">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}

				{/* Tooltip */}
				<div className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 mb-2 transform whitespace-nowrap rounded bg-black px-2 py-1 text-white text-xs opacity-0 transition-opacity group-hover:opacity-100">
					{unreadCount > 0
						? `${unreadCount} notificação${unreadCount !== 1 ? "es" : ""} não lida${unreadCount !== 1 ? "s" : ""}`
						: "Nenhuma notificação"}
				</div>
			</button>

			{/* Painel de Notificações */}
			<NotificationsPanel isOpen={isPanelOpen} onClose={handleClosePanel} />
		</>
	);
}
