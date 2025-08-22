"use client";

import { useNotificationContext } from "@/app/_contexts/notification-context";
import {
	AlertTriangle,
	Bell,
	CheckCircle,
	MessageSquare,
	Zap,
} from "lucide-react";

export function NotificationDemo() {
	const { addNotification } = useNotificationContext();

	const demoNotifications = [
		{
			type: "success" as const,
			title: "🤖 Chat AI Ativo",
			message: "Sistema de notificações integrado com sucesso ao chat AI",
			duration: 6000,
		},
		{
			type: "info" as const,
			title: "📊 Monitoramento em Tempo Real",
			message:
				"Alertas de criptomoedas e notícias sendo monitorados automaticamente",
			duration: 7000,
		},
		{
			type: "warning" as const,
			title: "⚠️ Sistema de Alertas",
			message:
				"Configurações de alerta personalizáveis para diferentes tipos de eventos",
			duration: 8000,
		},
	];

	const handleDemo = () => {
		demoNotifications.forEach((notification, index) => {
			setTimeout(() => {
				addNotification(notification);
			}, index * 1000);
		});
	};

	return (
		<div className="fixed bottom-4 left-4 z-[999999]">
			<div className="max-w-sm rounded-lg border border-primary bg-surface p-4 shadow-lg">
				<div className="mb-3 flex items-center gap-2">
					<Bell className="h-5 w-5 text-primary" />
					<h3 className="font-semibold text-sm text-text-primary">
						Sistema de Notificações
					</h3>
				</div>

				<div className="mb-3 space-y-2">
					<div className="flex items-center gap-2 text-text-secondary text-xs">
						<CheckCircle className="h-3 w-3 text-green-500" />
						<span>Integrado com Chat AI</span>
					</div>
					<div className="flex items-center gap-2 text-text-secondary text-xs">
						<AlertTriangle className="h-3 w-3 text-yellow-500" />
						<span>Alertas em tempo real</span>
					</div>
					<div className="flex items-center gap-2 text-text-secondary text-xs">
						<MessageSquare className="h-3 w-3 text-blue-500" />
						<span>Notificações contextuais</span>
					</div>
				</div>

				<button
					type="button"
					onClick={handleDemo}
					className="flex w-full items-center justify-center gap-2 rounded bg-primary px-3 py-2 text-black text-sm transition-colors hover:bg-primary/80"
				>
					<Zap className="h-4 w-4" />
					Demonstrar Integração
				</button>
			</div>
		</div>
	);
}
