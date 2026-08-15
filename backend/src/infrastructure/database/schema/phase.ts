import {
    pgTable,
    uuid,
    varchar,
    text,
    date,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { projects } from "./project.js";
import { PHASE_STATUS } from "../../../shared/constants/enumConstants.js";

export const phaseStatusEnum = pgEnum("phase_status", [
    PHASE_STATUS.NOT_STARTED,
    PHASE_STATUS.STARTED,
    PHASE_STATUS.ON_HOLD,
    PHASE_STATUS.COMPLETED,
]);

export const phases = pgTable("phases", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
        .references(() => projects.id)
        .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    type: varchar("type", { length: 255 }),
    status: phaseStatusEnum("status")
        .default(PHASE_STATUS.NOT_STARTED)
        .notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});
