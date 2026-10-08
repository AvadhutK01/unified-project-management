import { RefreshCw, Sparkles, Loader2, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscriptionQuery } from "@/features/subscriptions/hooks/useSubscription";
import { useOrganizationStore } from "@/store/organization.store";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { cn } from "@/lib/utils";
import type { DashboardData } from "../types/dashboard.types";

interface Props {
    data?: DashboardData;
    summary?: string;
    isPending?: boolean;
    onGenerate?: () => void;
    /** Heading shown on the card. */
    title?: string;
    /** What is being summarised — used in helper copy. */
    subject?: string;
    className?: string;
}

function renderInline(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <strong key={i} className="font-semibold text-foreground">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
            return (
                <code
                    key={i}
                    className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }
        return part;
    });
}

function formatSummary(text: string) {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const trimmed = raw.trim();
        if (!trimmed) continue;

        const sectionMatch = trimmed.match(/^\*{1,3}\s+\*{2}(.+?)\*{2}:?\s*$/);
        if (sectionMatch) {
            elements.push(
                <li
                    key={key++}
                    className="pt-3 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase first:pt-0"
                >
                    {sectionMatch[1].replace(/:$/, "")}
                </li>,
            );
            continue;
        }

        const boldHeaderMatch = trimmed.match(/^\*{2}(.+?)\*{2}:?\s*$/);
        if (boldHeaderMatch) {
            elements.push(
                <li
                    key={key++}
                    className="pt-3 pb-1 text-[13px] font-semibold text-foreground first:pt-0"
                >
                    {boldHeaderMatch[1].replace(/:$/, "")}
                </li>,
            );
            continue;
        }

        const boldBulletMatch = trimmed.match(
            /^\*{1,3}\s+\*{2}(.+?)\*{2}:?\s*(.+)/,
        );
        if (boldBulletMatch) {
            elements.push(
                <li
                    key={key++}
                    className="flex items-start gap-2.5 py-1 text-[13px] leading-relaxed text-foreground/85"
                >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                        <strong className="font-semibold text-foreground">
                            {boldBulletMatch[1]}:
                        </strong>{" "}
                        {renderInline(boldBulletMatch[2])}
                    </span>
                </li>,
            );
            continue;
        }

        const plainBulletMatch = trimmed.match(/^\*{1,3}\s+(.+)/);
        if (plainBulletMatch) {
            elements.push(
                <li
                    key={key++}
                    className="flex items-start gap-2.5 py-1 text-[13px] leading-relaxed text-foreground/85"
                >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                    <span>{renderInline(plainBulletMatch[1])}</span>
                </li>,
            );
            continue;
        }

        elements.push(
            <li
                key={key++}
                className="py-1 text-[13px] leading-relaxed text-muted-foreground"
            >
                {renderInline(trimmed)}
            </li>,
        );
    }

    return elements;
}

/** Small brand-tinted AI glyph tile. */
function AiGlyph({ muted = false }: { muted?: boolean }) {
    return (
        <span
            className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                muted
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary/10 text-primary ring-1 ring-primary/15 dark:bg-primary/15",
            )}
        >
            <Sparkles className="size-4" />
        </span>
    );
}

const AiSummary = ({
    summary,
    isPending,
    onGenerate,
    title = "AI Insights",
    subject = "workspace",
    className,
}: Props) => {
    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );
    const { data: subscription } = useSubscriptionQuery();
    const { isOrgOwner } = usePermission();
    const isPremium = subscription?.isPremium ?? false;

    if (!isPremium) {
        return (
            <section
                className={cn(
                    "rounded-xl border border-border bg-card p-5 shadow-card",
                    className,
                )}
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <AiGlyph muted />
                        <div className="min-w-0">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                {title}
                                <span className="inline-flex items-center gap-1 rounded border border-warning/25 bg-warning/10 px-1.5 py-px text-[10px] font-semibold text-warning">
                                    <Lock className="size-2.5" />
                                    Premium
                                </span>
                            </h3>
                            <p className="mt-0.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
                                {isOrgOwner
                                    ? `Upgrade to Premium to generate AI summaries of your ${subject}'s progress and activity.`
                                    : "This feature requires an Organization Premium subscription. Contact your organization owner to upgrade."}
                            </p>
                        </div>
                    </div>
                    {isOrgOwner && (
                        <Button asChild size="sm" variant="outline">
                            <a href={`/${activeOrganization?.slug}/billing`}>
                                View plans
                                <ArrowRight className="size-3.5" />
                            </a>
                        </Button>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section
            className={cn(
                "relative overflow-hidden rounded-xl border border-border bg-card shadow-card",
                className,
            )}
        >
            {/* Subtle brand edge */}
            <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"
            />
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                    <AiGlyph />
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground">
                            {title}
                        </h3>
                        <p className="truncate text-xs text-muted-foreground">
                            AI-generated overview of your {subject}
                        </p>
                    </div>
                </div>
                <Button
                    variant={summary ? "outline" : "default"}
                    size="sm"
                    onClick={onGenerate}
                    disabled={isPending}
                    className="shrink-0"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="size-3.5 animate-spin" />
                            Generating…
                        </>
                    ) : summary ? (
                        <>
                            <RefreshCw className="size-3.5" />
                            Regenerate
                        </>
                    ) : (
                        <>
                            <Sparkles className="size-3.5" />
                            Generate
                        </>
                    )}
                </Button>
            </div>

            <div className="px-5 py-4" aria-live="polite" aria-busy={isPending}>
                {isPending && !summary ? (
                    <div className="space-y-2.5">
                        <p className="text-[13px] text-muted-foreground">
                            Analyzing your {subject}…
                        </p>
                        <Skeleton className="h-3.5 w-11/12" />
                        <Skeleton className="h-3.5 w-4/5" />
                        <Skeleton className="h-3.5 w-3/5" />
                    </div>
                ) : summary ? (
                    <>
                        <ul
                            className={cn(
                                "m-0 list-none p-0 transition-opacity",
                                isPending && "opacity-60",
                            )}
                        >
                            {formatSummary(summary)}
                        </ul>
                        <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
                            Generated by AI — review before acting on it.
                        </p>
                    </>
                ) : (
                    <div className="py-4 text-center">
                        <p className="text-[13px] font-medium text-foreground">
                            No summary yet
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                            Generate an AI overview of your {subject}'s
                            progress, risks and recent activity.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AiSummary;
