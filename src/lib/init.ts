import { startNewsCronJob } from './news-pipeline';

// Initialize the news cron job
export function initNewsPipeline() {
  if (typeof window === 'undefined') {
    // Only run on server-side
    startNewsCronJob();
  }
}
