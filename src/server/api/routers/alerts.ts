import { parseNaturalLanguageRule } from "@/lib/alerts/parser";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { alertEvents, alertRules } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

export const alertsRouter = createTRPCRouter({
	list: protectedProcedure.query(async () => {
		const rules = await db
			.select()
			.from(alertRules)
			.orderBy(desc(alertRules.createdAt));
		return rules;
	}),

	create: protectedProcedure
		.input(
			z.object({
				text: z.string().min(5),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const parsed = parseNaturalLanguageRule(input.text);
			if (!parsed) {
				throw new Error(
					"Não foi possível entender a regra. Tente outra formulação.",
				);
			}
			const inserted = await db
				.insert(alertRules)
				.values({
					userId: ctx.session?.user?.id ?? null,
					ruleText: input.text,
					ruleType: parsed.ruleType,
					params: parsed,
					active: true,
				})
				.returning();
			return inserted[0];
		}),

	events: protectedProcedure.query(async () => {
		const rows = await db
			.select()
			.from(alertEvents)
			.orderBy(desc(alertEvents.createdAt))
			.limit(50);
		return rows;
	}),

	toggle: protectedProcedure
		.input(z.object({ id: z.number(), active: z.boolean() }))
		.mutation(async ({ input }) => {
			await db
				.update(alertRules)
				.set({ active: input.active })
				.where(eq(alertRules.id, input.id));
			return { success: true };
		}),
});
