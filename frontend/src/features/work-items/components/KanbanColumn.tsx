import { useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Loader2 } from "lucide-react";
import { STATUS_LABELS } from "../constants/workitem.constants";
import { type WorkItem, type WorkItemStatus } from "../types/workitem.types";
import { getColumnId, getItemId } from "../utils/kanban-utils";
import KanbanCard from "./KanbanCard";
import {
    KanbanColumnEmpty,
    KanbanColumnFrame,
} from "@/components/common/Kanban";
import { WORKFLOW_TONE } from "@/lib/tones";

interface KanbanColumnProps {
    status: WorkItemStatus;
    items: WorkItem[];
    isHighlighted: boolean;
    onEditRequest?: (workItem: WorkItem) => void;
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
        <KanbanColumnFrame
            ref={setNodeRef}
            title={STATUS_LABELS[status]}
            tone={WORKFLOW_TONE[status] ?? "neutral"}
            count={items.length}
            isHighlighted={isHighlighted}
            loading={loading}
            footer={
                hasMore && (
                    <div ref={sentinelRef} className="flex justify-center py-2">
                        {loading ? (
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        ) : (
                            <button
                                onClick={onLoadMore}
                                className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                Load more
                            </button>
                        )}
                    </div>
                )
            }
        >
            <SortableContext
                items={items.map((w) => getItemId(w.id))}
                strategy={verticalListSortingStrategy}
            >
                {items.length === 0 && !loading ? (
                    <KanbanColumnEmpty label="No work items" />
                ) : (
                    items.map((workItem) => (
                        <KanbanCard
                            key={workItem.id}
                            workItem={workItem}
                            onEditRequest={onEditRequest}
                            canView={canView}
                            canEdit={canEdit}
                        />
                    ))
                )}
            </SortableContext>
        </KanbanColumnFrame>
    );
}

export default KanbanColumn;
