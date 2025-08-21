import Parser from 'rss-parser';
import crypto from 'crypto';

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  publishedAt: Date;
  source: string;
}

interface RSSFeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
}

const RSS_FEEDS = [
  {
    url: 'https://hnrss.org/frontpage',
    name: 'Hacker News'
  },
  {
    url: 'https://techcrunch.com/feed/',
    name: 'TechCrunch'
  },
  {
    url: 'https://www.theverge.com/rss/index.xml',
    name: 'The Verge'
  }
];

export async function fetchNewsFromFeeds(): Promise<NewsItem[]> {
  const parser = new Parser();
  const allNews: NewsItem[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching news from ${feed.name}...`);
      const feedData = await parser.parseURL(feed.url);

      if (!feedData.items) continue;

      const feedNews = feedData.items.slice(0, 10).map((item: RSSFeedItem) => {
        const title = item.title || 'No Title';
        const link = item.link || '';
        const publishedAt = item.pubDate ? new Date(item.pubDate) :
                          item.isoDate ? new Date(item.isoDate) :
                          new Date();

        // Create unique ID based on title and link
        const hash = crypto.createHash('md5').update(`${title}${link}`).digest('hex');

        return {
          id: hash,
          title,
          link,
          publishedAt,
          source: feed.name
        };
      });

      allNews.push(...feedNews);
    } catch (error) {
      console.error(`Error fetching news from ${feed.name}:`, error);
    }
  }

  // Sort by published date (newest first)
  return allNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}
