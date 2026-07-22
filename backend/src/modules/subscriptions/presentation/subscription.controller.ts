import { Request, Response, NextFunction } from "express";
import { env } from "../../../config/env.js";
import {
    createSubscriptionOrderUseCase,
    verifyPaymentUseCase,
    getSubscriptionStatusUseCase,
    getOrgTransactionsUseCase,
    handleWebhookUseCase,
    markPaymentFailedUseCase,
} from "../application/subscription.use-cases.js";
import type { SubscriptionPlan } from "../../../shared/middleware/require-premium.js";

/**
 * Controller handler to create a new Razorpay order for a specific plan tier.
 */
export const createOrderHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const organizationId = req.orgId!;
        const userId = req.user!.id;
        const targetPlan = req.body.plan as Exclude<SubscriptionPlan, "free">;
        const result = await createSubscriptionOrderUseCase(
            organizationId,
            userId,
            targetPlan,
        );
        res.status(201).json({
            message: "Razorpay order created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller handler to verify payment signature and activate subscription.
 */
export const verifyPaymentHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const organizationId = req.orgId!;
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan,
        } = req.body;
        const targetPlan = (plan || "premium") as Exclude<
            SubscriptionPlan,
            "free"
        >;
        const result = await verifyPaymentUseCase(
            organizationId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            targetPlan,
        );
        res.status(200).json({
            message: result.message,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller handler to retrieve current subscription status.
 */
export const getStatusHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const organizationId = req.orgId!;
        const status = await getSubscriptionStatusUseCase(organizationId);
        res.status(200).json({
            data: status,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller handler to retrieve paginated payment transactions.
 */
export const getTransactionsHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const organizationId = req.orgId!;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const transactions = await getOrgTransactionsUseCase(
            organizationId,
            page,
            limit,
        );
        res.status(200).json({
            data: transactions.data,
            pagination: transactions.pagination,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller handler to fetch organization support contact details from environment.
 */
export const getSupportContactHandler = async (
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        res.status(200).json({
            data: {
                email: env.SUPPORT_EMAIL,
                phone: env.SUPPORT_PHONE,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller handler to process Razorpay webhook notifications.
 */
export const handleWebhookHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const signature = req.headers["x-razorpay-signature"] as string;
        const rawBody = req.body;
        if (signature) {
            await handleWebhookUseCase(
                typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody),
                signature,
                req.body,
            );
        }
        res.status(200).json({ status: "ok" });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller handler to mark a transaction as failed when payment fails or modal is closed.
 */
export const markPaymentFailedHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { razorpay_order_id, razorpay_payment_id } = req.body;
        if (razorpay_order_id) {
            await markPaymentFailedUseCase(
                razorpay_order_id,
                razorpay_payment_id,
            );
        }
        res.status(200).json({ message: "Transaction marked as failed" });
    } catch (error) {
        next(error);
    }
};
