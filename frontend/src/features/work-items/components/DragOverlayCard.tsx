import { GripVertical } from "lucide-react";
import { type WorkItem } from "../types/workitem.types";
import { STATUS_COLORS } from "../utils/kanban-utils";

interface DragOverlayCardProps {
    workItem: WorkItem;
}

function DragOverlayCard({ workItem }: DragOverlayCardProps) {
    return (
        <div
            className={`rounded-lg border border-border bg-card shadow-xl border-t-2 ${STATUS_COLORS[workItem.status]} rotate-3`}
        >
            <div className="p-3 space-y-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    <GripVertical className="size-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                        {workItem.title}
                    </p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {workItem.description}
                </p>
            </div>
        </div>
    );
}

export default DragOverlayCard;
