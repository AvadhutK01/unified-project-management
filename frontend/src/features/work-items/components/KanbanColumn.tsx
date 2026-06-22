import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { STATUS_LABELS } from "../constants/workitem.constants";
import { type WorkItem, type WorkItemStatus } from "../types/workitem.types";
import { getColumnId, getItemId } from "../utils/kanban-utils";
import KanbanCard from "./KanbanCard";

interface KanbanColumnProps {
    status: WorkItemStatus;
    items: WorkItem[];
    isHighlighted: boolean;
    onEditRequest?: (workItem: WorkItem) => void;
    canView?: boolean;
    canEdit?: boolean;
}

function KanbanColumn({
    status,
    items,
    isHighlighted,
    onEditRequest,
    canView,
    canEdit,
}: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: getColumnId(status),
    });

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
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {items.length}
                </span>
            </div>

            <div className="flex-1 p-3 space-y-3 overflow-y-auto rounded-b-xl">
                <SortableContext
                    items={items.map((s) => getItemId(s.id))}
                    strategy={verticalListSortingStrategy}
                >
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-xs text-muted-foreground">
                                No items
                            </p>
                        </div>
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
            </div>
        </div>
    );
}

export default KanbanColumn;
