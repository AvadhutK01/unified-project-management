import { Navigate } from "react-router-dom";
import { useOrganizationStore } from "@/store/organization.store";
import { useSubscriptionQuery } from "@/features/subscriptions/hooks/useSubscription";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { ShieldAlert, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    isAtLeastPlan,
    PLAN_LABELS,
    type SubscriptionPlan,
} from "@/features/subscriptions/utils/subscriptionHelpers";

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
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const hasAccess = isAtLeastPlan(subscription?.plan, minPlan);
    const planName = PLAN_LABELS[minPlan];

    if (!hasAccess) {
        return (
            <div className="p-8 max-w-4xl mx-auto my-12">
                <div className="bg-gradient-to-br from-amber-500/10 via-card to-background border border-amber-500/30 rounded-2xl p-8 shadow-xl text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                        <Sparkles className="w-8 h-8 animate-pulse" />
                    </div>

                    <div className="space-y-2 max-w-md mx-auto">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            {planName} Plan Required
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {isOrgOwner
                                ? `This feature requires a ${planName} subscription. Upgrade your organization plan to unlock access.`
                                : `This feature requires a ${planName} subscription. Please contact your Organization Owner to upgrade.`}
                        </p>
                    </div>

                    {isOrgOwner && (
                        <div className="pt-2">
                            <Button
                                asChild
                                size="lg"
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-8 shadow-lg shadow-amber-500/20 cursor-pointer"
                            >
                                <a href={`/${activeOrganization.slug}/billing`}>
                                    Upgrade Plan
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </a>
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border/40">
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        <span>
                            {isOrgOwner
                                ? "Recurring monthly billing • Cancel or manage anytime"
                                : "Contact your organization owner to enable this feature"}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default PremiumRoute;
