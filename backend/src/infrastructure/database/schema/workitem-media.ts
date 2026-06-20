import {
    pgTable,
    uuid,
    varchar,
    integer,
    timestamp,
} from "drizzle-orm/pg-core";
import { workitems } from "./workitem.js";
import { organizationMembers } from "./organization-member.js";

export const workitemMedia = pgTable("workitem_media", {
    id: uuid("id").defaultRandom().primaryKey(),
    workitemId: uuid("workitem_id")
        .references(() => workitems.id)
        .notNull(),
    memberId: uuid("member_id")
        .references(() => organizationMembers.id)
        .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    url: varchar("url", { length: 2048 }).notNull(),
    fileType: varchar("file_type", { length: 100 }),
    fileSize: integer("file_size"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});
