import {
    pgTable,
    pgEnum,
    uuid,
    varchar,
    text,
    date,
    timestamp,
} from "drizzle-orm/pg-core";
import { organizations } from "./organization.js";

export const projectStatusEnum = pgEnum("project_status", [
    "notstarted",
    "started",
    "onhold",
    "completed",
]);

export const projects = pgTable("projects", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
        .references(() => organizations.id)
        .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    clientName: varchar("client_name", { length: 255 }),
    logoUrl: varchar("logo_url", { length: 1000 }),
    status: projectStatusEnum("status").default("notstarted").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});
