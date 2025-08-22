-- Migration: Add chat conversations, messages and system prompt templates
-- Created at: 2024-12-19

-- Create chat_conversations table
CREATE TABLE "all-seeing-eye_chat_conversation" (
	"id" serial PRIMARY KEY,
	"userId" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"systemPrompt" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);

-- Create chat_messages table
CREATE TABLE "all-seeing-eye_chat_message" (
	"id" serial PRIMARY KEY,
	"conversationId" integer NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create system_prompt_templates table
CREATE TABLE "all-seeing-eye_system_prompt_template" (
	"id" serial PRIMARY KEY,
	"userId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"prompt" text NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);

-- Create indexes
CREATE INDEX "chat_conversation_user_id_idx" ON "all-seeing-eye_chat_conversation" ("userId");
CREATE INDEX "chat_conversation_created_at_idx" ON "all-seeing-eye_chat_conversation" ("createdAt");
CREATE INDEX "chat_message_conversation_id_idx" ON "all-seeing-eye_chat_message" ("conversationId");
CREATE INDEX "chat_message_created_at_idx" ON "all-seeing-eye_chat_message" ("createdAt");
CREATE INDEX "system_prompt_template_user_id_idx" ON "all-seeing-eye_system_prompt_template" ("userId");
CREATE INDEX "system_prompt_template_is_default_idx" ON "all-seeing-eye_system_prompt_template" ("isDefault");

-- Create foreign key constraints
ALTER TABLE "all-seeing-eye_chat_conversation" ADD CONSTRAINT "chat_conversation_user_id_fk" FOREIGN KEY ("userId") REFERENCES "all-seeing-eye_user"("id") ON DELETE CASCADE;
ALTER TABLE "all-seeing-eye_chat_message" ADD CONSTRAINT "chat_message_conversation_id_fk" FOREIGN KEY ("conversationId") REFERENCES "all-seeing-eye_chat_conversation"("id") ON DELETE CASCADE;
ALTER TABLE "all-seeing-eye_system_prompt_template" ADD CONSTRAINT "system_prompt_template_user_id_fk" FOREIGN KEY ("userId") REFERENCES "all-seeing-eye_user"("id") ON DELETE CASCADE;
