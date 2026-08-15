import { pgTable, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organization.js";
import { users } from "./user.js";
import { roles } from "./role.js";
import { ORGANIZATION_MEMBER_STATUS } from "../../../shared/constants/enumConstants.js";

export const organizationMemberStatusEnum = pgEnum(
    "organization_member_status",
    [
        ORGANIZATION_MEMBER_STATUS.ACTIVE,
        ORGANIZATION_MEMBER_STATUS.INACTIVE,
        ORGANIZATION_MEMBER_STATUS.ON_LEAVE,
        ORGANIZATION_MEMBER_STATUS.SUSPENDED,
    ],
);

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
    status: organizationMemberStatusEnum("status")
        .default(ORGANIZATION_MEMBER_STATUS.ACTIVE)
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});
