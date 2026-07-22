import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/store/organization.store";
import {
    fetchSubscriptionStatus,
    createRazorpayOrder,
    verifyRazorpayPayment,
    markPaymentFailed,
    fetchOrganizationTransactions,
    fetchSupportContact,
    type VerifyPaymentPayload,
    type SubscriptionPlan,
} from "../api/subscription.api";

export const useSubscriptionQuery = () => {
    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );
    const orgId = activeOrganization?.id;

    return useQuery({
        queryKey: ["subscription-status", orgId],
        queryFn: fetchSubscriptionStatus,
        enabled: Boolean(orgId),
    });
};

export const useCreateOrderMutation = () => {
    return useMutation({
        mutationFn: (plan: Exclude<SubscriptionPlan, "free">) =>
            createRazorpayOrder(plan),
    });
};

export const useVerifyPaymentMutation = () => {
    const queryClient = useQueryClient();
    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );
    const orgId = activeOrganization?.id;

    return useMutation({
        mutationFn: (payload: VerifyPaymentPayload) =>
            verifyRazorpayPayment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["subscription-status", orgId],
            });
            queryClient.invalidateQueries({
                queryKey: ["organization-transactions", orgId],
            });
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
        },
    });
};

export const useMarkPaymentFailedMutation = () => {
    const queryClient = useQueryClient();
    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );
    const orgId = activeOrganization?.id;

    return useMutation({
        mutationFn: ({
            razorpayOrderId,
            razorpayPaymentId,
        }: {
            razorpayOrderId: string;
            razorpayPaymentId?: string;
        }) => markPaymentFailed(razorpayOrderId, razorpayPaymentId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["organization-transactions", orgId],
            });
        },
    });
};

export const useTransactionsQuery = (page: number = 1, limit: number = 10) => {
    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );
    const orgId = activeOrganization?.id;

    return useQuery({
        queryKey: ["organization-transactions", orgId, page, limit],
        queryFn: () => fetchOrganizationTransactions(page, limit),
        enabled: Boolean(orgId),
    });
};

export const useSupportContactQuery = () => {
    return useQuery({
        queryKey: ["support-contact"],
        queryFn: fetchSupportContact,
    });
};
