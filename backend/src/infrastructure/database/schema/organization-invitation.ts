import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organization.js";
import { users } from "./user.js";
import { roles } from "./role.js";

export const organizationInvitations = pgTable("organization_invitations", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
        .references(() => organizations.id)
        .notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    memberId: uuid("member_id")
        .references(() => users.id)
        .notNull(),
    roleId: uuid("role_id")
        .references(() => roles.id)
        .notNull(),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    invitedBy: uuid("invited_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
