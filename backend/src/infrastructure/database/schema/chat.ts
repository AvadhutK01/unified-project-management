import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    integer,
    timestamp,
    index,
    AnyPgColumn,
} from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { organizations } from "./organization.js";

export const directMessages = pgTable(
    "direct_messages",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        organizationId: uuid("organization_id")
            .references(() => organizations.id, { onDelete: "cascade" })
            .notNull(),
        senderId: uuid("sender_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        receiverId: uuid("receiver_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        message: text("message"),
        fileUrl: varchar("file_url", { length: 500 }),
        fileName: varchar("file_name", { length: 255 }),
        fileType: varchar("file_type", { length: 100 }),
        fileSize: integer("file_size"),
        isRead: boolean("is_read").default(false).notNull(),

        replyToId: uuid("reply_to_id").references(
            (): AnyPgColumn => directMessages.id,
            {
                onDelete: "set null",
            },
        ),
        replyToSenderName: varchar("reply_to_sender_name", { length: 255 }),
        replyToSnippet: text("reply_to_snippet"),

        isForwarded: boolean("is_forwarded").default(false).notNull(),
        forwardedFromSenderName: varchar("forwarded_from_sender_name", {
            length: 255,
        }),

        isDeleted: boolean("is_deleted").default(false).notNull(),
        deletedByUserName: varchar("deleted_by_user_name", { length: 255 }),

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        orgSenderReceiverIdx: index(
            "direct_messages_org_sender_receiver_idx",
        ).on(table.organizationId, table.senderId, table.receiverId),
        orgReceiverSenderIdx: index(
            "direct_messages_org_receiver_sender_idx",
        ).on(table.organizationId, table.receiverId, table.senderId),
    }),
);

export type DirectMessageSelect = typeof directMessages.$inferSelect;
export type DirectMessageInsert = typeof directMessages.$inferInsert;
