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

export const phaseStatusEnum = pgEnum("phase_status", [
    "notstarted",
    "started",
    "onhold",
    "completed",
]);

export const phases = pgTable("phases", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
        .references(() => projects.id)
        .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    type: varchar("type", { length: 255 }),
    status: phaseStatusEnum("status").default("notstarted").notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});
