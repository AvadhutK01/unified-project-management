import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TONE_ICON, type Tone } from "@/lib/tones";

interface StatCardProps {
    label: string;
    value: ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    tone?: Tone;
    /** Supporting line under the metric, e.g. "of 12 total". */
    hint?: ReactNode;
    className?: string;
}

/**
 * KPI tile. Shows only what the caller passes — never synthesises trends.
 */
export function StatCard({
    label,
    value,
    icon: Icon,
    tone = "primary",
    hint,
    className,
}: StatCardProps) {
    return (
        <div
            className={cn(
                "flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-card",
                className,
            )}
        >
            <div className="min-w-0 space-y-1.5">
                <p className="line-clamp-2 text-[13px] leading-snug font-medium text-muted-foreground">
                    {label}
                </p>
                <p className="tabular text-2xl leading-none font-semibold tracking-tight text-foreground">
                    {value}
                </p>
                {hint && (
                    <p className="truncate text-xs text-muted-foreground">
                        {hint}
                    </p>
                )}
            </div>
            {Icon && (
                <div
                    className={cn(
                        "hidden size-9 shrink-0 items-center justify-center rounded-lg sm:flex lg:hidden xl:flex",
                        TONE_ICON[tone],
                    )}
                >
                    <Icon className="size-[18px]" />
                </div>
            )}
        </div>
    );
}

/** Responsive grid wrapper for StatCards. */
export function StatGrid({
    children,
    columns = 4,
    className,
}: {
    children: ReactNode;
    columns?: 2 | 3 | 4 | 5;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "grid grid-cols-2 gap-3 sm:gap-4",
                columns === 3 && "lg:grid-cols-3",
                columns === 4 && "lg:grid-cols-4",
                columns === 5 && "md:grid-cols-3 xl:grid-cols-5",
                className,
            )}
        >
            {children}
        </div>
    );
}
