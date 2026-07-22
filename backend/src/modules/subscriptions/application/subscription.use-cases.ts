import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "../../../config/env.js";
import { badRequestError } from "../../../shared/errors/app-error.js";
import {
    createTransactionRecord,
    updateTransactionPayment,
    activateOrganizationSubscription,
    upsertSubscriptionRecord,
    findSubscriptionByOrgId,
    findTransactionsByOrgId,
} from "../infrastructure/subscription.repository.js";
import {
    getOrganizationPlan,
    PLAN_HIERARCHY,
    type SubscriptionPlan,
} from "../../../shared/middleware/require-premium.js";

const razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
});

/**
 * Plan prices in paise (1 INR = 100 paise).
 */
export const PLAN_PRICES_PAISE: Record<
    Exclude<SubscriptionPlan, "free">,
    number
> = {
    basic: 50000, // ₹500
    pro: 100000, // ₹1000
    premium: 150000, // ₹1500
};

/**
 * Computes the amount in paise the organization must pay to upgrade from
 * their current plan to the target plan (differential pricing).
 */
const computeUpgradeAmountPaise = (
    currentPlan: SubscriptionPlan,
    targetPlan: Exclude<SubscriptionPlan, "free">,
): number => {
    const currentPrice =
        currentPlan === "free"
            ? 0
            : PLAN_PRICES_PAISE[
                  currentPlan as Exclude<SubscriptionPlan, "free">
              ];
    const targetPrice = PLAN_PRICES_PAISE[targetPlan];
    return Math.max(targetPrice - currentPrice, 0);
};

/**
 * Creates a new Razorpay payment order for the requested subscription tier.
 * Differential pricing is applied when upgrading from an existing paid plan.
 */
export const createSubscriptionOrderUseCase = async (
    organizationId: string,
    userId: string,
    targetPlan: Exclude<SubscriptionPlan, "free">,
) => {
    // Validate targetPlan
    if (!["basic", "pro", "premium"].includes(targetPlan)) {
        throw badRequestError(
            "Invalid target plan. Must be basic, pro, or premium.",
        );
    }

    const { plan: currentPlan } = await getOrganizationPlan(organizationId);

    // Prevent downgrade
    const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan);
    const targetIndex = PLAN_HIERARCHY.indexOf(targetPlan);
    if (targetIndex <= currentIndex && currentPlan !== "free") {
        throw badRequestError(
            `Cannot downgrade plan. You are already on '${currentPlan}'.`,
        );
    }

    const amount = computeUpgradeAmountPaise(currentPlan, targetPlan);
    const currency = "INR";
    const receipt = `order_${organizationId.slice(0, 8)}_${Date.now()}`;

    const planLabels: Record<string, string> = {
        basic: "Basic",
        pro: "Pro",
        premium: "Premium",
    };

    const orderOptions = {
        amount,
        currency,
        receipt,
        notes: {
            organizationId,
            userId,
            targetPlan,
            currentPlan,
        },
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    await createTransactionRecord({
        organizationId,
        userId,
        razorpayOrderId: razorpayOrder.id,
        amount,
        currency,
        description: `Upgrade to ${planLabels[targetPlan]} Plan (₹${PLAN_PRICES_PAISE[targetPlan] / 100}/month)`,
    });

    return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: env.RAZORPAY_KEY_ID,
        targetPlan,
        currentPlan,
    };
};

/**
 * Verifies Razorpay payment HMAC signature and activates the target plan.
 * When upgrading an existing paid plan, the expiry date remains unchanged.
 */
export const verifyPaymentUseCase = async (
    organizationId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    targetPlan: Exclude<SubscriptionPlan, "free">,
) => {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    const isValid = expectedSignature === razorpaySignature;

    if (!isValid) {
        await updateTransactionPayment(razorpayOrderId, {
            razorpayPaymentId,
            razorpaySignature,
            status: "failed",
        });
        throw badRequestError(
            "Invalid Razorpay payment signature verification failed",
        );
    }

    await updateTransactionPayment(razorpayOrderId, {
        razorpayPaymentId,
        razorpaySignature,
        status: "captured",
    });

    // For upgrades on existing active plans, keep the same expiry date.
    // For fresh subscriptions, compute a 30-day period.
    const { plan: currentPlan } = await getOrganizationPlan(organizationId);
    const existingSubscription = await findSubscriptionByOrgId(organizationId);

    const now = new Date();
    let periodEnd: Date;

    if (
        existingSubscription?.isActive &&
        existingSubscription.subscriptionExpiresAt &&
        currentPlan !== "free"
    ) {
        // Preserve existing expiry on upgrades
        periodEnd = new Date(existingSubscription.subscriptionExpiresAt);
    } else {
        // Fresh subscription — 30 days from now
        periodEnd = new Date(now);
        periodEnd.setDate(periodEnd.getDate() + 30);
    }

    await activateOrganizationSubscription(
        organizationId,
        targetPlan,
        periodEnd,
    );

    await upsertSubscriptionRecord({
        organizationId,
        razorpayOrderId,
        plan: targetPlan,
        amount: PLAN_PRICES_PAISE[targetPlan],
        periodStart: now,
        periodEnd,
    });

    const planLabels: Record<string, string> = {
        basic: "Basic",
        pro: "Pro",
        premium: "Premium",
    };

    return {
        success: true,
        message: `Payment verified successfully. ${planLabels[targetPlan]} features activated.`,
        expiresAt: periodEnd.toISOString(),
        plan: targetPlan,
    };
};

/**
 * Retrieves an organization's subscription status and validity details.
 */
export const getSubscriptionStatusUseCase = async (organizationId: string) => {
    const status = await findSubscriptionByOrgId(organizationId);
    if (!status) {
        throw badRequestError("Organization subscription not found");
    }
    return status;
};

/**
 * Retrieves paginated transaction history for an organization.
 */
export const getOrgTransactionsUseCase = async (
    organizationId: string,
    page: number,
    limit: number,
) => {
    return await findTransactionsByOrgId(organizationId, page, limit);
};

/**
 * Processes incoming Razorpay webhooks, validates X-Razorpay-Signature, and handles payment events.
 */
export const handleWebhookUseCase = async (
    rawBody: string | Buffer,
    signature: string,
    payload: any,
) => {
    const expectedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

    if (expectedSignature !== signature) {
        throw badRequestError("Invalid webhook signature");
    }

    const eventType = payload?.event;
    if (eventType === "payment.captured" || eventType === "order.paid") {
        const paymentEntity = payload?.payload?.payment?.entity;
        const orderEntity = payload?.payload?.order?.entity;

        const orderId = paymentEntity?.order_id || orderEntity?.id;
        const paymentId = paymentEntity?.id || null;
        const orgId =
            paymentEntity?.notes?.organizationId ||
            orderEntity?.notes?.organizationId;
        const targetPlan = (paymentEntity?.notes?.targetPlan ||
            orderEntity?.notes?.targetPlan ||
            "premium") as Exclude<SubscriptionPlan, "free">;

        if (orderId && orgId) {
            await updateTransactionPayment(orderId, {
                razorpayPaymentId: paymentId,
                razorpaySignature: signature,
                status: "captured",
            });

            const { plan: currentPlan } = await getOrganizationPlan(orgId);
            const existingSubscription = await findSubscriptionByOrgId(orgId);

            const now = new Date();
            let periodEnd: Date;

            if (
                existingSubscription?.isActive &&
                existingSubscription.subscriptionExpiresAt &&
                currentPlan !== "free"
            ) {
                periodEnd = new Date(
                    existingSubscription.subscriptionExpiresAt,
                );
            } else {
                periodEnd = new Date(now);
                periodEnd.setDate(periodEnd.getDate() + 30);
            }

            await activateOrganizationSubscription(
                orgId,
                targetPlan,
                periodEnd,
            );

            await upsertSubscriptionRecord({
                organizationId: orgId,
                razorpayOrderId: orderId,
                plan: targetPlan,
                amount: paymentEntity?.amount || PLAN_PRICES_PAISE[targetPlan],
                periodStart: now,
                periodEnd,
            });
        }
    } else if (eventType === "payment.failed") {
        const paymentEntity = payload?.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id;
        const paymentId = paymentEntity?.id || null;

        if (orderId) {
            await updateTransactionPayment(orderId, {
                razorpayPaymentId: paymentId,
                razorpaySignature: signature,
                status: "failed",
            });
        }
    }

    return { received: true };
};

/**
 * Marks a transaction status as failed when payment fails or modal is dismissed.
 */
export const markPaymentFailedUseCase = async (
    razorpayOrderId: string,
    razorpayPaymentId?: string,
) => {
    await updateTransactionPayment(razorpayOrderId, {
        razorpayPaymentId: razorpayPaymentId || null,
        razorpaySignature: null,
        status: "failed",
    });
    return { success: true };
};
