import { useEffect, useRef } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { History, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/Skeletons";
import { getColor, getInitials } from "@/lib/utils";

export interface ActivityItem {
    id: string;
    description: string;
    user?: { username?: string } | null;
    createdAt?: string;
}

export interface ActivityTimelineProps {
    activities: ActivityItem[];
    isActivitiesLoading: boolean;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
}

/** Vertical audit timeline of changes. */
export function ActivityTimeline({
    activities,
    isActivitiesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
}: ActivityTimelineProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage) return;
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isActivitiesLoading) return <ListSkeleton rows={4} />;

    if (activities.length === 0) {
        return (
            <EmptyState
                icon={History}
                title="No activity yet"
                description="Status changes, edits and assignments will be recorded here."
                size="sm"
            />
        );
    }

    return (
        <div>
            <ol className="relative">
                {activities.map((act, i) => {
                    const who: string = act.user?.username || "System";
                    const isLast = i === activities.length - 1;
                    return (
                        <li key={act.id} className="relative flex gap-3 pb-5">
                            {!isLast && (
                                <span
                                    aria-hidden="true"
                                    className="absolute top-8 bottom-0 left-[13px] w-px bg-border"
                                />
                            )}
                            <span
                                aria-hidden="true"
                                className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-4 ring-card"
                                style={{ backgroundColor: getColor(who) }}
                            >
                                {getInitials(who)}
                            </span>
                            <div className="min-w-0 flex-1 pt-0.5">
                                <p className="text-[13px] leading-relaxed wrap-break-word text-foreground">
                                    <span className="font-medium">{who}</span>{" "}
                                    <span className="text-muted-foreground">
                                        ·
                                    </span>{" "}
                                    <span className="text-foreground/85">
                                        {act.description}
                                    </span>
                                </p>
                                {act.createdAt && (
                                    <time
                                        dateTime={act.createdAt}
                                        title={format(
                                            new Date(act.createdAt),
                                            "PPpp",
                                        )}
                                        className="mt-0.5 block text-xs text-muted-foreground"
                                    >
                                        {formatDistanceToNow(
                                            new Date(act.createdAt),
                                            { addSuffix: true },
                                        )}
                                    </time>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
            {isFetchingNextPage && (
                <div className="flex items-center justify-center py-2">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
            )}
            {hasNextPage && !isFetchingNextPage && (
                <div ref={sentinelRef} className="h-4" />
            )}
        </div>
    );
}
