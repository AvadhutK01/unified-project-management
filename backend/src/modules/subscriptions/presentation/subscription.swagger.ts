export const subscriptionSwaggerPaths = {
    "/subscriptions/create-order": {
        post: {
            summary: "Create subscription Razorpay order",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["targetPlan"],
                            properties: {
                                targetPlan: {
                                    type: "string",
                                    enum: ["basic", "pro", "premium"],
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: "Razorpay order created successfully" },
                400: { description: "Invalid plan input" },
                401: { description: "Unauthorized" },
            },
        },
    },
    "/subscriptions/verify-payment": {
        post: {
            summary: "Verify Razorpay payment signature",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: [
                                "razorpay_order_id",
                                "razorpay_payment_id",
                                "razorpay_signature",
                                "targetPlan",
                            ],
                            properties: {
                                razorpay_order_id: { type: "string" },
                                razorpay_payment_id: { type: "string" },
                                razorpay_signature: { type: "string" },
                                targetPlan: {
                                    type: "string",
                                    enum: ["basic", "pro", "premium"],
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: "Payment verified and plan upgraded" },
                400: { description: "Signature verification failed" },
                401: { description: "Unauthorized" },
            },
        },
    },
    "/subscriptions/status": {
        get: {
            summary: "Get current subscription status for organization",
            security: [{ bearerAuth: [] }],
            responses: {
                200: { description: "Subscription status details" },
                401: { description: "Unauthorized" },
            },
        },
    },
    "/subscriptions/transactions": {
        get: {
            summary: "Get transaction history for organization",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "page",
                    in: "query",
                    schema: { type: "integer", default: 1 },
                },
                {
                    name: "limit",
                    in: "query",
                    schema: { type: "integer", default: 10 },
                },
            ],
            responses: {
                200: { description: "Paginated list of transactions" },
                401: { description: "Unauthorized" },
            },
        },
    },
    "/subscriptions/support-contact": {
        get: {
            summary: "Get support contact details",
            security: [{ bearerAuth: [] }],
            responses: {
                200: { description: "Support contact information" },
                401: { description: "Unauthorized" },
            },
        },
    },
    "/subscriptions/payment-failed": {
        post: {
            summary: "Mark payment transaction as failed",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["razorpayOrderId"],
                            properties: {
                                razorpayOrderId: { type: "string" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: "Transaction marked as failed" },
                401: { description: "Unauthorized" },
            },
        },
    },
    "/subscriptions/webhook": {
        post: {
            summary: "Razorpay Webhook listener",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { type: "object" },
                    },
                },
            },
            responses: {
                200: { description: "Webhook event processed" },
            },
        },
    },
};
