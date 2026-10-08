import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PageContainer } from "./PageHeader";

/* Reusable loading patterns. All placeholder geometry lives here and
   never leaks into real data rendering. */

export function PageHeaderSkeleton({
    withMedia = false,
}: {
    withMedia?: boolean;
}) {
    return (
        <div className="space-y-3">
            <Skeleton className="h-3.5 w-48" />
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                    {withMedia && <Skeleton className="size-12 rounded-xl" />}
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-56" />
                        <Skeleton className="h-4 w-80 max-w-[60vw]" />
                    </div>
                </div>
                <Skeleton className="hidden h-9 w-28 sm:block" />
            </div>
        </div>
    );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div
            className={cn(
                "grid grid-cols-2 gap-3 sm:gap-4",
                count === 3 && "lg:grid-cols-3",
                count === 4 && "lg:grid-cols-4",
                count >= 5 && "md:grid-cols-3 xl:grid-cols-5",
            )}
        >
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-start justify-between rounded-xl border border-border bg-card p-4 shadow-card"
                >
                    <div className="space-y-2.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-6 w-12" />
                    </div>
                    <Skeleton className="hidden size-9 rounded-lg sm:block lg:hidden xl:block" />
                </div>
            ))}
        </div>
    );
}

export function TableSkeleton({
    rows = 6,
    columns = 5,
    className,
}: {
    rows?: number;
    columns?: number;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl border border-border bg-card shadow-card",
                className,
            )}
        >
            <div className="flex items-center gap-6 border-b border-border bg-muted/50 px-4 py-3">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-3 flex-1" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, r) => (
                <div
                    key={r}
                    className="flex items-center gap-6 border-b border-border px-4 py-3.5 last:border-0"
                >
                    {Array.from({ length: columns }).map((_, c) => (
                        <Skeleton
                            key={c}
                            className="h-3.5 flex-1"
                            style={{
                                maxWidth: `${55 + ((r * 3 + c * 7) % 40)}%`,
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton({
    lines = 4,
    className,
}: {
    lines?: number;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "space-y-3 rounded-xl border border-border bg-card p-5 shadow-card",
                className,
            )}
        >
            <Skeleton className="h-4 w-32" />
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className="h-3.5"
                    style={{ width: `${90 - ((i * 13) % 35)}%` }}
                />
            ))}
        </div>
    );
}

export function KanbanSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: columns }).map((_, c) => (
                <div
                    key={c}
                    className="w-[280px] shrink-0 space-y-2.5 rounded-xl border border-border bg-muted/40 p-2.5"
                >
                    <div className="flex items-center justify-between px-1 py-1">
                        <Skeleton className="h-3.5 w-20" />
                        <Skeleton className="h-4 w-6 rounded-full" />
                    </div>
                    {Array.from({ length: 3 - (c % 2) }).map((_, i) => (
                        <div
                            key={i}
                            className="space-y-2.5 rounded-lg border border-border bg-card p-3"
                        >
                            <Skeleton className="h-3.5 w-4/5" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

/** Whole-page placeholder for detail/dashboard routes. */
export function PageSkeleton({
    stats = 4,
    variant = "dashboard",
}: {
    stats?: number;
    variant?: "dashboard" | "table" | "detail";
}) {
    return (
        <PageContainer>
            <PageHeaderSkeleton withMedia={variant !== "table"} />
            {stats > 0 && <StatGridSkeleton count={stats} />}
            {variant === "table" && <TableSkeleton />}
            {variant === "dashboard" && (
                <div className="grid gap-4 xl:grid-cols-3">
                    <CardSkeleton lines={6} className="xl:col-span-2" />
                    <CardSkeleton lines={6} />
                </div>
            )}
            {variant === "detail" && (
                <div className="grid gap-6 xl:grid-cols-3">
                    <div className="space-y-4 xl:col-span-2">
                        <Skeleton className="h-9 w-full max-w-md" />
                        <CardSkeleton lines={5} />
                        <CardSkeleton lines={3} />
                    </div>
                    <div className="space-y-4">
                        <CardSkeleton lines={4} />
                        <CardSkeleton lines={3} />
                    </div>
                </div>
            )}
        </PageContainer>
    );
}

/** Stacked list rows (comments, activities, attachments). */
export function ListSkeleton({
    rows = 4,
    avatar = true,
}: {
    rows?: number;
    avatar?: boolean;
}) {
    return (
        <div className="space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                    {avatar && (
                        <Skeleton className="size-8 shrink-0 rounded-full" />
                    )}
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-40" />
                        <Skeleton
                            className="h-3.5"
                            style={{ width: `${85 - i * 9}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
