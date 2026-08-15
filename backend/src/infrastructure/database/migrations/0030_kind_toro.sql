DO $$ BEGIN
    CREATE TYPE "public"."user_auth_provider" AS ENUM('local', 'google');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."organization_plan" AS ENUM('free', 'basic', 'pro', 'premium');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."organization_status" AS ENUM('active', 'inactive', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."organization_invitation_status" AS ENUM('pending', 'accepted', 'rejected', 'revoked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."organization_member_status" AS ENUM('active', 'inactive', 'onleave', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."notification_entity_type" AS ENUM('workitem', 'sprint', 'project', 'direct_chat');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."notification_type" AS ENUM('task_assignment', 'task_update', 'task_status_updated', 'task_deleted', 'comment_mention', 'sprint_deadline', 'direct_message');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."subscription_status" AS ENUM('active', 'expired', 'cancelled', 'past_due');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."transaction_status" AS ENUM('created', 'captured', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "auth_provider" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "auth_provider" SET DATA TYPE "public"."user_auth_provider" USING "auth_provider"::"public"."user_auth_provider";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "auth_provider" SET DEFAULT 'local'::"public"."user_auth_provider";--> statement-breakpoint

ALTER TABLE "organizations" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "status" SET DATA TYPE "public"."organization_status" USING "status"::"public"."organization_status";--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."organization_status";--> statement-breakpoint

ALTER TABLE "organizations" ALTER COLUMN "plan" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "plan" SET DATA TYPE "public"."organization_plan" USING "plan"::"public"."organization_plan";--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "plan" SET DEFAULT 'free'::"public"."organization_plan";--> statement-breakpoint

ALTER TABLE "organization_invitations" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "organization_invitations" ALTER COLUMN "status" SET DATA TYPE "public"."organization_invitation_status" USING "status"::"public"."organization_invitation_status";--> statement-breakpoint
ALTER TABLE "organization_invitations" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."organization_invitation_status";--> statement-breakpoint

ALTER TABLE "organization_members" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "status" SET DATA TYPE "public"."organization_member_status" USING "status"::"public"."organization_member_status";--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."organization_member_status";--> statement-breakpoint

ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE "public"."notification_type" USING "type"::"public"."notification_type";--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "entity_type" SET DATA TYPE "public"."notification_entity_type" USING "entity_type"::"public"."notification_entity_type";--> statement-breakpoint

ALTER TABLE "subscriptions" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DATA TYPE "public"."subscription_status" USING "status"::"public"."subscription_status";--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."subscription_status";--> statement-breakpoint

ALTER TABLE "transactions" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "status" SET DATA TYPE "public"."transaction_status" USING "status"::"public"."transaction_status";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "status" SET DEFAULT 'created'::"public"."transaction_status";