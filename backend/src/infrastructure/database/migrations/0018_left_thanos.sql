CREATE TYPE "public"."workitem_status" AS ENUM('new', 'active', 'resolved', 'closed', 'removed', 'onhold');--> statement-breakpoint
CREATE TYPE "public"."workitem_type" AS ENUM('task', 'bug');--> statement-breakpoint
CREATE TABLE "workitems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sprint_id" uuid NOT NULL,
	"assigned_to" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "workitem_status" DEFAULT 'new' NOT NULL,
	"priority" integer DEFAULT 2 NOT NULL,
	"acceptance_criteria" text,
	"workitem_type" "workitem_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "workitem_discussion_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workitem_discussion_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workitem_discussions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workitem_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "workitem_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workitem_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"action" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workitem_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workitem_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(2048) NOT NULL,
	"file_type" varchar(100),
	"file_size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "workitems" ADD CONSTRAINT "workitems_sprint_id_sprints_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."sprints"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workitems" ADD CONSTRAINT "workitems_assigned_to_project_members_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."project_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workitem_discussion_tags" ADD CONSTRAINT "workitem_discussion_tags_workitem_discussion_id_workitem_discussions_id_fk" FOREIGN KEY ("workitem_discussion_id") REFERENCES "public"."workitem_discussions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workitem_discussion_tags" ADD CONSTRAINT "workitem_discussion_tags_member_id_organization_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."organization_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workitem_discussions" ADD CONSTRAINT "workitem_discussions_workitem_id_workitems_id_fk" FOREIGN KEY ("workitem_id") REFERENCES "public"."workitems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workitem_discussions" ADD CONSTRAINT "workitem_discussions_member_id_organization_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."organization_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workitem_activity_logs" ADD CONSTRAINT "workitem_activity_logs_workitem_id_workitems_id_fk" FOREIGN KEY ("workitem_id") REFERENCES "public"."workitems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workitem_activity_logs" ADD CONSTRAINT "workitem_activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workitem_media" ADD CONSTRAINT "workitem_media_workitem_id_workitems_id_fk" FOREIGN KEY ("workitem_id") REFERENCES "public"."workitems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workitem_media" ADD CONSTRAINT "workitem_media_member_id_organization_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."organization_members"("id") ON DELETE no action ON UPDATE no action;