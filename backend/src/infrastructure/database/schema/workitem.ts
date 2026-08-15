import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    timestamp,
    pgEnum,
    doublePrecision,
} from "drizzle-orm/pg-core";
import { sprints } from "./sprint.js";
import { projectMembers } from "./project-member.js";
import {
    WORKITEM_STATUS,
    WORKITEM_TYPE,
} from "../../../shared/constants/enumConstants.js";

export const workitemStatusEnum = pgEnum("workitem_status", [
    WORKITEM_STATUS.NEW,
    WORKITEM_STATUS.ACTIVE,
    WORKITEM_STATUS.RESOLVED,
    WORKITEM_STATUS.CLOSED,
    WORKITEM_STATUS.REMOVED,
    WORKITEM_STATUS.ON_HOLD,
]);

export const workitemTypeEnum = pgEnum("workitem_type", [
    WORKITEM_TYPE.TASK,
    WORKITEM_TYPE.BUG,
]);

export const workitems = pgTable("workitems", {
    id: uuid("id").defaultRandom().primaryKey(),
    sprintId: uuid("sprint_id")
        .references(() => sprints.id)
        .notNull(),
    assignedTo: uuid("assigned_to").references(() => projectMembers.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: workitemStatusEnum("status").default(WORKITEM_STATUS.NEW).notNull(),
    priority: integer("priority").default(2).notNull(),
    acceptanceCriteria: text("acceptance_criteria"),
    workitemType: workitemTypeEnum("workitem_type").notNull(),
    originalEstimation: doublePrecision("original_estimation"),
    remaining: doublePrecision("remaining"),
    completed: doublePrecision("completed"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});
