import { api } from "@/lib/axios";
import type { SubscriptionPlan } from "../utils/subscriptionHelpers";

export type { SubscriptionPlan };

export interface SubscriptionStatus {
    plan: SubscriptionPlan;
    subscriptionExpiresAt: string | null;
    isActive: boolean;
    isBasic: boolean;
    isPro: boolean;
    isPremium: boolean;
}

export interface RazorpayOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    targetPlan: Exclude<SubscriptionPlan, "free">;
    currentPlan: SubscriptionPlan;
}

export interface VerifyPaymentPayload {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan: Exclude<SubscriptionPlan, "free">;
}

export interface Transaction {
    id: string;
    organizationId: string;
    userId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    razorpaySignature: string | null;
    amount: number;
    currency: string;
    status: "created" | "captured" | "failed";
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionsResponse {
    data: Transaction[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface SupportContactResponse {
    email: string;
    phone: string;
}

export const fetchSubscriptionStatus =
    async (): Promise<SubscriptionStatus> => {
        const { data } = await api.get("/subscriptions/status");
        return data.data;
    };

export const createRazorpayOrder = async (
    plan: Exclude<SubscriptionPlan, "free">,
): Promise<RazorpayOrderResponse> => {
    const { data } = await api.post("/subscriptions/create-order", { plan });
    return data.data;
};

export const verifyRazorpayPayment = async (
    payload: VerifyPaymentPayload,
): Promise<{
    success: boolean;
    message: string;
    expiresAt: string;
    plan: string;
}> => {
    const { data } = await api.post("/subscriptions/verify-payment", payload);
    return data.data;
};

export const markPaymentFailed = async (
    razorpayOrderId: string,
    razorpayPaymentId?: string,
): Promise<{ success: boolean }> => {
    const { data } = await api.post("/subscriptions/payment-failed", {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
    });
    return data;
};

export const fetchOrganizationTransactions = async (
    page: number = 1,
    limit: number = 10,
): Promise<TransactionsResponse> => {
    const { data } = await api.get("/subscriptions/transactions", {
        params: { page, limit },
    });
    return data;
};

export const fetchSupportContact =
    async (): Promise<SupportContactResponse> => {
        const { data } = await api.get("/subscriptions/support-contact");
        return data.data;
    };
