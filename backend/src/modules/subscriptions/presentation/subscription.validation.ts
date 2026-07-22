import { z } from "zod";

/**
 * Validation schema for creating a Razorpay subscription order.
 */
export const createOrderSchema = z.object({
    body: z.object({
        plan: z.enum(["basic", "pro", "premium"], {
            required_error: "plan is required",
            invalid_type_error: "plan must be one of: basic, pro, premium",
        }),
    }),
});

/**
 * Validation schema for verifying a Razorpay payment.
 */
export const verifyPaymentSchema = z.object({
    body: z.object({
        razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),
        razorpay_payment_id: z
            .string()
            .min(1, "razorpay_payment_id is required"),
        razorpay_signature: z.string().min(1, "razorpay_signature is required"),
        plan: z.enum(["basic", "pro", "premium"]).optional(),
    }),
});

/**
 * Validation schema for paginated transaction queries.
 */
export const transactionQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10),
    }),
});
