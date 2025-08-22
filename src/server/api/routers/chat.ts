import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
	chatConversations,
	chatMessages,
	systemPromptTemplates,
} from "@/server/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

export const chatRouter = createTRPCRouter({
	// Get all conversations for the authenticated user
	getConversations: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.auth.userId;

		const conversations = await ctx.db.query.chatConversations.findMany({
			where: eq(chatConversations.userId, userId),
			orderBy: [desc(chatConversations.updatedAt)],
		});

		return conversations;
	}),

	// Get a single conversation with its messages
	getConversation: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.auth.userId;

			const conversation = await ctx.db.query.chatConversations.findFirst({
				where: and(
					eq(chatConversations.id, input.id),
					eq(chatConversations.userId, userId),
				),
			});

			if (!conversation) {
				throw new Error("Conversation not found or access denied");
			}

			const messages = await ctx.db.query.chatMessages.findMany({
				where: eq(chatMessages.conversationId, input.id),
				orderBy: [chatMessages.createdAt],
			});

			return {
				conversation,
				messages,
			};
		}),

	// Create a new conversation
	createConversation: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1).max(255),
				systemPrompt: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.auth.userId;

			const newConversation = await ctx.db
				.insert(chatConversations)
				.values({
					title: input.title,
					systemPrompt: input.systemPrompt,
					userId: userId,
				})
				.returning();

			return newConversation[0];
		}),

	// Update conversation title or system prompt
	updateConversation: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				title: z.string().min(1).max(255).optional(),
				systemPrompt: z.string().min(1).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.auth.userId;

			const updateData: Partial<typeof chatConversations.$inferInsert> = {};
			if (input.title !== undefined) updateData.title = input.title;
			if (input.systemPrompt !== undefined)
				updateData.systemPrompt = input.systemPrompt;
			updateData.updatedAt = new Date();

			const updatedConversation = await ctx.db
				.update(chatConversations)
				.set(updateData)
				.where(
					and(
						eq(chatConversations.id, input.id),
						eq(chatConversations.userId, userId),
					),
				)
				.returning();

			if (updatedConversation.length === 0) {
				throw new Error("Conversation not found or access denied");
			}

			return updatedConversation[0];
		}),

	// Delete a conversation and all its messages
	deleteConversation: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.auth.userId;

			// First delete all messages
			await ctx.db
				.delete(chatMessages)
				.where(eq(chatMessages.conversationId, input.id));

			// Then delete the conversation
			const deletedConversation = await ctx.db
				.delete(chatConversations)
				.where(
					and(
						eq(chatConversations.id, input.id),
						eq(chatConversations.userId, userId),
					),
				)
				.returning();

			if (deletedConversation.length === 0) {
				throw new Error("Conversation not found or access denied");
			}

			return { success: true };
		}),

	// Add a message to a conversation
	addMessage: protectedProcedure
		.input(
			z.object({
				conversationId: z.number(),
				role: z.enum(["user", "assistant"]),
				content: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.auth.userId;

			// Verify the conversation belongs to the user
			const conversation = await ctx.db.query.chatConversations.findFirst({
				where: and(
					eq(chatConversations.id, input.conversationId),
					eq(chatConversations.userId, userId),
				),
			});

			if (!conversation) {
				throw new Error("Conversation not found or access denied");
			}

			const newMessage = await ctx.db
				.insert(chatMessages)
				.values({
					conversationId: input.conversationId,
					role: input.role,
					content: input.content,
				})
				.returning();

			// Update conversation timestamp
			await ctx.db
				.update(chatConversations)
				.set({ updatedAt: new Date() })
				.where(eq(chatConversations.id, input.conversationId));

			return newMessage[0];
		}),

	// Get all system prompt templates for the user
	getSystemPromptTemplates: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.auth.userId;

		const templates = await ctx.db.query.systemPromptTemplates.findMany({
			where: eq(systemPromptTemplates.userId, userId),
			orderBy: [
				desc(systemPromptTemplates.isDefault),
				desc(systemPromptTemplates.updatedAt),
			],
		});

		return templates;
	}),

	// Create a new system prompt template
	createSystemPromptTemplate: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(255),
				description: z.string().optional(),
				prompt: z.string().min(1),
				isDefault: z.boolean().default(false),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.auth.userId;

			// If this is set as default, unset other defaults
			if (input.isDefault) {
				await ctx.db
					.update(systemPromptTemplates)
					.set({ isDefault: false })
					.where(
						and(
							eq(systemPromptTemplates.userId, userId),
							eq(systemPromptTemplates.isDefault, true),
						),
					);
			}

			const newTemplate = await ctx.db
				.insert(systemPromptTemplates)
				.values({
					name: input.name,
					description: input.description || "",
					prompt: input.prompt,
					isDefault: input.isDefault,
					userId: userId,
				})
				.returning();

			return newTemplate[0];
		}),

	// Update a system prompt template
	updateSystemPromptTemplate: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().min(1).max(255).optional(),
				description: z.string().optional(),
				prompt: z.string().min(1).optional(),
				isDefault: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.auth.userId;

			// If this is set as default, unset other defaults
			if (input.isDefault) {
				await ctx.db
					.update(systemPromptTemplates)
					.set({ isDefault: false })
					.where(
						and(
							eq(systemPromptTemplates.userId, userId),
							eq(systemPromptTemplates.isDefault, true),
						),
					);
			}

			const updateData: Partial<typeof systemPromptTemplates.$inferInsert> = {};
			if (input.name !== undefined) updateData.name = input.name;
			if (input.description !== undefined)
				updateData.description = input.description;
			if (input.prompt !== undefined) updateData.prompt = input.prompt;
			if (input.isDefault !== undefined) updateData.isDefault = input.isDefault;
			updateData.updatedAt = new Date();

			const updatedTemplate = await ctx.db
				.update(systemPromptTemplates)
				.set(updateData)
				.where(
					and(
						eq(systemPromptTemplates.id, input.id),
						eq(systemPromptTemplates.userId, userId),
					),
				)
				.returning();

			if (updatedTemplate.length === 0) {
				throw new Error("Template not found or access denied");
			}

			return updatedTemplate[0];
		}),

	// Delete a system prompt template
	deleteSystemPromptTemplate: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.auth.userId;

			const deletedTemplate = await ctx.db
				.delete(systemPromptTemplates)
				.where(
					and(
						eq(systemPromptTemplates.id, input.id),
						eq(systemPromptTemplates.userId, userId),
					),
				)
				.returning();

			if (deletedTemplate.length === 0) {
				throw new Error("Template not found or access denied");
			}

			return { success: true };
		}),
});
