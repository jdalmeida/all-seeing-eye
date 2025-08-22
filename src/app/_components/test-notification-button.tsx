"use client";

import { useNotificationContext } from "@/app/_contexts/notification-context";
import { Zap } from "lucide-react";

export function TestNotificationButton() {
	const { addNotification } = useNotificationContext();

	const handleTestNotification = () => {
		const testNotifications = [
			{
				type: "info" as const,
				title: "📰 Alerta de Notícias",
				message: "ALERTA: 'Bitcoin' em 3 fontes hoje (limite 2)",
				duration: 5000,
			},
			{
				type: "warning" as const,
				title: "⚠️ Alerta de Criptomoeda",
				message: "ALERTA: BTC caiu 5.23% nas últimas 24h (limite 5%)",
				duration: 7000,
			},
			{
				type: "error" as const,
				title: "🚨 ALERTA CRÍTICO",
				message:
					"ALERTA: Mercado em queda acentuada - ação imediata necessária",
				duration: 10000,
			},
			{
				type: "success" as const,
				title: "💬 Chat AI Integrado",
				message:
					"Sistema de notificações funcionando perfeitamente com o chat!",
				duration: 8000,
			},
		];

		// Adicionar notificações com delay para simular chegada em tempo real
		testNotifications.forEach((notification, index) => {
			setTimeout(() => {
				addNotification(notification);
			}, index * 800); // 800ms entre cada notificação para demonstração mais fluida
		});
	};

	return (
		<button
			type="button"
			onClick={handleTestNotification}
			className="group rounded p-2 transition-colors hover:bg-primary/20"
			title="Testar Notificações"
		>
			<Zap className="h-5 w-5 text-text-secondary transition-colors group-hover:text-primary" />

			{/* Tooltip */}
			<div className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 mb-2 transform whitespace-nowrap rounded bg-black px-2 py-1 text-white text-xs opacity-0 transition-opacity group-hover:opacity-100">
				Testar Sistema de Notificações
			</div>
		</button>
	);
}
