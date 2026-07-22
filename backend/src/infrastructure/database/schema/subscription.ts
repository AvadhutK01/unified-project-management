import {
    pgTable,
    uuid,
    varchar,
    integer,
    timestamp,
} from "drizzle-orm/pg-core";
import { organizations } from "./organization.js";

/**
 * Database schema table for storing organization subscription details.
 */
export const subscriptions = pgTable("subscriptions", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
        .references(() => organizations.id, { onDelete: "cascade" })
        .notNull(),
    razorpaySubscriptionId: varchar("razorpay_subscription_id", {
        length: 255,
    }),
    razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
    status: varchar("status", { length: 50 }).notNull().default("active"),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
