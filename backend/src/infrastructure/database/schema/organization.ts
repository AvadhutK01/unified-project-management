import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import {
    ORGANIZATION_STATUS,
    SUBSCRIPTION_PLAN,
} from "../../../shared/constants/enumConstants.js";

export const organizationStatusEnum = pgEnum("organization_status", [
    ORGANIZATION_STATUS.ACTIVE,
    ORGANIZATION_STATUS.INACTIVE,
    ORGANIZATION_STATUS.ARCHIVED,
]);

export const organizationPlanEnum = pgEnum("organization_plan", [
    SUBSCRIPTION_PLAN.FREE,
    SUBSCRIPTION_PLAN.BASIC,
    SUBSCRIPTION_PLAN.PRO,
    SUBSCRIPTION_PLAN.PREMIUM,
]);

export const organizations = pgTable("organizations", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logoUrl: varchar("logo_url", { length: 1000 }),
    ownerUserId: uuid("owner_user_id").notNull(),
    websiteUrl: varchar("website_url", { length: 1000 }),
    description: text("description"),
    status: organizationStatusEnum("status")
        .default(ORGANIZATION_STATUS.ACTIVE)
        .notNull(),
    plan: organizationPlanEnum("plan")
        .default(SUBSCRIPTION_PLAN.FREE)
        .notNull(),
    subscriptionExpiresAt: timestamp("subscription_expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
