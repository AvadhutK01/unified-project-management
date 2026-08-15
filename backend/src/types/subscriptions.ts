export type SubscriptionPlan = "free" | "basic" | "pro" | "premium";

export interface RazorpayWebhookPayload {
    event?: string;
    payload?: {
        payment?: {
            entity?: {
                id?: string;
                order_id?: string;
                amount?: number;
                notes?: {
                    organizationId?: string;
                    planKey?: string;
                    targetPlan?: string;
                    billingCycle?: "monthly" | "yearly";
                };
            };
        };
        order?: {
            entity?: {
                id?: string;
                notes?: {
                    organizationId?: string;
                    planKey?: string;
                    targetPlan?: string;
                    billingCycle?: "monthly" | "yearly";
                };
            };
        };
    };
}
