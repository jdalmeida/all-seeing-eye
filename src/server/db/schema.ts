import { sql } from "drizzle-orm";
import { foreignKey, index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `all-seeing-eye_${name}`);

// Users table - synchronized with Clerk
export const users = createTable(
	"user",
	(d) => ({
		id: d.varchar({ length: 255 }).primaryKey(), // Clerk user ID
		email: d.varchar({ length: 255 }).unique().notNull(),
		firstName: d.varchar({ length: 255 }),
		lastName: d.varchar({ length: 255 }),
		profileImageUrl: d.varchar({ length: 512 }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [index("email_idx").on(t.email)],
);

// News table
export const news = createTable(
	"news",
	(d) => ({
		id: d.varchar({ length: 255 }).primaryKey(),
		title: d.text().notNull(),
		link: d.text().notNull(),
		source: d.varchar({ length: 255 }).notNull(),
		publishedAt: d.timestamp({ withTimezone: true }).notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [
		index("news_published_at_idx").on(t.publishedAt),
		index("news_source_idx").on(t.source),
	],
);

// Insights table (AI-generated insights for news)
export const insights = createTable(
	"insight",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		newsId: d.varchar({ length: 255 }).notNull(),
		userId: d.varchar({ length: 255 }), // Optional: can be null for global insights
		content: d.text().notNull(), // AI-generated insight content
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("insight_news_id_idx").on(t.newsId),
		index("insight_user_id_idx").on(t.userId),
		index("insight_created_at_idx").on(t.createdAt),
		foreignKey({
			columns: [t.newsId],
			foreignColumns: [news.id],
			name: "insight_news_id_fk",
		}),
		foreignKey({
			columns: [t.userId],
			foreignColumns: [users.id],
			name: "insight_user_id_fk",
		}),
	],
);

// Alert rules table
export const alertRules = createTable(
	"alert_rule",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d.varchar({ length: 255 }),
		// Texto NL original da regra
		ruleText: d.text().notNull(),
		// Tipo da regra: 'crypto' | 'news' | etc
		ruleType: d.varchar({ length: 32 }).notNull(),
		// Parâmetros em JSON (schema específico por tipo)
		params: d.json().notNull(),
		active: d.boolean().notNull().default(true),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("alert_rule_user_id_idx").on(t.userId),
		index("alert_rule_type_idx").on(t.ruleType),
		index("alert_rule_active_idx").on(t.active),
		foreignKey({
			columns: [t.userId],
			foreignColumns: [users.id],
			name: "alert_rule_user_id_fk",
		}),
	],
);

// Alert events table (histórico de disparos)
export const alertEvents = createTable(
	"alert_event",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		ruleId: d.integer().notNull(),
		newsId: d.varchar({ length: 255 }),
		context: d.text(),
		message: d.text().notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [
		index("alert_event_rule_id_idx").on(t.ruleId),
		index("alert_event_news_id_idx").on(t.newsId),
		foreignKey({
			columns: [t.ruleId],
			foreignColumns: [alertRules.id],
			name: "alert_event_rule_id_fk",
		}),
		foreignKey({
			columns: [t.newsId],
			foreignColumns: [news.id],
			name: "alert_event_news_id_fk",
		}),
	],
);

// Chat conversations table
export const chatConversations = createTable(
	"chat_conversation",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d.varchar({ length: 255 }).notNull(),
		title: d.varchar({ length: 255 }).notNull(),
		systemPrompt: d.text().notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("chat_conversation_user_id_idx").on(t.userId),
		index("chat_conversation_created_at_idx").on(t.createdAt),
		foreignKey({
			columns: [t.userId],
			foreignColumns: [users.id],
			name: "chat_conversation_user_id_fk",
		}),
	],
);

// Chat messages table
export const chatMessages = createTable(
	"chat_message",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		conversationId: d.integer().notNull(),
		role: d.varchar({ length: 20 }).notNull(),
		content: d.text().notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [
		index("chat_message_conversation_id_idx").on(t.conversationId),
		index("chat_message_created_at_idx").on(t.createdAt),
		foreignKey({
			columns: [t.conversationId],
			foreignColumns: [chatConversations.id],
			name: "chat_message_conversation_id_fk",
		}),
	],
);

// System prompts templates table
export const systemPromptTemplates = createTable(
	"system_prompt_template",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d.varchar({ length: 255 }).notNull(),
		name: d.varchar({ length: 255 }).notNull(),
		description: d.text(),
		prompt: d.text().notNull(),
		isDefault: d.boolean().notNull().default(false),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("system_prompt_template_user_id_idx").on(t.userId),
		index("system_prompt_template_is_default_idx").on(t.isDefault),
		foreignKey({
			columns: [t.userId],
			foreignColumns: [users.id],
			name: "system_prompt_template_user_id_fk",
		}),
	],
);
