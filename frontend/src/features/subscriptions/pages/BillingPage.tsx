import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Sparkles,
    ShieldCheck,
    CreditCard,
    CheckCircle2,
    Calendar,
    Loader2,
    History,
    Zap,
    AlertCircle,
    Mail,
    Phone,
    ArrowRight,
    Phone as PhoneIcon,
    Video,
    FileText,
    Bot,
    Crown,
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
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

// Tier visual config
const PLAN_CONFIG: Record<
    SubscriptionPlan,
    {
        gradient: string;
        activeBg: string;
        activeText: string;
        activeBorder: string;
        buttonBg: string;
        icon: React.ReactNode;
        badgeText: string;
    }
> = {
    free: {
        gradient: "from-slate-500/10 to-slate-600/5",
        activeBg: "bg-slate-500/10",
        activeText: "text-slate-600 dark:text-slate-400",
        activeBorder: "border-slate-500/20",
        buttonBg: "bg-slate-500 hover:bg-slate-600 text-white",
        icon: <Zap className="w-5 h-5 text-slate-400" />,
        badgeText: "Current",
    },
    basic: {
        gradient: "from-blue-500/10 to-blue-600/5",
        activeBg: "bg-blue-500/10",
        activeText: "text-blue-600 dark:text-blue-400",
        activeBorder: "border-blue-500/20",
        buttonBg: "bg-blue-500 hover:bg-blue-600 text-white",
        icon: <FileText className="w-5 h-5 text-blue-500" />,
        badgeText: "Basic",
    },
    pro: {
        gradient: "from-violet-500/10 to-purple-600/5",
        activeBg: "bg-violet-500/10",
        activeText: "text-violet-600 dark:text-violet-400",
        activeBorder: "border-violet-500/20",
        buttonBg: "bg-violet-500 hover:bg-violet-600 text-white",
        icon: <PhoneIcon className="w-5 h-5 text-violet-500" />,
        badgeText: "Pro",
    },
    premium: {
        gradient: "from-amber-500/10 to-orange-600/5",
        activeBg: "bg-amber-500/10",
        activeText: "text-amber-600 dark:text-amber-400",
        activeBorder: "border-amber-500/20",
        buttonBg:
            "bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold",
        icon: <Crown className="w-5 h-5 text-amber-500" />,
        badgeText: "Premium",
    },
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

    const paidPlans = PLAN_HIERARCHY.filter((p) => p !== "free") as Exclude<
        SubscriptionPlan,
        "free"
    >[];

    return (
        <div className="p-4 space-y-6 sm:p-6 sm:space-y-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                        Billing & Subscriptions
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage your organization's subscription plan and payment
                        history.
                    </p>
                </div>
            </div>

            {/* Current Plan Status */}
            {!isSubLoading && (
                <Card className="border-border/60 shadow-sm relative overflow-hidden">
                    <div
                        className={`absolute top-0 left-0 right-0 h-1 ${
                            currentPlan === "premium"
                                ? "bg-linear-to-r from-amber-400 to-orange-400"
                                : currentPlan === "pro"
                                  ? "bg-linear-to-r from-violet-500 to-purple-500"
                                  : currentPlan === "basic"
                                    ? "bg-linear-to-r from-blue-400 to-blue-500"
                                    : "bg-linear-to-r from-slate-300 to-slate-400"
                        }`}
                    />
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${PLAN_CONFIG[currentPlan].activeBg}`}
                                >
                                    {PLAN_CONFIG[currentPlan].icon}
                                </div>
                                <div>
                                    <CardTitle className="text-lg">
                                        {PLAN_LABELS[currentPlan]} Plan
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        {PLAN_DESCRIPTIONS[currentPlan]}
                                    </CardDescription>
                                </div>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${PLAN_CONFIG[currentPlan].activeBg} ${PLAN_CONFIG[currentPlan].activeText} ${PLAN_CONFIG[currentPlan].activeBorder}`}
                            >
                                Active
                            </span>
                        </div>
                    </CardHeader>
                    {expiresAt && currentPlan !== "free" && (
                        <CardContent className="pt-0">
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/40 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">
                                    Subscription expires on{" "}
                                    <span className="font-medium text-foreground">
                                        {format(
                                            expiresAt,
                                            "MMMM dd, yyyy 'at' hh:mm a",
                                        )}
                                    </span>
                                </span>
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Plan Tier Cards */}
            <div>
                <h2 className="text-base font-semibold text-foreground mb-4">
                    Available Plans
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Free Plan Card */}
                    <Card
                        className={`border-border/60 shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ${
                            currentPlan === "free"
                                ? "ring-2 ring-slate-400/40"
                                : ""
                        }`}
                    >
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-slate-300 to-slate-400" />
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {PLAN_CONFIG.free.icon}
                                    <CardTitle className="text-base">
                                        Free
                                    </CardTitle>
                                </div>
                                {currentPlan === "free" && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 uppercase">
                                        Current
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-foreground mt-1">
                                ₹0
                                <span className="text-sm font-normal text-muted-foreground ml-1">
                                    /forever
                                </span>
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {PLAN_DESCRIPTIONS.free}
                            </p>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between gap-4 pt-0">
                            <ul className="space-y-1.5">
                                {PLAN_FEATURES.free.map((f) => (
                                    <li
                                        key={f}
                                        className="flex items-start gap-2 text-xs text-muted-foreground"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Paid Plan Cards */}
                    {paidPlans.map((plan) => {
                        const isCurrentPlan = currentPlan === plan;
                        const upgradePrice = getUpgradePriceINR(
                            currentPlan,
                            plan,
                        );
                        const canUpgrade = upgradePrice !== null && isOrgOwner;
                        const cfg = PLAN_CONFIG[plan];
                        const isLoadingThis = upgradingPlan === plan;

                        return (
                            <Card
                                key={plan}
                                className={`border-border/60 shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ${
                                    isCurrentPlan
                                        ? `ring-2 ring-offset-1 ${cfg.activeBorder.replace("border-", "ring-")}`
                                        : ""
                                } ${plan === "premium" ? "shadow-amber-500/10" : ""}`}
                            >
                                <div
                                    className={`absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r ${
                                        plan === "basic"
                                            ? "from-blue-400 to-blue-500"
                                            : plan === "pro"
                                              ? "from-violet-500 to-purple-500"
                                              : "from-amber-400 to-orange-400"
                                    }`}
                                />
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {cfg.icon}
                                            <CardTitle className="text-base">
                                                {PLAN_LABELS[plan]}
                                            </CardTitle>
                                        </div>
                                        {isCurrentPlan && (
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cfg.activeBg} ${cfg.activeText} ${cfg.activeBorder}`}
                                            >
                                                Current
                                            </span>
                                        )}
                                        {plan === "premium" &&
                                            !isCurrentPlan && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
                                                    Best Value
                                                </span>
                                            )}
                                    </div>
                                    <p className="text-2xl font-bold text-foreground mt-1">
                                        ₹{PLAN_PRICES_INR[plan]}
                                        <span className="text-sm font-normal text-muted-foreground ml-1">
                                            /mo
                                        </span>
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {PLAN_DESCRIPTIONS[plan]}
                                    </p>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between gap-4 pt-0">
                                    <ul className="space-y-1.5">
                                        {PLAN_FEATURES[plan].map((f) => (
                                            <li
                                                key={f}
                                                className={`flex items-start gap-2 text-xs ${
                                                    isCurrentPlan ||
                                                    isAtLeastPlan(
                                                        currentPlan,
                                                        plan,
                                                    )
                                                        ? "text-foreground"
                                                        : "text-muted-foreground"
                                                }`}
                                            >
                                                <CheckCircle2
                                                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                                        isCurrentPlan ||
                                                        isAtLeastPlan(
                                                            currentPlan,
                                                            plan,
                                                        )
                                                            ? cfg.activeText
                                                            : "text-muted-foreground/40"
                                                    }`}
                                                />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    {canUpgrade && (
                                        <Button
                                            className={`w-full text-xs h-9 gap-1.5 cursor-pointer shadow-sm ${cfg.buttonBg}`}
                                            disabled={isLoadingThis}
                                            onClick={() => handleUpgrade(plan)}
                                        >
                                            {isLoadingThis ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                    Upgrade for ₹{upgradePrice}
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    {isCurrentPlan && (
                                        <div
                                            className={`text-center text-xs font-medium py-1.5 rounded-md ${cfg.activeBg} ${cfg.activeText}`}
                                        >
                                            ✓ Active Plan
                                        </div>
                                    )}

                                    {!canUpgrade &&
                                        !isCurrentPlan &&
                                        !isOrgOwner &&
                                        upgradePrice !== null && (
                                            <p className="text-[11px] text-center text-muted-foreground">
                                                Ask your org owner to upgrade
                                            </p>
                                        )}

                                    {upgradePrice === null &&
                                        !isCurrentPlan && (
                                            <div className="text-center text-xs text-muted-foreground/60 py-1">
                                                Lower tier
                                            </div>
                                        )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Payment Security Card */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                            <span>Payment Security</span>
                        </CardTitle>
                        <CardDescription className="text-xs leading-relaxed">
                            All payments are securely processed via Razorpay
                            with HMAC SHA-256 signature verification.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs text-muted-foreground">
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border/40 space-y-2">
                            <p className="font-semibold text-foreground">
                                Need support?
                            </p>
                            <p>
                                Contact organization billing support if you
                                encounter any payment issues.
                            </p>
                            {supportContact && (
                                <div className="space-y-1 pt-1 border-t border-border/40 text-xs font-medium text-foreground">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                                        <a
                                            href={`mailto:${supportContact.email}`}
                                            className="hover:underline truncate min-w-0"
                                        >
                                            {supportContact.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                                        <a
                                            href={`tel:${supportContact.phone}`}
                                            className="hover:underline truncate min-w-0"
                                        >
                                            {supportContact.phone}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border/40 space-y-1.5">
                            <p className="font-semibold text-foreground">
                                Upgrade Pricing
                            </p>
                            <p>
                                Upgrading your plan charges only the price
                                difference. Your expiry date stays unchanged.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Feature Summary Card */}
                <Card className="border-border/60 shadow-sm md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>Plan Features Summary</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">
                                        Reports (Basic+)
                                    </p>
                                    <p className="text-muted-foreground">
                                        Project, phase, sprint & member activity
                                        reports.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Video className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">
                                        Member Calls (Pro+)
                                    </p>
                                    <p className="text-muted-foreground">
                                        Voice/video calling with screen sharing
                                        between members.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Bot className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">
                                        AI Assistant (Premium)
                                    </p>
                                    <p className="text-muted-foreground">
                                        AI Chat + AI-generated project & sprint
                                        summaries.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">
                                        Differential Pricing
                                    </p>
                                    <p className="text-muted-foreground">
                                        Pay only the difference when upgrading.
                                        Expiry unchanged.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        <span>Transaction History</span>
                    </CardTitle>
                    <CardDescription>
                        List of all payment transactions processed for this
                        organization.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isTxLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12 space-y-2">
                            <AlertCircle className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                            <p className="text-sm text-muted-foreground">
                                No transactions recorded yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-md border border-border/60 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-secondary/40">
                                            <TableHead>Date</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Razorpay Order ID
                                            </TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((tx) => (
                                            <TableRow key={tx.id}>
                                                <TableCell className="text-xs">
                                                    {format(
                                                        new Date(tx.createdAt),
                                                        "MMM dd, yyyy HH:mm",
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground max-w-35 sm:max-w-50 truncate">
                                                    {tx.description ||
                                                        "Subscription"}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                                                    {tx.razorpayOrderId}
                                                </TableCell>
                                                <TableCell className="font-semibold text-xs">
                                                    ₹
                                                    {Number(tx.amount).toFixed(
                                                        2,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase ${
                                                            tx.status ===
                                                            "captured"
                                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                : tx.status ===
                                                                    "failed"
                                                                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                        }`}
                                                    >
                                                        {tx.status ===
                                                        "captured"
                                                            ? "Paid"
                                                            : tx.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between text-xs pt-2">
                                    <span className="text-muted-foreground">
                                        Page {pagination.page} of{" "}
                                        {pagination.totalPages}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page <= 1}
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.max(1, p - 1),
                                                )
                                            }
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                page >= pagination.totalPages
                                            }
                                            onClick={() =>
                                                setPage((p) => p + 1)
                                            }
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default BillingPage;
