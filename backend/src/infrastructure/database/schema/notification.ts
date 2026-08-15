import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    jsonb,
    pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { organizations } from "./organization.js";
import {
    NOTIFICATION_TYPE,
    NOTIFICATION_ENTITY_TYPE,
} from "../../../shared/constants/enumConstants.js";

export const notificationTypeEnum = pgEnum("notification_type", [
    NOTIFICATION_TYPE.TASK_ASSIGNMENT,
    NOTIFICATION_TYPE.TASK_UPDATE,
    NOTIFICATION_TYPE.TASK_STATUS_UPDATED,
    NOTIFICATION_TYPE.TASK_DELETED,
    NOTIFICATION_TYPE.COMMENT_MENTION,
    NOTIFICATION_TYPE.SPRINT_DEADLINE,
    NOTIFICATION_TYPE.DIRECT_MESSAGE,
]);

export const notificationEntityTypeEnum = pgEnum("notification_entity_type", [
    NOTIFICATION_ENTITY_TYPE.WORKITEM,
    NOTIFICATION_ENTITY_TYPE.SPRINT,
    NOTIFICATION_ENTITY_TYPE.PROJECT,
    NOTIFICATION_ENTITY_TYPE.DIRECT_CHAT,
]);

import type { NotificationMetadata } from "../../../types/notifications.js";
export type { NotificationMetadata };

export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    organizationId: uuid("organization_id")
        .references(() => organizations.id, { onDelete: "cascade" })
        .notNull(),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    entityId: varchar("entity_id", { length: 255 }),
    entityType: notificationEntityTypeEnum("entity_type"),
    metadata: jsonb("metadata").$type<NotificationMetadata>(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
