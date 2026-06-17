ALTER TABLE "project_members" RENAME COLUMN "user_id" TO "organization_member_id";--> statement-breakpoint
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_project_user_key";--> statement-breakpoint
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_user_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_members" ADD CONSTRAINT "project_members_organization_member_id_organization_members_id_fk" FOREIGN KEY ("organization_member_id") REFERENCES "public"."organization_members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_org_member_key" UNIQUE("project_id","organization_member_id");