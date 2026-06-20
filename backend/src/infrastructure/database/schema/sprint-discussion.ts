import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { sprints } from "./sprint.js";
import { organizationMembers } from "./organization-member.js";

export const sprintDiscussions = pgTable("sprint_discussions", {
    id: uuid("id").defaultRandom().primaryKey(),
    sprintId: uuid("sprint_id")
        .references(() => sprints.id, { onDelete: "cascade" })
        .notNull(),
    memberId: uuid("member_id")
        .references(() => organizationMembers.id, { onDelete: "cascade" })
        .notNull(),
    comment: text("comment").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});

export const sprintDiscussionTags = pgTable("sprint_discussion_tags", {
    id: uuid("id").defaultRandom().primaryKey(),
    sprintDiscussionId: uuid("sprint_discussion_id")
        .references(() => sprintDiscussions.id, { onDelete: "cascade" })
        .notNull(),
    organizationMemberId: uuid("organization_member_id")
        .references(() => organizationMembers.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
