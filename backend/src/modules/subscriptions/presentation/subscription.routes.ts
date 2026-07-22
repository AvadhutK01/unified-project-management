import { Router } from "express";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import { requireOrgId } from "../../../shared/middleware/require-org-id.js";
import { validateRequest } from "../../../shared/validators/index.js";
import {
    createOrderSchema,
    verifyPaymentSchema,
    transactionQuerySchema,
} from "./subscription.validation.js";
import {
    createOrderHandler,
    verifyPaymentHandler,
    getStatusHandler,
    getTransactionsHandler,
    getSupportContactHandler,
    handleWebhookHandler,
    markPaymentFailedHandler,
} from "./subscription.controller.js";

const router = Router();

/**
 * Public Razorpay Webhook endpoint (authenticated via HMAC signature in X-Razorpay-Signature).
 */
router.post("/webhook", handleWebhookHandler);

router.use(authenticate);
router.use(requireOrgId);

router.post(
    "/create-order",
    validateRequest(createOrderSchema),
    createOrderHandler,
);
router.post(
    "/verify-payment",
    validateRequest(verifyPaymentSchema),
    verifyPaymentHandler,
);
router.post("/payment-failed", markPaymentFailedHandler);
router.get("/status", getStatusHandler);
router.get(
    "/transactions",
    validateRequest(transactionQuerySchema),
    getTransactionsHandler,
);
router.get("/support-contact", getSupportContactHandler);

export const subscriptionRouter = router;
