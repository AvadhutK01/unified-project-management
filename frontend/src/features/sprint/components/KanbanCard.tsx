import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Eye, Pencil } from "lucide-react";
import { type SprintItem } from "../types/sprint.types";
import { getItemId } from "../utils/kanban-utils";
import { Link, useNavigate } from "react-router-dom";
import {
    KanbanCardFrame,
    KanbanCardMenu,
    type KanbanCardAction,
} from "@/components/common/Kanban";
import { SprintCardBody } from "./SprintCardBody";

interface KanbanCardProps {
    sprint: SprintItem;
    onEditRequest?: (sprint: SprintItem) => void;
    canView?: boolean;
    canEdit?: boolean;
}

function KanbanCard({
    sprint,
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
    } = useSortable({ id: getItemId(sprint.id) });

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
                      onSelect: () => navigate(`${sprint.id}`),
                  },
              ]
            : []),
        ...(canEdit
            ? [
                  {
                      label: "Edit",
                      icon: Pencil,
                      onSelect: () => onEditRequest?.(sprint),
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
            aria-label={`Sprint: ${sprint.title}`}
        >
            <SprintCardBody
                sprint={sprint}
                titleSlot={
                    canView ? (
                        <Link
                            to={`${sprint.id}`}
                            draggable={false}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="line-clamp-2 hover:text-primary"
                        >
                            {sprint.title}
                        </Link>
                    ) : undefined
                }
                menu={<KanbanCardMenu actions={actions} label={sprint.title} />}
            />
        </KanbanCardFrame>
    );
}

export default KanbanCard;
