import { db } from "../../../infrastructure/database/client.js";
import {
    subscriptions,
    transactions,
    organizations,
} from "../../../infrastructure/database/schema/index.js";
import { eq, desc, count, lte, and } from "drizzle-orm";
import type { SubscriptionPlan } from "../../../shared/middleware/require-premium.js";
import type { DatabaseOrTransaction } from "../../../infrastructure/database/client.js";
import {
    SUBSCRIPTION_PLAN,
    SUBSCRIPTION_STATUS,
    TRANSACTION_STATUS,
} from "../../../shared/constants/enumConstants.js";

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
            status: TRANSACTION_STATUS.CREATED,
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

    let effectivePlan: SubscriptionPlan = rawPlan;
    if (rawPlan !== "free") {
        const expired =
            org.subscriptionExpiresAt !== null &&
            org.subscriptionExpiresAt !== undefined &&
            new Date(org.subscriptionExpiresAt) <= new Date();
        if (expired) effectivePlan = "free";
    }

    return {
        plan: effectivePlan,
        subscriptionExpiresAt: org.subscriptionExpiresAt,
        isActive: true,
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

/**
 * Fetches a batch of subscriptions whose period has ended and are still
 * marked active.
 *
 * @param batchSize Maximum number of rows to return per call.
 * @param asOf      Point-in-time to compare against (defaults to NOW()).
 */
export const findExpiredActiveSubscriptions = async (
    batchSize: number,
    asOf: Date = new Date(),
): Promise<
    Array<{
        id: string;
        organizationId: string;
        currentPeriodEnd: Date;
    }>
> => {
    return db
        .select({
            id: subscriptions.id,
            organizationId: subscriptions.organizationId,
            currentPeriodEnd: subscriptions.currentPeriodEnd,
        })
        .from(subscriptions)
        .where(
            and(
                eq(subscriptions.status, SUBSCRIPTION_STATUS.ACTIVE),
                lte(subscriptions.currentPeriodEnd, asOf),
            ),
        )
        .limit(batchSize);
};

/**
 * Atomically marks a single subscription as expired.
 *
 * @param subscriptionId  UUID of the subscription to expire.
 * @param tx              Optional Drizzle transaction context.
 * @returns               The updated row, or null if already expired.
 */
export const markSubscriptionExpired = async (
    subscriptionId: string,
    tx?: DatabaseOrTransaction,
): Promise<{ id: string; organizationId: string } | null> => {
    const client = tx ?? db;
    const now = new Date();

    const [updated] = await (client as typeof db)
        .update(subscriptions)
        .set({ status: SUBSCRIPTION_STATUS.EXPIRED, updatedAt: now })
        .where(
            and(
                eq(subscriptions.id, subscriptionId),
                eq(subscriptions.status, SUBSCRIPTION_STATUS.ACTIVE),
            ),
        )
        .returning({
            id: subscriptions.id,
            organizationId: subscriptions.organizationId,
        });

    return updated ?? null;
};

/**
 * Downgrades an organization's plan back to "free" and clears the expiry
 * timestamp. Called inside the same transaction as markSubscriptionExpired.
 *
 * @param organizationId UUID of the organization to downgrade.
 * @param tx             Optional Drizzle transaction context.
 */
export const downgradeOrganizationToFree = async (
    organizationId: string,
    tx?: DatabaseOrTransaction,
): Promise<void> => {
    const client = tx ?? db;
    await (client as typeof db)
        .update(organizations)
        .set({
            plan: SUBSCRIPTION_PLAN.FREE,
            subscriptionExpiresAt: null,
            updatedAt: new Date(),
        })
        .where(eq(organizations.id, organizationId));
};

/**
 * Executes the subscription expiration process inside a database transaction.
 */
export const executeSubscriptionExpiryTransaction = async (
    subscriptionId: string,
): Promise<{ organizationId: string } | null> => {
    let organizationId: string | null = null;
    await db.transaction(async (tx) => {
        const expired = await markSubscriptionExpired(subscriptionId, tx);
        if (!expired) {
            return;
        }
        organizationId = expired.organizationId;
        await downgradeOrganizationToFree(organizationId, tx);
    });
    return organizationId ? { organizationId } : null;
};

/**
 * Confirms payment, updates transaction status, upgrades organization plan, and upserts subscription in a single DB transaction.
 */
export const confirmSubscriptionPaymentTx = async (data: {
    organizationId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    targetPlan: SubscriptionPlan;
    amount: number;
    periodStart: Date;
    periodEnd: Date;
}) => {
    return db.transaction(async (tx) => {
        await tx
            .update(transactions)
            .set({
                razorpayPaymentId: data.razorpayPaymentId,
                razorpaySignature: data.razorpaySignature,
                status: TRANSACTION_STATUS.CAPTURED,
                updatedAt: new Date(),
            })
            .where(eq(transactions.razorpayOrderId, data.razorpayOrderId));

        await tx
            .update(organizations)
            .set({
                plan: data.targetPlan,
                subscriptionExpiresAt: data.periodEnd,
                updatedAt: new Date(),
            })
            .where(eq(organizations.id, data.organizationId));

        const [existing] = await tx
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.organizationId, data.organizationId));

        if (existing) {
            await tx
                .update(subscriptions)
                .set({
                    razorpayOrderId: data.razorpayOrderId,
                    status: SUBSCRIPTION_STATUS.ACTIVE,
                    amount: data.amount,
                    currentPeriodStart: data.periodStart,
                    currentPeriodEnd: data.periodEnd,
                    updatedAt: new Date(),
                })
                .where(eq(subscriptions.id, existing.id));
        } else {
            await tx.insert(subscriptions).values({
                organizationId: data.organizationId,
                razorpayOrderId: data.razorpayOrderId,
                amount: data.amount,
                currency: "INR",
                status: SUBSCRIPTION_STATUS.ACTIVE,
                currentPeriodStart: data.periodStart,
                currentPeriodEnd: data.periodEnd,
            });
        }
    });
};
