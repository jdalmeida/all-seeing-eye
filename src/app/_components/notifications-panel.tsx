"use client";

import { useNotifications } from "@/app/_hooks/use-notifications";
import {
	AlertTriangle,
	Bell,
	Check,
	CheckCircle,
	Info,
	Settings,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";

interface NotificationsPanelProps {
	isOpen: boolean;
	onClose: () => void;
}

export function NotificationsPanel({
	isOpen,
	onClose,
}: NotificationsPanelProps) {
	const {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
		removeNotification,
		clearAll,
	} = useNotifications();

	const [showSettings, setShowSettings] = useState(false);

	if (!isOpen) return null;

	const getNotificationIcon = (message: string) => {
		if (message.includes("ALERTA"))
			return <AlertTriangle className="h-4 w-4 text-red-500" />;
		if (message.includes("caiu"))
			return <AlertTriangle className="h-4 w-4 text-orange-500" />;
		if (message.includes("fontes"))
			return <Info className="h-4 w-4 text-blue-500" />;
		return <Info className="h-4 w-4 text-primary" />;
	};

	const getNotificationColor = (message: string) => {
		if (message.includes("ALERTA")) return "border-red-500/30 bg-red-500/10";
		if (message.includes("caiu"))
			return "border-orange-500/30 bg-orange-500/10";
		if (message.includes("fontes")) return "border-blue-500/30 bg-blue-500/10";
		return "border-primary/30 bg-primary/10";
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/4 z-[999999] max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg border border-primary bg-surface">
				{/* Header */}
				<div className="flex items-center justify-between border-primary border-b p-4">
					<div className="flex items-center gap-3">
						<Bell className="h-5 w-5 text-primary" />
						<h2 className="font-semibold text-lg text-text-primary">
							Notificações
							{unreadCount > 0 && (
								<span className="ml-2 rounded-full bg-primary px-2 py-1 text-black text-xs">
									{unreadCount}
								</span>
							)}
						</h2>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setShowSettings(!showSettings)}
							className="rounded p-2 transition-colors hover:bg-primary/20"
							title="Configurações"
						>
							<Settings className="h-4 w-4 text-text-secondary" />
						</button>
						<button
							type="button"
							onClick={onClose}
							className="rounded p-2 transition-colors hover:bg-primary/20"
							title="Fechar"
						>
							<X className="h-4 w-4 text-text-secondary" />
						</button>
					</div>
				</div>

				{/* Settings Panel */}
				{showSettings && (
					<div className="border-primary border-b bg-surface/50 p-4">
						<div className="flex items-center justify-between">
							<h3 className="font-medium text-text-primary">Configurações</h3>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={markAllAsRead}
									className="rounded bg-primary/20 px-3 py-1 text-primary text-sm transition-colors hover:bg-primary/30"
								>
									<Check className="mr-1 inline h-3 w-3" />
									Marcar todas como lidas
								</button>
								<button
									type="button"
									onClick={clearAll}
									className="rounded bg-red-500/20 px-3 py-1 text-red-500 text-sm transition-colors hover:bg-red-500/30"
								>
									<Trash2 className="mr-1 inline h-3 w-3" />
									Limpar todas
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Notifications List */}
				<div className="max-h-[60vh] overflow-y-auto">
					{notifications.length === 0 ? (
						<div className="p-8 text-center text-text-secondary">
							<Bell className="mx-auto mb-3 h-12 w-12 text-primary/30" />
							<p>Nenhuma notificação ainda</p>
							<p className="mt-1 text-xs">
								Os alertas aparecerão aqui automaticamente
							</p>
						</div>
					) : (
						<div className="space-y-3 p-4">
							{notifications.map((notification) => (
								<div
									key={notification.id}
									className={`rounded-lg border p-4 ${getNotificationColor(notification.message)} ${
										!notification.isRead ? "ring-2 ring-primary/20" : ""
									}`}
								>
									<div className="flex items-start justify-between">
										<div className="flex flex-1 items-start gap-3">
											{getNotificationIcon(notification.message)}
											<div className="flex-1">
												<p
													className={`text-sm ${!notification.isRead ? "font-medium" : ""}`}
												>
													{notification.message}
												</p>
												{notification.context && (
													<p className="mt-1 text-text-secondary text-xs">
														{notification.context}
													</p>
												)}
												<p className="mt-2 text-text-muted text-xs">
													{notification.createdAt.toLocaleString("pt-BR")}
												</p>
											</div>
										</div>
										<div className="ml-3 flex items-center gap-1">
											{!notification.isRead && (
												<button
													type="button"
													onClick={() => markAsRead(notification.id)}
													className="rounded p-1 transition-colors hover:bg-primary/20"
													title="Marcar como lida"
												>
													<Check className="h-3 w-3 text-primary" />
												</button>
											)}
											<button
												type="button"
												onClick={() => removeNotification(notification.id)}
												className="rounded p-1 transition-colors hover:bg-red-500/20"
												title="Remover"
											>
												<Trash2 className="h-3 w-3 text-red-500" />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="border-primary border-t bg-surface/50 p-4">
					<div className="flex items-center justify-between text-sm text-text-secondary">
						<span>
							{notifications.length} notificação
							{notifications.length !== 1 ? "es" : ""}
							{unreadCount > 0 &&
								` • ${unreadCount} não lida${unreadCount !== 1 ? "s" : ""}`}
						</span>
						<div className="flex items-center gap-2">
							<span className="text-xs">Atualiza automaticamente</span>
							<div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
