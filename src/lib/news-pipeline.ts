import { fetchNewsFromFeeds } from './rss';
import { generateInsight } from './ai';
import { db } from '@/server/db';
import { news, insights } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function runNewsPipeline() {
  try {
    console.log('Starting news pipeline...');

    // 1. Fetch news from RSS feeds
    const newsItems = await fetchNewsFromFeeds();
    console.log(`Fetched ${newsItems.length} news items`);

    // 2. Filter out existing news to avoid duplicates
    const existingNewsIds = await db
      .select({ id: news.id })
      .from(news)
      .where(eq(news.id, newsItems.map(item => item.id)));

    const existingIds = new Set(existingNewsIds.map(n => n.id));
    const newNewsItems = newsItems.filter(item => !existingIds.has(item.id));

    console.log(`Found ${newNewsItems.length} new news items to process`);

    // 3. Save new news items
    if (newNewsItems.length > 0) {
      await db.insert(news).values(
        newNewsItems.map(item => ({
          id: item.id,
          title: item.title,
          link: item.link,
          source: item.source,
          publishedAt: item.publishedAt,
        }))
      );
      console.log(`Saved ${newNewsItems.length} news items`);
    }

    // 4. Generate insights for new news items
    for (const newsItem of newNewsItems) {
      try {
        console.log(`Generating insight for: ${newsItem.title}`);
        const insightContent = await generateInsight(newsItem.title, newsItem.link);

        // Save insight
        await db.insert(insights).values({
          newsId: newsItem.id,
          userId: null, // Global insight
          content: insightContent,
        });

        console.log(`Generated and saved insight for: ${newsItem.title}`);

        // Add a small delay to avoid overwhelming the OpenAI API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating insight for ${newsItem.title}:`, error);
      }
    }

    console.log('News pipeline completed successfully');
  } catch (error) {
    console.error('Error running news pipeline:', error);
  }
}

// Function to start the cron job
export function startNewsCronJob() {
  // For Next.js, we'll use a different approach since node-cron doesn't work well with Next.js
  // We'll use Next.js built-in cron or manual intervals for development
  if (process.env.NODE_ENV === 'production') {
    // In production, you can use @vercel/cron or similar
    console.log('News cron job initialized for production');
  } else {
    // In development, run every 30 minutes
    const interval = setInterval(() => {
      runNewsPipeline();
    }, 30 * 60 * 1000); // 30 minutes

    console.log('News cron job started (runs every 30 minutes in development)');

    // Run once immediately for testing
    runNewsPipeline();

    return interval;
  }
}
