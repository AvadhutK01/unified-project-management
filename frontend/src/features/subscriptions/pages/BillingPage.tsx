import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    ShieldCheck,
    CheckCircle2,
    Check,
    Calendar,
    Loader2,
    History,
    Zap,
    Mail,
    Phone,
    ArrowRight,
    Video,
    FileText,
    Crown,
    LifeBuoy,
    Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { useOrganizationStore } from "@/store/organization.store";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import {
    useSubscriptionQuery,
    useCreateOrderMutation,
    useVerifyPaymentMutation,
    useMarkPaymentFailedMutation,
    useTransactionsQuery,
    useSupportContactQuery,
} from "../hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Toolbar";
import { CardSkeleton, TableSkeleton } from "@/components/common/Skeletons";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    PLAN_HIERARCHY,
    PLAN_PRICES_INR,
    PLAN_LABELS,
    PLAN_FEATURES,
    PLAN_DESCRIPTIONS,
    isAtLeastPlan,
    getUpgradePriceINR,
    type SubscriptionPlan,
} from "../utils/subscriptionHelpers";

const PLAN_ICON: Record<SubscriptionPlan, React.ReactNode> = {
    free: <Zap className="size-4" />,
    basic: <FileText className="size-4" />,
    pro: <Video className="size-4" />,
    premium: <Crown className="size-4" />,
};

export const BillingPage = () => {
    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );
    const { isOrgOwner } = usePermission();

    const [page, setPage] = useState(1);
    const [upgradingPlan, setUpgradingPlan] = useState<Exclude<
        SubscriptionPlan,
        "free"
    > | null>(null);

    const { data: subscription, isLoading: isSubLoading } =
        useSubscriptionQuery();
    const { data: transactionsData, isLoading: isTxLoading } =
        useTransactionsQuery(page, 10);
    const { data: supportContact } = useSupportContactQuery();

    const createOrderMutation = useCreateOrderMutation();
    const verifyPaymentMutation = useVerifyPaymentMutation();
    const markPaymentFailedMutation = useMarkPaymentFailedMutation();

    useEffect(() => {
        if (!window.Razorpay) {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleUpgrade = async (
        targetPlan: Exclude<SubscriptionPlan, "free">,
    ) => {
        setUpgradingPlan(targetPlan);
        try {
            const order = await createOrderMutation.mutateAsync(targetPlan);

            if (!window.Razorpay) {
                toast.error(
                    "Razorpay SDK failed to load. Please refresh the page.",
                );
                setUpgradingPlan(null);
                return;
            }

            const planLabel = PLAN_LABELS[targetPlan];
            const options: RazorpayOptions = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: activeOrganization?.name || "Organization Subscription",
                description: `Upgrade to ${planLabel} Plan — ₹${PLAN_PRICES_INR[targetPlan]}/month`,
                order_id: order.orderId,
                handler: async (response) => {
                    try {
                        await verifyPaymentMutation.mutateAsync({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan: targetPlan,
                        });
                        toast.success(
                            `Upgraded to ${planLabel} plan successfully!`,
                        );
                    } catch (err: any) {
                        await markPaymentFailedMutation.mutateAsync({
                            razorpayOrderId: order.orderId,
                            razorpayPaymentId: response.razorpay_payment_id,
                        });
                        toast.error(
                            err?.response?.data?.message ||
                                "Payment verification failed",
                        );
                    } finally {
                        setUpgradingPlan(null);
                    }
                },
                modal: {
                    ondismiss: async () => {
                        await markPaymentFailedMutation.mutateAsync({
                            razorpayOrderId: order.orderId,
                        });
                        setUpgradingPlan(null);
                    },
                },
                theme: {
                    color:
                        targetPlan === "premium"
                            ? "#f59e0b"
                            : targetPlan === "pro"
                              ? "#8b5cf6"
                              : "#3b82f6",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || "Failed to initiate payment",
            );
            setUpgradingPlan(null);
        }
    };

    const currentPlan: SubscriptionPlan = subscription?.plan ?? "free";
    const expiresAt = subscription?.subscriptionExpiresAt
        ? new Date(subscription.subscriptionExpiresAt)
        : null;

    const transactions = transactionsData?.data ?? [];
    const pagination = transactionsData?.pagination;

    return (
        <PageContainer>
            <PageHeader
                title="Billing"
                description="Manage your organization's subscription plan and payment history."
            />

            {/* Current plan */}
            {isSubLoading ? (
                <CardSkeleton lines={2} />
            ) : (
                <section className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3.5">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/15">
                                {PLAN_ICON[currentPlan]}
                            </span>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Current plan
                                    </p>
                                    <StatusBadge tone="success" size="sm">
                                        Active
                                    </StatusBadge>
                                </div>
                                <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
                                    {PLAN_LABELS[currentPlan]}
                                </h2>
                                <p className="mt-0.5 max-w-xl text-[13px] text-muted-foreground">
                                    {PLAN_DESCRIPTIONS[currentPlan]}
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 sm:text-right">
                            <p className="tabular text-2xl font-semibold tracking-tight text-foreground">
                                {currentPlan === "free"
                                    ? "₹0"
                                    : `₹${PLAN_PRICES_INR[currentPlan]}`}
                                <span className="ml-1 text-sm font-normal text-muted-foreground">
                                    {currentPlan === "free"
                                        ? "forever"
                                        : "/ month"}
                                </span>
                            </p>
                        </div>
                    </div>
                    {expiresAt && currentPlan !== "free" && (
                        <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-5 py-2.5 text-[13px] text-muted-foreground">
                            <Calendar className="size-4 shrink-0" />
                            <span>
                                Renews or expires on{" "}
                                <span className="font-medium text-foreground">
                                    {format(
                                        expiresAt,
                                        "MMMM dd, yyyy 'at' hh:mm a",
                                    )}
                                </span>
                            </span>
                        </div>
                    )}
                </section>
            )}

            {/* Plans */}
            <section className="space-y-3">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">
                        Plans
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Upgrades charge only the price difference — your expiry
                        date stays the same.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {PLAN_HIERARCHY.map((plan) => {
                        const isCurrentPlan = currentPlan === plan;
                        const isFree = plan === "free";
                        const upgradePrice = isFree
                            ? null
                            : getUpgradePriceINR(currentPlan, plan);
                        const canUpgrade =
                            !isFree && upgradePrice !== null && isOrgOwner;
                        const isLoadingThis = upgradingPlan === plan;
                        const included = isAtLeastPlan(currentPlan, plan);

                        return (
                            <div
                                key={plan}
                                className={cn(
                                    "relative flex flex-col rounded-xl border bg-card p-5 shadow-card transition-shadow",
                                    isCurrentPlan
                                        ? "border-primary/60 ring-3 ring-primary/15"
                                        : "border-border hover:border-foreground/15",
                                )}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-foreground">
                                        <span className="text-muted-foreground">
                                            {PLAN_ICON[plan]}
                                        </span>
                                        <h3 className="text-sm font-semibold">
                                            {PLAN_LABELS[plan]}
                                        </h3>
                                    </div>
                                    {isCurrentPlan ? (
                                        <StatusBadge
                                            tone="primary"
                                            size="sm"
                                            dot={false}
                                        >
                                            Current plan
                                        </StatusBadge>
                                    ) : (
                                        plan === "premium" && (
                                            <StatusBadge
                                                tone="warning"
                                                size="sm"
                                                dot={false}
                                            >
                                                Best value
                                            </StatusBadge>
                                        )
                                    )}
                                </div>

                                <p className="tabular mt-4 text-3xl font-semibold tracking-tight text-foreground">
                                    {isFree
                                        ? "₹0"
                                        : `₹${PLAN_PRICES_INR[plan]}`}
                                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                                        {isFree ? "forever" : "/ month"}
                                    </span>
                                </p>
                                <p className="mt-2 min-h-10 text-[13px] leading-relaxed text-muted-foreground">
                                    {PLAN_DESCRIPTIONS[plan]}
                                </p>

                                <ul className="mt-4 flex-1 space-y-2 border-t border-border pt-4">
                                    {PLAN_FEATURES[plan].map((f) => (
                                        <li
                                            key={f}
                                            className={cn(
                                                "flex items-start gap-2 text-[13px]",
                                                included
                                                    ? "text-foreground"
                                                    : "text-muted-foreground",
                                            )}
                                        >
                                            <Check
                                                className={cn(
                                                    "mt-0.5 size-3.5 shrink-0",
                                                    included
                                                        ? "text-primary"
                                                        : "text-muted-foreground/50",
                                                )}
                                            />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-5">
                                    {canUpgrade && (
                                        <Button
                                            className="w-full"
                                            variant={
                                                plan === "premium"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            disabled={isLoadingThis}
                                            onClick={() =>
                                                handleUpgrade(
                                                    plan as Exclude<
                                                        SubscriptionPlan,
                                                        "free"
                                                    >,
                                                )
                                            }
                                        >
                                            {isLoadingThis ? (
                                                <>
                                                    <Loader2 className="animate-spin" />
                                                    Processing…
                                                </>
                                            ) : (
                                                <>
                                                    Upgrade for ₹{upgradePrice}
                                                    <ArrowRight />
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    {isCurrentPlan && (
                                        <div className="flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary/10 text-[13px] font-medium text-primary dark:bg-primary/15">
                                            <CheckCircle2 className="size-4" />
                                            Your current plan
                                        </div>
                                    )}

                                    {!isFree &&
                                        !canUpgrade &&
                                        !isCurrentPlan &&
                                        !isOrgOwner &&
                                        upgradePrice !== null && (
                                            <p className="text-center text-xs text-muted-foreground">
                                                Ask your organization owner to
                                                upgrade
                                            </p>
                                        )}

                                    {!isFree &&
                                        upgradePrice === null &&
                                        !isCurrentPlan && (
                                            <p className="text-center text-xs text-muted-foreground">
                                                Included in your plan
                                            </p>
                                        )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Support + payment info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SectionCard title="Secure payments" icon={ShieldCheck}>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                        All payments are processed by Razorpay with HMAC SHA-256
                        signature verification. Upgrading charges only the price
                        difference and keeps your expiry date unchanged.
                    </p>
                </SectionCard>
                <SectionCard title="Billing support" icon={LifeBuoy}>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                        Contact billing support if you run into any payment
                        issues.
                    </p>
                    {supportContact && (
                        <div className="mt-3 flex flex-col gap-1.5 text-[13px] font-medium sm:flex-row sm:gap-5">
                            <a
                                href={`mailto:${supportContact.email}`}
                                className="inline-flex min-w-0 items-center gap-2 text-foreground hover:text-primary"
                            >
                                <Mail className="size-4 shrink-0 text-muted-foreground" />
                                <span className="truncate">
                                    {supportContact.email}
                                </span>
                            </a>
                            <a
                                href={`tel:${supportContact.phone}`}
                                className="inline-flex min-w-0 items-center gap-2 text-foreground hover:text-primary"
                            >
                                <Phone className="size-4 shrink-0 text-muted-foreground" />
                                <span className="truncate">
                                    {supportContact.phone}
                                </span>
                            </a>
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* Transaction history */}
            <SectionCard
                title="Transaction history"
                description="Payments processed for this organization."
                icon={History}
                flush
            >
                {isTxLoading ? (
                    <div className="p-5">
                        <TableSkeleton
                            rows={3}
                            columns={4}
                            className="border-0 shadow-none"
                        />
                    </div>
                ) : transactions.length === 0 ? (
                    <EmptyState
                        icon={Receipt}
                        title="No transactions yet"
                        description="Payments will appear here after your first upgrade."
                        size="sm"
                    />
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-5">Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Razorpay order ID
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Amount
                                    </TableHead>
                                    <TableHead className="pr-5">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="tabular pl-5 text-[13px] whitespace-nowrap">
                                            {format(
                                                new Date(tx.createdAt),
                                                "MMM dd, yyyy HH:mm",
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-56 truncate text-[13px] text-muted-foreground">
                                            {tx.description || "Subscription"}
                                        </TableCell>
                                        <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                                            {tx.razorpayOrderId}
                                        </TableCell>
                                        <TableCell className="tabular text-right text-[13px] font-semibold">
                                            ₹{Number(tx.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="pr-5">
                                            <StatusBadge
                                                size="sm"
                                                tone={
                                                    tx.status === "captured"
                                                        ? "success"
                                                        : tx.status === "failed"
                                                          ? "danger"
                                                          : "warning"
                                                }
                                            >
                                                {tx.status === "captured"
                                                    ? "Paid"
                                                    : tx.status
                                                          .charAt(0)
                                                          .toUpperCase() +
                                                      tx.status.slice(1)}
                                            </StatusBadge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {pagination && pagination.totalPages > 1 && (
                            <div className="border-t border-border px-5 py-3">
                                <Pagination
                                    page={page}
                                    totalPages={pagination.totalPages}
                                    onPrevious={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    onNext={() => setPage((p) => p + 1)}
                                />
                            </div>
                        )}
                    </>
                )}
            </SectionCard>
        </PageContainer>
    );
};

export default BillingPage;
