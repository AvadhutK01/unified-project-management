import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organization.js";
import { users } from "./user.js";
import { roles } from "./role.js";

export const organizationMembers = pgTable("organization_members", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
        .references(() => organizations.id)
        .notNull(),
    memberId: uuid("member_id")
        .references(() => users.id)
        .notNull(),
    roleId: uuid("role_id")
        .references(() => roles.id)
        .notNull(),
    status: varchar("status", { length: 50 }).default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});
