import { useState, useRef, useEffect, useMemo } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, MoreVertical, Eye, Edit } from "lucide-react";
import { type SprintItem } from "../types/sprint.types";
import { getItemId, STATUS_COLORS } from "../utils/kanban-utils";
import { useNavigate } from "react-router-dom";

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
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const hasAnyAction = useMemo(() => canView || canEdit, [canView, canEdit]);

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
        opacity: isDragging ? 0.4 : undefined,
    };

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`group rounded-lg border border-border bg-card shadow-xs hover:shadow-md transition-shadow duration-200 border-t-2 touch-none cursor-grab active:cursor-grabbing ${STATUS_COLORS[sprint.status]} ${isDragging ? "ring-2 ring-primary" : ""}`}
        >
            <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <GripVertical className="size-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                            {sprint.title}
                        </p>
                    </div>

                    {hasAnyAction && (
                        <div className="relative shrink-0" ref={dropdownRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDropdownOpen((prev) => !prev);
                                }}
                                className="inline-flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-secondary transition-all size-6 cursor-pointer"
                            >
                                <MoreVertical className="size-4" />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 top-full z-50 mt-1 w-32 rounded-lg border border-border bg-popover shadow-lg overflow-hidden animate-in fade-in zoom-in-95">
                                    {canView && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDropdownOpen(false);
                                                navigate(`${sprint.id}`);
                                            }}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                                        >
                                            <Eye className="size-3.5" />
                                            View
                                        </button>
                                    )}
                                    {canEdit && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDropdownOpen(false);
                                                onEditRequest?.(sprint);
                                            }}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                                        >
                                            <Edit className="size-3.5" />
                                            Edit
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {sprint.description}
                </p> */}
                <div
                    className="prose prose-sm max-w-none line-clamp-2"
                    dangerouslySetInnerHTML={{
                        __html: sprint.description,
                    }}
                />
            </div>
        </div>
    );
}

export default KanbanCard;
