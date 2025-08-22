import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { insights, news } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export const newsRouter = createTRPCRouter({
	// Get all news with insights
	getAll: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { limit, offset } = input;

			// Fetch news with insights
			const newsWithInsights = await ctx.db
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
				.orderBy(desc(news.publishedAt))
				.limit(limit)
				.offset(offset);

			// Group insights by news item
			const newsMap = new Map();

			for (const row of newsWithInsights) {
				const newsId = row.id;
				if (!newsMap.has(newsId)) {
					newsMap.set(newsId, {
						id: row.id,
						title: row.title,
						link: row.link,
						source: row.source,
						publishedAt: row.publishedAt,
						createdAt: row.createdAt,
						insights: [] as Array<{
							id: number;
							content: string;
							createdAt: Date;
						}>,
					});
				}

				if (row.insights?.id) {
					newsMap.get(newsId)?.insights.push({
						id: row.insights.id,
						content: row.insights.content,
						createdAt: row.insights.createdAt,
					});
				}
			}

			const result = Array.from(newsMap.values());

			return {
				success: true,
				data: result,
				pagination: {
					limit,
					offset,
					hasMore: result.length === limit,
				},
			};
		}),

	// Get a single news item by ID with its insights
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const newsWithInsights = await ctx.db
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
				.where(eq(news.id, input.id));

			const firstRow = newsWithInsights[0];
			if (!firstRow) {
				throw new Error("News item not found");
			}

			const newsItem = {
				id: firstRow.id,
				title: firstRow.title,
				link: firstRow.link,
				source: firstRow.source,
				publishedAt: firstRow.publishedAt,
				createdAt: firstRow.createdAt,
				insights: newsWithInsights
					.filter((row) => row.insights?.id)
					.map((row) => ({
						id: row.insights?.id,
						content: row.insights?.content,
						createdAt: row.insights?.createdAt,
					})),
			};

			return newsItem;
		}),
});
