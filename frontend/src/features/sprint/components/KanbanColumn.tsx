import { useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Loader2 } from "lucide-react";
import { STATUS_LABELS } from "../constants/sprint.constants";
import { type SprintItem, type SprintStatus } from "../types/sprint.types";
import { getColumnId, getItemId } from "../utils/kanban-utils";
import KanbanCard from "./KanbanCard";

interface KanbanColumnProps {
    status: SprintStatus;
    items: SprintItem[];
    isHighlighted: boolean;
    onEditRequest?: (sprint: SprintItem) => void;
    canView?: boolean;
    canEdit?: boolean;
    loading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

function KanbanColumn({
    status,
    items,
    isHighlighted,
    onEditRequest,
    canView,
    canEdit,
    loading = false,
    hasMore = false,
    onLoadMore,
}: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: getColumnId(status),
    });

    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasMore || !onLoadMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    onLoadMore();
                }
            },
            { rootMargin: "200px" },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, onLoadMore, loading]);

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col rounded-xl border transition-all duration-200 min-h-[500px] ${isHighlighted ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary" : "border-border bg-card/50"}`}
            style={{ width: "280px" }}
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-current" />
                    <span className="text-sm font-medium text-foreground">
                        {STATUS_LABELS[status]}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    {loading && (
                        <Loader2 className="size-3 animate-spin text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        {items.length}
                    </span>
                </div>
            </div>

            <div className="flex-1 p-3 space-y-3 overflow-y-auto rounded-b-xl">
                <SortableContext
                    items={items.map((s) => getItemId(s.id))}
                    strategy={verticalListSortingStrategy}
                >
                    {items.length === 0 && !loading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-xs text-muted-foreground">
                                No items
                            </p>
                        </div>
                    ) : (
                        items.map((sprint) => (
                            <KanbanCard
                                key={sprint.id}
                                sprint={sprint}
                                onEditRequest={onEditRequest}
                                canView={canView}
                                canEdit={canEdit}
                            />
                        ))
                    )}
                </SortableContext>

                {hasMore && (
                    <div ref={sentinelRef} className="flex justify-center py-2">
                        {loading ? (
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        ) : (
                            <button
                                onClick={onLoadMore}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                Load more
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default KanbanColumn;
