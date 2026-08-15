import { Request, Response, NextFunction } from "express";
import { forbiddenError, badRequestError } from "../errors/app-error.js";
import { findSubscriptionByOrgId } from "../../modules/subscriptions/infrastructure/subscription.repository.js";
import { SUBSCRIPTION_PLAN } from "../constants/enumConstants.js";

export type SubscriptionPlan =
    (typeof SUBSCRIPTION_PLAN)[keyof typeof SUBSCRIPTION_PLAN];

/** Ordered hierarchy of plans, lowest to highest. */
export const PLAN_HIERARCHY: SubscriptionPlan[] = [
    SUBSCRIPTION_PLAN.FREE,
    SUBSCRIPTION_PLAN.BASIC,
    SUBSCRIPTION_PLAN.PRO,
    SUBSCRIPTION_PLAN.PREMIUM,
];

/**
 * Returns true if `currentPlan` is at or above `minPlan` in the hierarchy.
 */
export const isAtLeastPlan = (
    currentPlan: string,
    minPlan: SubscriptionPlan,
): boolean => {
    const currentIndex = PLAN_HIERARCHY.indexOf(
        currentPlan as SubscriptionPlan,
    );
    const minIndex = PLAN_HIERARCHY.indexOf(minPlan);
    return currentIndex >= minIndex && currentIndex !== -1;
};

/**
 * Retrieves the organization's current plan and whether the subscription is still valid.
 */
export const getOrganizationPlan = async (
    organizationId: string,
): Promise<{ plan: SubscriptionPlan; isActive: boolean }> => {
    const sub = await findSubscriptionByOrgId(organizationId);
    if (!sub) return { plan: SUBSCRIPTION_PLAN.FREE, isActive: false };
    return { plan: sub.plan, isActive: sub.plan !== SUBSCRIPTION_PLAN.FREE };
};

/**
 * Checks if an organization currently has an active subscription at or above minPlan.
 *
 * @param organizationId Organization UUID string
 * @param minPlan Minimum required plan tier
 */
export const isOrganizationOnPlan = async (
    organizationId: string,
    minPlan: SubscriptionPlan,
): Promise<boolean> => {
    const { plan } = await getOrganizationPlan(organizationId);
    return isAtLeastPlan(plan, minPlan);
};

/**
 * Backward-compatible alias — checks if an organization has an active premium subscription.
 */
export const isOrganizationPremium = async (
    organizationId: string,
): Promise<boolean> => {
    return isOrganizationOnPlan(organizationId, SUBSCRIPTION_PLAN.PREMIUM);
};

/**
 * Factory middleware that verifies the active organization's plan is at or above `minPlan`.
 */
export const requirePlan = (minPlan: SubscriptionPlan) => {
    return async (
        req: Request,
        _res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const orgId = req.orgId || (req.headers.org_id as string);

            if (!orgId) {
                next(
                    badRequestError(
                        "Organization ID (org_id) is required in headers",
                    ),
                );
                return;
            }

            const hasPlan = await isOrganizationOnPlan(orgId, minPlan);

            if (!hasPlan) {
                const planNames: Record<SubscriptionPlan, string> = {
                    free: "Free",
                    basic: "Basic",
                    pro: "Pro",
                    premium: "Premium",
                };
                next(
                    forbiddenError(
                        `${planNames[minPlan]} subscription required to access this feature. Upgrade your organization plan.`,
                    ),
                );
                return;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Backward-compatible alias — middleware that requires an active Premium subscription.
 */
export const requirePremium = requirePlan(SUBSCRIPTION_PLAN.PREMIUM);
