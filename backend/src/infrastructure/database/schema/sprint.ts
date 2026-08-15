import {
    pgTable,
    uuid,
    varchar,
    text,
    date,
    integer,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { phases } from "./phase.js";
import { SPRINT_STATUS } from "../../../shared/constants/enumConstants.js";

export const sprintStatusEnum = pgEnum("sprint_status", [
    SPRINT_STATUS.NEW,
    SPRINT_STATUS.ACTIVE,
    SPRINT_STATUS.ON_HOLD,
    SPRINT_STATUS.REMOVED,
    SPRINT_STATUS.CLOSED,
]);

export const sprints = pgTable("sprints", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    phaseId: uuid("phase_id")
        .references(() => phases.id)
        .notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    sequence: integer("sequence"),
    acceptanceCriteria: text("acceptance_criteria"),
    status: sprintStatusEnum("status").default(SPRINT_STATUS.NEW).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});
