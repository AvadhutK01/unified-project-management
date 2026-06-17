import { pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { projects } from "./project.js";
import { organizationMembers } from "./organization-member.js";

export const projectMembers = pgTable(
    "project_members",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        projectId: uuid("project_id")
            .references(() => projects.id)
            .notNull(),
        organizationMemberId: uuid("organization_member_id")
            .references(() => organizationMembers.id)
            .notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
        deletedAt: timestamp("deleted_at"),
    },
    (table) => ({
        unq: unique("project_members_project_org_member_key").on(
            table.projectId,
            table.organizationMemberId,
        ),
    }),
);
