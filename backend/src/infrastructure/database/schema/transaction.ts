import {
    pgTable,
    uuid,
    varchar,
    integer,
    text,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { organizations } from "./organization.js";
import { users } from "./user.js";
import { TRANSACTION_STATUS } from "../../../shared/constants/enumConstants.js";

export const transactionStatusEnum = pgEnum("transaction_status", [
    TRANSACTION_STATUS.CREATED,
    TRANSACTION_STATUS.CAPTURED,
    TRANSACTION_STATUS.FAILED,
    TRANSACTION_STATUS.REFUNDED,
]);

/**
 * Database schema table for tracking payment transactions.
 */
export const transactions = pgTable("transactions", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
        .references(() => organizations.id, { onDelete: "cascade" })
        .notNull(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    razorpayOrderId: varchar("razorpay_order_id", { length: 255 }).notNull(),
    razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
    razorpaySignature: varchar("razorpay_signature", { length: 500 }),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    status: transactionStatusEnum("status")
        .notNull()
        .default(TRANSACTION_STATUS.CREATED),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
