import { useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Sparkles, User, Clock } from "lucide-react";
import type { SprintActivitiesTabProps } from "../types/sprint.types";

const SprintActivitiesTab = ({
    activities,
    isActivitiesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
}: SprintActivitiesTabProps) => {
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
    return (
        <div className="p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs space-y-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Sprint Activity Log
            </h3>

            <div className="space-y-6 relative before:absolute before:inset-y-2 before:left-[17px] before:w-[2px] before:bg-border/60">
                {isActivitiesLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                ) : activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6 italic">
                        No activities logged yet.
                    </p>
                ) : (
                    activities.map((act: any) => (
                        <div key={act.id} className="flex gap-4 relative">
                            <div className="size-9 shrink-0 rounded-full bg-background border border-border/80 flex items-center justify-center z-10 text-primary/80 shadow-xs">
                                <Sparkles className="size-3.5" />
                            </div>
                            <div className="flex-1 pt-1 min-w-0">
                                <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                                    {act.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <User className="size-3" />
                                        <span>
                                            {act.user?.username || "System"}
                                        </span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="size-3" />
                                        <span>
                                            {act.createdAt
                                                ? formatDistanceToNow(
                                                      new Date(act.createdAt),
                                                      { addSuffix: true },
                                                  )
                                                : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {isFetchingNextPage && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                )}
                {hasNextPage && !isFetchingNextPage && (
                    <div ref={sentinelRef} className="h-4" />
                )}
            </div>
        </div>
    );
};

export default SprintActivitiesTab;
