ALTER TABLE "direct_messages" ADD COLUMN IF NOT EXISTS "reply_to_id" uuid;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN IF NOT EXISTS "reply_to_sender_name" varchar(255);--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN IF NOT EXISTS "reply_to_snippet" text;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN IF NOT EXISTS "is_forwarded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN IF NOT EXISTS "forwarded_from_sender_name" varchar(255);--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN IF NOT EXISTS "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN IF NOT EXISTS "deleted_by_user_name" varchar(255);
