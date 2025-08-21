import { sql } from "drizzle-orm";
import { index, pgTableCreator, foreignKey } from "drizzle-orm/pg-core";

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
		publishedAt: d
			.timestamp({ withTimezone: true })
			.notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [
		index("news_published_at_idx").on(t.publishedAt),
		index("news_source_idx").on(t.source),
	]
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
			name: "insight_news_id_fk"
		}),
		foreignKey({
			columns: [t.userId],
			foreignColumns: [users.id],
			name: "insight_user_id_fk"
		}),
	],
);
