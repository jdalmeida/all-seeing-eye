import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/server/db';
import { news, insights } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch news with insights
    const newsWithInsights = await db
      .select({
        id: news.id,
        title: news.title,
        link: news.link,
        source: news.source,
        publishedAt: news.publishedAt,
        createdAt: news.createdAt,
        insights: {
          id: insights.id,
          content: insights.content,
          createdAt: insights.createdAt,
        },
      })
      .from(news)
      .leftJoin(insights, eq(news.id, insights.newsId))
      .orderBy(news.publishedAt)
      .limit(limit)
      .offset(offset);

    // Group insights by news item
    const newsMap = new Map();

    newsWithInsights.forEach(row => {
      const newsId = row.id;
      if (!newsMap.has(newsId)) {
        newsMap.set(newsId, {
          id: row.id,
          title: row.title,
          link: row.link,
          source: row.source,
          publishedAt: row.publishedAt,
          createdAt: row.createdAt,
          insights: [],
        });
      }

      if (row.insights.id) {
        newsMap.get(newsId).insights.push({
          id: row.insights.id,
          content: row.insights.content,
          createdAt: row.insights.createdAt,
        });
      }
    });

    const result = Array.from(newsMap.values());

    return NextResponse.json({
      success: true,
      data: result,
      pagination: {
        limit,
        offset,
        hasMore: result.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
