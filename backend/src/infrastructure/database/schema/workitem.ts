import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { sprints } from "./sprint.js";
import { projectMembers } from "./project-member.js";

export const workitemStatusEnum = pgEnum("workitem_status", [
    "new",
    "active",
    "resolved",
    "closed",
    "removed",
    "onhold",
]);

export const workitemTypeEnum = pgEnum("workitem_type", ["task", "bug"]);

export const workitems = pgTable("workitems", {
    id: uuid("id").defaultRandom().primaryKey(),
    sprintId: uuid("sprint_id")
        .references(() => sprints.id)
        .notNull(),
    assignedTo: uuid("assigned_to").references(() => projectMembers.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: workitemStatusEnum("status").default("new").notNull(),
    priority: integer("priority").default(2).notNull(),
    acceptanceCriteria: text("acceptance_criteria"),
    workitemType: workitemTypeEnum("workitem_type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});
