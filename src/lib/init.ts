import { startNewsCronJob } from "./news-pipeline";
import { evaluateAlertRules } from "@/lib/alerts/engine";

// Initialize the news cron job
export function initNewsPipeline() {
	if (typeof window === "undefined") {
		// Only run on server-side
		startNewsCronJob();
		// Avaliar regras a cada 5 minutos em desenvolvimento
		if (process.env.NODE_ENV !== "production") {
			setInterval(() => {
				void evaluateAlertRules();
			}, 5 * 60 * 1000);
		}
	}
}
