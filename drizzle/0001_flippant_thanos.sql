CREATE TABLE "all-seeing-eye_news" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"link" text NOT NULL,
	"source" varchar(255) NOT NULL,
	"publishedAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DROP INDEX "user_id_idx";--> statement-breakpoint
DROP INDEX "date_idx";--> statement-breakpoint
ALTER TABLE "all-seeing-eye_insight" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "all-seeing-eye_insight" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "all-seeing-eye_insight" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "all-seeing-eye_insight" ADD COLUMN "newsId" varchar(255) NOT NULL;--> statement-breakpoint
CREATE INDEX "news_published_at_idx" ON "all-seeing-eye_news" USING btree ("publishedAt");--> statement-breakpoint
CREATE INDEX "news_source_idx" ON "all-seeing-eye_news" USING btree ("source");--> statement-breakpoint
ALTER TABLE "all-seeing-eye_insight" ADD CONSTRAINT "insight_news_id_fk" FOREIGN KEY ("newsId") REFERENCES "public"."all-seeing-eye_news"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "insight_news_id_idx" ON "all-seeing-eye_insight" USING btree ("newsId");--> statement-breakpoint
CREATE INDEX "insight_user_id_idx" ON "all-seeing-eye_insight" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "insight_created_at_idx" ON "all-seeing-eye_insight" USING btree ("createdAt");--> statement-breakpoint
ALTER TABLE "all-seeing-eye_insight" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "all-seeing-eye_insight" DROP COLUMN "date";