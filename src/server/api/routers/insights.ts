import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { insights } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export const insightRouter = createTRPCRouter({
	// Get all insights for the authenticated user
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.auth.userId;

		const userInsights = await ctx.db.query.insights.findMany({
			where: eq(insights.userId, userId),
			orderBy: [desc(insights.date)],
		});

		return userInsights;
	}),

	// Get a single insight by ID (only if it belongs to the user)
	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.auth.userId;

			const insight = await ctx.db.query.insights.findFirst({
				where: (insights, { eq, and }) =>
					and(eq(insights.id, input.id), eq(insights.userId, userId)),
			});

			if (!insight) {
				throw new Error("Insight not found or access denied");
			}

			return insight;
		}),

	// Create a new insight
	create: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1).max(500),
				content: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.auth.userId;

			const newInsight = await ctx.db
				.insert(insights)
				.values({
					title: input.title,
					content: input.content,
					userId: userId,
				})
				.returning();

			return newInsight[0];
		}),

	// Update an existing insight (only if it belongs to the user)
	update: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				title: z.string().min(1).max(500),
				content: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.auth.userId;

			const updatedInsight = await ctx.db
				.update(insights)
				.set({
					title: input.title,
					content: input.content,
					updatedAt: new Date(),
				})
				.where((insights, { eq, and }) =>
					and(eq(insights.id, input.id), eq(insights.userId, userId)),
				)
				.returning();

			if (updatedInsight.length === 0) {
				throw new Error("Insight not found or access denied");
			}

			return updatedInsight[0];
		}),

	// Delete an insight (only if it belongs to the user)
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.auth.userId;

			const deletedInsight = await ctx.db
				.delete(insights)
				.where((insights, { eq, and }) =>
					and(eq(insights.id, input.id), eq(insights.userId, userId)),
				)
				.returning();

			if (deletedInsight.length === 0) {
				throw new Error("Insight not found or access denied");
			}

			return { success: true };
		}),
});
