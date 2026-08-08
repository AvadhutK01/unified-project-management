ALTER TABLE "direct_messages" ADD COLUMN "reply_to_id" uuid;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN "is_forwarded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN "forwarded_from_user_id" uuid;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN "forwarded_from_name" varchar(255);--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN "deleted_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN "deleted_by_name" varchar(255);--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_forwarded_from_user_id_users_id_fk" FOREIGN KEY ("forwarded_from_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_deleted_by_user_id_users_id_fk" FOREIGN KEY ("deleted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;