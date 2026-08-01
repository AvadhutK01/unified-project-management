export type SubscriptionPlan = "free" | "basic" | "pro" | "premium";

/** Ordered from lowest to highest. */
export const PLAN_HIERARCHY: SubscriptionPlan[] = [
    "free",
    "basic",
    "pro",
    "premium",
];

/** Display prices in INR (rupees). */
export const PLAN_PRICES_INR: Record<
    Exclude<SubscriptionPlan, "free">,
    number
> = {
    basic: 500,
    pro: 1000,
    premium: 1500,
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
    free: "Free",
    basic: "Basic",
    pro: "Pro",
    premium: "Premium",
};

export const PLAN_DESCRIPTIONS: Record<SubscriptionPlan, string> = {
    free: "Free forever with unlimited access to core project management features.",
    basic: "Everything in Free, plus full Reports & Analytics access.",
    pro: "Everything in Basic, plus Voice & Video calling between members.",
    premium: "Everything in Pro, plus full AI Chat Assistant & AI Summaries.",
};

export const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
    free: [
        "Projects & Work Items",
        "Phases & Sprints",
        "Role-based Access Control",
        "Member Management",
        "Notifications",
    ],
    basic: [
        "Everything in Free",
        "Project Reports",
        "Phase Reports",
        "Sprint Performance Reports",
        "Member Activity Reports",
    ],
    pro: [
        "Everything in Basic",
        "Voice Calls Between Members",
        "Video Calls Between Members",
        "Screen Sharing During Calls",
    ],
    premium: [
        "Everything in Pro",
        "AI Chat Assistant",
        "AI Project / Sprint Summaries",
        "AI Phase Summaries",
    ],
};

/**
 * Returns true if `currentPlan` is at or above `minPlan` in the hierarchy.
 */
export const isAtLeastPlan = (
    currentPlan: string | undefined | null,
    minPlan: SubscriptionPlan,
): boolean => {
    if (!currentPlan) return false;
    const currentIndex = PLAN_HIERARCHY.indexOf(
        currentPlan as SubscriptionPlan,
    );
    const minIndex = PLAN_HIERARCHY.indexOf(minPlan);
    return currentIndex >= minIndex && currentIndex !== -1;
};

/**
 * Computes the differential upgrade price in INR from `currentPlan` to `targetPlan`.
 * Returns null if targetPlan is not higher than currentPlan.
 */
export const getUpgradePriceINR = (
    currentPlan: SubscriptionPlan,
    targetPlan: Exclude<SubscriptionPlan, "free">,
): number | null => {
    const currentPrice =
        currentPlan === "free"
            ? 0
            : (PLAN_PRICES_INR[
                  currentPlan as Exclude<SubscriptionPlan, "free">
              ] ?? 0);
    const targetPrice = PLAN_PRICES_INR[targetPlan];
    const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan);
    const targetIndex = PLAN_HIERARCHY.indexOf(targetPlan);
    if (targetIndex <= currentIndex) return null; // No upgrade possible
    return targetPrice - currentPrice;
};
