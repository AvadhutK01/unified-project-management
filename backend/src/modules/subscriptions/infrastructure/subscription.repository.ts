import { db } from "../../../infrastructure/database/client.js";
import {
    subscriptions,
    transactions,
    organizations,
} from "../../../infrastructure/database/schema/index.js";
import { eq, desc, count } from "drizzle-orm";
import type { SubscriptionPlan } from "../../../shared/middleware/require-premium.js";

/**
 * Creates a new transaction record in the database.
 */
export const createTransactionRecord = async (data: {
    organizationId: string;
    userId: string;
    razorpayOrderId: string;
    amount: number;
    currency?: string;
    description?: string;
}) => {
    const [result] = await db
        .insert(transactions)
        .values({
            organizationId: data.organizationId,
            userId: data.userId,
            razorpayOrderId: data.razorpayOrderId,
            amount: data.amount,
            currency: data.currency || "INR",
            status: "created",
            description: data.description || "Organization Subscription",
        })
        .returning();
    return result;
};

/**
 * Updates a transaction record with payment confirmation data.
 */
export const updateTransactionPayment = async (
    razorpayOrderId: string,
    data: {
        razorpayPaymentId?: string | null;
        razorpaySignature?: string | null;
        status: "captured" | "failed";
    },
) => {
    const [result] = await db
        .update(transactions)
        .set({
            razorpayPaymentId: data.razorpayPaymentId,
            razorpaySignature: data.razorpaySignature,
            status: data.status,
            updatedAt: new Date(),
        })
        .where(eq(transactions.razorpayOrderId, razorpayOrderId))
        .returning();
    return result;
};

/**
 * Updates organization plan and subscription expiration date.
 *
 * @param organizationId Target organization UUID
 * @param plan The new plan tier to activate
 * @param expiresAt Subscription expiry timestamp
 */
export const activateOrganizationSubscription = async (
    organizationId: string,
    plan: SubscriptionPlan,
    expiresAt: Date,
) => {
    const [result] = await db
        .update(organizations)
        .set({
            plan,
            subscriptionExpiresAt: expiresAt,
            updatedAt: new Date(),
        })
        .where(eq(organizations.id, organizationId))
        .returning();
    return result;
};

/**
 * Creates or updates the active subscription record for an organization.
 */
export const upsertSubscriptionRecord = async (data: {
    organizationId: string;
    razorpayOrderId: string;
    plan: SubscriptionPlan;
    amount: number;
    periodStart: Date;
    periodEnd: Date;
}) => {
    const [existing] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.organizationId, data.organizationId));

    if (existing) {
        const [updated] = await db
            .update(subscriptions)
            .set({
                razorpayOrderId: data.razorpayOrderId,
                status: "active",
                amount: data.amount,
                currentPeriodStart: data.periodStart,
                currentPeriodEnd: data.periodEnd,
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existing.id))
            .returning();
        return updated;
    }

    const [created] = await db
        .insert(subscriptions)
        .values({
            organizationId: data.organizationId,
            razorpayOrderId: data.razorpayOrderId,
            status: "active",
            amount: data.amount,
            currency: "INR",
            currentPeriodStart: data.periodStart,
            currentPeriodEnd: data.periodEnd,
        })
        .returning();
    return created;
};

/**
 * Retrieves an organization's current subscription status and plan tier.
 */
export const findSubscriptionByOrgId = async (organizationId: string) => {
    const [org] = await db
        .select({
            plan: organizations.plan,
            subscriptionExpiresAt: organizations.subscriptionExpiresAt,
        })
        .from(organizations)
        .where(eq(organizations.id, organizationId));

    if (!org) return null;

    const rawPlan = (org.plan || "free") as SubscriptionPlan;

    // Paid plans need a valid expiry
    let effectivePlan: SubscriptionPlan = rawPlan;
    if (rawPlan !== "free") {
        const expired =
            !org.subscriptionExpiresAt ||
            new Date(org.subscriptionExpiresAt) <= new Date();
        if (expired) effectivePlan = "free";
    }

    return {
        plan: effectivePlan,
        subscriptionExpiresAt: org.subscriptionExpiresAt,
        isActive: effectivePlan !== "free",
        // Convenience booleans
        isBasic: effectivePlan !== "free",
        isPro: effectivePlan === "pro" || effectivePlan === "premium",
        isPremium: effectivePlan === "premium",
    };
};

/**
 * Retrieves paginated transactions for an organization.
 */
export const findTransactionsByOrgId = async (
    organizationId: string,
    page: number = 1,
    limit: number = 10,
) => {
    const offset = (page - 1) * limit;

    const items = await db
        .select()
        .from(transactions)
        .where(eq(transactions.organizationId, organizationId))
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset);

    const [totalResult] = await db
        .select({ count: count() })
        .from(transactions)
        .where(eq(transactions.organizationId, organizationId));

    const total = Number(totalResult?.count || 0);

    return {
        data: items,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
