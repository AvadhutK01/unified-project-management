import { pgTable, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organization.js";
import { users } from "./user.js";
import { roles } from "./role.js";
import { ORGANIZATION_INVITATION_STATUS } from "../../../shared/constants/enumConstants.js";

export const organizationInvitationStatusEnum = pgEnum(
    "organization_invitation_status",
    [
        ORGANIZATION_INVITATION_STATUS.PENDING,
        ORGANIZATION_INVITATION_STATUS.ACCEPTED,
        ORGANIZATION_INVITATION_STATUS.REJECTED,
        ORGANIZATION_INVITATION_STATUS.REVOKED,
    ],
);

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
    status: organizationInvitationStatusEnum("status")
        .default(ORGANIZATION_INVITATION_STATUS.PENDING)
        .notNull(),
    invitedBy: uuid("invited_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
