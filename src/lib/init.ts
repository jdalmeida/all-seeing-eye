import { evaluateAlertRules } from "@/lib/alerts/engine";
import { startNewsCronJob } from "./news-pipeline";

// Initialize the news cron job
export function initNewsPipeline() {
	if (typeof window === "undefined") {
		// Only run on server-side
		startNewsCronJob();
		// Avaliar regras a cada 5 minutos em desenvolvimento
		if (process.env.NODE_ENV !== "production") {
			setInterval(
				() => {
					void evaluateAlertRules();
				},
				5 * 60 * 1000,
			);
		}
	}
}
