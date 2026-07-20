import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { organizations } from "./organization.js";

export interface NotificationMetadata {
    orgSlug?: string;
    projectId?: string;
    phaseId?: string;
    sprintId?: string;
    workitemId?: string;
    [key: string]: any;
}

export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    organizationId: uuid("organization_id")
        .references(() => organizations.id, { onDelete: "cascade" })
        .notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    entityId: varchar("entity_id", { length: 255 }),
    entityType: varchar("entity_type", { length: 50 }),
    metadata: jsonb("metadata").$type<NotificationMetadata>(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
