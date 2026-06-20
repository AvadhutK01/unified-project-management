CREATE TYPE "public"."sprint_status" AS ENUM('new', 'active', 'onhold', 'removed', 'closed');--> statement-breakpoint
CREATE TABLE "sprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"phase_id" uuid NOT NULL,
	"start_date" date,
	"end_date" date,
	"sequence" integer,
	"acceptance_criteria" text,
	"status" "sprint_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_phase_id_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."phases"("id") ON DELETE no action ON UPDATE no action;