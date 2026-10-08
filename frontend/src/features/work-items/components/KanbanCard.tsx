import { useNavigate, Link } from "react-router-dom";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Eye, Pencil } from "lucide-react";
import { type WorkItem } from "../types/workitem.types";
import { getItemId } from "../utils/kanban-utils";
import {
    KanbanCardFrame,
    KanbanCardMenu,
    type KanbanCardAction,
} from "@/components/common/Kanban";
import { WorkItemCardBody } from "./WorkItemCardBody";

interface KanbanCardProps {
    workItem: WorkItem;
    onEditRequest?: (workItem: WorkItem) => void;
    canView?: boolean;
    canEdit?: boolean;
}

function KanbanCard({
    workItem,
    onEditRequest,
    canView,
    canEdit,
}: KanbanCardProps) {
    const navigate = useNavigate();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: getItemId(workItem.id) });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const actions: KanbanCardAction[] = [
        ...(canView
            ? [
                  {
                      label: "View",
                      icon: Eye,
                      onSelect: () => navigate(workItem.id),
                  },
              ]
            : []),
        ...(canEdit
            ? [
                  {
                      label: "Edit",
                      icon: Pencil,
                      onSelect: () => onEditRequest?.(workItem),
                  },
              ]
            : []),
    ];

    return (
        <KanbanCardFrame
            ref={setNodeRef}
            style={style}
            isDragging={isDragging}
            {...attributes}
            {...listeners}
            aria-label={`${workItem.type === "bug" ? "Bug" : "Task"}: ${workItem.title}`}
        >
            <WorkItemCardBody
                workItem={workItem}
                titleSlot={
                    canView ? (
                        <Link
                            to={workItem.id}
                            draggable={false}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="line-clamp-2 hover:text-primary"
                        >
                            {workItem.title}
                        </Link>
                    ) : undefined
                }
                menu={
                    <KanbanCardMenu actions={actions} label={workItem.title} />
                }
            />
        </KanbanCardFrame>
    );
}

export default KanbanCard;
