import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { workitems } from "./workitem.js";
import { organizationMembers } from "./organization-member.js";

export const workitemDiscussions = pgTable("workitem_discussions", {
    id: uuid("id").defaultRandom().primaryKey(),
    workitemId: uuid("workitem_id")
        .references(() => workitems.id)
        .notNull(),
    memberId: uuid("member_id")
        .references(() => organizationMembers.id)
        .notNull(),
    comment: text("comment").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});

export const workitemDiscussionTags = pgTable("workitem_discussion_tags", {
    id: uuid("id").defaultRandom().primaryKey(),
    workitemDiscussionId: uuid("workitem_discussion_id")
        .references(() => workitemDiscussions.id)
        .notNull(),
    memberId: uuid("member_id")
        .references(() => organizationMembers.id)
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
