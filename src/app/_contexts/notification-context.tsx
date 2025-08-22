"use client";

import { AlertTriangle, Bell, CheckCircle, Info, X } from "lucide-react";
import { createContext, useContext, useState } from "react";

interface ToastNotification {
	id: string;
	type: "info" | "success" | "warning" | "error";
	title: string;
	message: string;
	duration?: number;
}

interface NotificationContextType {
	notifications: ToastNotification[];
	addNotification: (notification: Omit<ToastNotification, "id">) => void;
	removeNotification: (id: string) => void;
	clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined,
);

export function useNotificationContext() {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			"useNotificationContext must be used within a NotificationProvider",
		);
	}
	return context;
}

interface NotificationProviderProps {
	children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
	const [notifications, setNotifications] = useState<ToastNotification[]>([]);

	const addNotification = (notification: Omit<ToastNotification, "id">) => {
		const id = Math.random().toString(36).substr(2, 9);
		const newNotification: ToastNotification = {
			...notification,
			id,
			duration: notification.duration || 5000,
		};

		setNotifications((prev) => [...prev, newNotification]);

		// Auto-remove after duration
		if (newNotification.duration && newNotification.duration > 0) {
			setTimeout(() => {
				removeNotification(id);
			}, newNotification.duration);
		}
	};

	const removeNotification = (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	const clearAll = () => {
		setNotifications([]);
	};

	const getIcon = (type: ToastNotification["type"]) => {
		switch (type) {
			case "success":
				return <CheckCircle className="h-5 w-5 text-green-500" />;
			case "warning":
				return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
			case "error":
				return <AlertTriangle className="h-5 w-5 text-red-500" />;
			default:
				return <Info className="h-5 w-5 text-blue-500" />;
		}
	};

	const getBorderColor = (type: ToastNotification["type"]) => {
		switch (type) {
			case "success":
				return "border-green-500/30 bg-green-500/10";
			case "warning":
				return "border-yellow-500/30 bg-yellow-500/10";
			case "error":
				return "border-red-500/30 bg-red-500/10";
			default:
				return "border-blue-500/30 bg-blue-500/10";
		}
	};

	return (
		<NotificationContext.Provider
			value={{ notifications, addNotification, removeNotification, clearAll }}
		>
			{children}

			{/* Toast Notifications */}
			<div className="fixed top-4 right-4 z-[999999] space-y-2">
				{notifications.map((notification) => (
					<div
						key={notification.id}
						className={`flex items-start gap-3 rounded-lg border p-4 ${getBorderColor(notification.type)} slide-in-from-right max-w-sm animate-in shadow-lg duration-300`}
					>
						{getIcon(notification.type)}
						<div className="min-w-0 flex-1">
							<h4 className="font-medium text-sm text-text-primary">
								{notification.title}
							</h4>
							<p className="mt-1 text-sm text-text-secondary">
								{notification.message}
							</p>
						</div>
						<button
							type="button"
							onClick={() => removeNotification(notification.id)}
							className="flex-shrink-0 rounded p-1 transition-colors hover:bg-black/20"
						>
							<X className="h-4 w-4 text-text-secondary" />
						</button>
					</div>
				))}
			</div>
		</NotificationContext.Provider>
	);
}
