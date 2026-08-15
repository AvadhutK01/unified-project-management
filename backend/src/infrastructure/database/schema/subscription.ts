import {
    pgTable,
    uuid,
    varchar,
    integer,
    timestamp,
    index,
    pgEnum,
} from "drizzle-orm/pg-core";
import { organizations } from "./organization.js";
import { sql } from "drizzle-orm";
import { SUBSCRIPTION_STATUS } from "../../../shared/constants/enumConstants.js";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
    SUBSCRIPTION_STATUS.ACTIVE,
    SUBSCRIPTION_STATUS.EXPIRED,
    SUBSCRIPTION_STATUS.CANCELLED,
    SUBSCRIPTION_STATUS.PAST_DUE,
]);

/**
 * Database schema table for storing organization subscription details.
 */
export const subscriptions = pgTable(
    "subscriptions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        organizationId: uuid("organization_id")
            .references(() => organizations.id, { onDelete: "cascade" })
            .notNull(),
        razorpaySubscriptionId: varchar("razorpay_subscription_id", {
            length: 255,
        }),
        razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
        status: subscriptionStatusEnum("status")
            .notNull()
            .default(SUBSCRIPTION_STATUS.ACTIVE),
        amount: integer("amount").notNull(),
        currency: varchar("currency", { length: 10 }).notNull().default("INR"),
        currentPeriodStart: timestamp("current_period_start").notNull(),
        currentPeriodEnd: timestamp("current_period_end").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        activePeriodEndIdx: index("idx_subscriptions_active_period_end")
            .on(table.currentPeriodEnd)
            .where(sql`status = 'active'`),
    }),
);
