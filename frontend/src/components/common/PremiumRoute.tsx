import { Navigate } from "react-router-dom";
import { useOrganizationStore } from "@/store/organization.store";
import { useSubscriptionQuery } from "@/features/subscriptions/hooks/useSubscription";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    isAtLeastPlan,
    PLAN_LABELS,
    type SubscriptionPlan,
} from "@/features/subscriptions/utils/subscriptionHelpers";
import { PageContainer } from "./PageHeader";
import { PageSkeleton } from "./Skeletons";

interface PremiumRouteProps {
    children: React.ReactNode;
    minPlan?: Exclude<SubscriptionPlan, "free">;
}

export const PremiumRoute = ({
    children,
    minPlan = "premium",
}: PremiumRouteProps) => {
    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );
    const { data: subscription, isLoading } = useSubscriptionQuery();
    const { isOrgOwner } = usePermission();

    if (!activeOrganization) {
        return <Navigate to="/" replace />;
    }

    if (isLoading) {
        return <PageSkeleton stats={4} variant="table" />;
    }

    const hasAccess = isAtLeastPlan(subscription?.plan, minPlan);
    const planName = PLAN_LABELS[minPlan];

    if (!hasAccess) {
        return (
            <PageContainer size="narrow">
                <div className="mx-auto mt-6 max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-card sm:mt-12">
                    <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 dark:bg-primary/15">
                        <Lock className="size-5" />
                    </span>
                    <p className="mt-5 text-xs font-medium text-primary">
                        {planName} plan feature
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                        {planName} Plan Required
                    </h2>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                        {isOrgOwner
                            ? `This feature requires a ${planName} subscription. Upgrade your organization plan to unlock access.`
                            : `This feature requires a ${planName} subscription. Please contact your Organization Owner to upgrade.`}
                    </p>

                    {isOrgOwner && (
                        <Button asChild className="mt-6">
                            <a href={`/${activeOrganization.slug}/billing`}>
                                View plans & upgrade
                                <ArrowRight />
                            </a>
                        </Button>
                    )}

                    <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
                        {isOrgOwner
                            ? "Monthly billing · Upgrades charge only the price difference"
                            : "Contact your organization owner to enable this feature"}
                    </p>
                </div>
            </PageContainer>
        );
    }

    return <>{children}</>;
};

export default PremiumRoute;
