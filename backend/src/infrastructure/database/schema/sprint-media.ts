import {
    pgTable,
    uuid,
    varchar,
    integer,
    timestamp,
} from "drizzle-orm/pg-core";
import { sprints } from "./sprint.js";
import { organizationMembers } from "./organization-member.js";

export const sprintMedia = pgTable("sprint_media", {
    id: uuid("id").defaultRandom().primaryKey(),
    sprintId: uuid("sprint_id")
        .references(() => sprints.id, { onDelete: "cascade" })
        .notNull(),
    memberId: uuid("member_id")
        .references(() => organizationMembers.id, { onDelete: "cascade" })
        .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    url: varchar("url", { length: 2000 }).notNull(),
    fileType: varchar("file_type", { length: 100 }).notNull(),
    fileSize: integer("file_size").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});
