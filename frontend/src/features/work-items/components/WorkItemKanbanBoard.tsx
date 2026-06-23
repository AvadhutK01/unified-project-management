import { useState, useMemo, useCallback, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { WORK_ITEM_STATUSES } from "../constants/workitem.constants";
import { type WorkItem, type WorkItemStatus } from "../types/workitem.types";
import { getItemId, parseItemId, parseColumnId } from "../utils/kanban-utils";
import { useWorkItemsKanban } from "../hooks/useWorkItemsKanban";
import KanbanColumn from "./KanbanColumn";
import DragOverlayCard from "./DragOverlayCard";

const WORK_ITEM_TRANSITIONS: Record<string, string[]> = {
    new: ["active", "removed"],
    active: ["resolved", "closed", "onhold", "removed"],
    onhold: ["active", "closed", "removed"],
    resolved: ["active", "closed", "removed"],
    closed: [],
    removed: [],
};

function isValidWorkItemTransition(
    from: string,
    to: string,
    type?: string,
): boolean {
    if (from === to) return true;
    if (!WORK_ITEM_TRANSITIONS[from]?.includes(to)) return false;
    if (type === "task" && to === "resolved") return false;
    return true;
}

interface WorkItemKanbanBoardProps {
    sprintId?: string;
    onEditRequest?: (workItem: WorkItem) => void;
    onStatusChange?: (
        workItem: WorkItem,
        newStatus: string,
        newSequence?: number,
    ) => Promise<void> | void;
    canView?: boolean;
    canEdit?: boolean;
}

const WorkItemKanbanBoard = ({
    sprintId,
    onEditRequest,
    onStatusChange,
    canView,
    canEdit,
}: WorkItemKanbanBoardProps) => {
    const { itemsByStatus, loading, hasMore, loadMore } =
        useWorkItemsKanban(sprintId);
    const [items, setItems] = useState<WorkItem[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    useEffect(() => {
        setItems(Object.values(itemsByStatus).flat());
    }, [itemsByStatus]);

    const grouped = useMemo(() => {
        const map: Record<WorkItemStatus, WorkItem[]> = {
            new: [],
            active: [],
            resolved: [],
            closed: [],
            removed: [],
            onhold: [],
        };
        for (const item of items) {
            if (map[item.status]) {
                map[item.status].push(item);
            }
        }
        return map;
    }, [items]);

    const activeWorkItem = useMemo(
        () =>
            activeId ? items.find((s) => getItemId(s.id) === activeId) : null,
        [activeId, items],
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const findContainer = useCallback(
        (id: string): WorkItemStatus | null => {
            const columnStatus = parseColumnId(id);
            if (columnStatus) return columnStatus;

            const item = items.find((s) => getItemId(s.id) === id);
            return item ? item.status : null;
        },
        [items],
    );

    const overStatus = useMemo(() => {
        if (!overId) return null;
        return findContainer(overId);
    }, [overId, findContainer]);

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;
            setOverId(null);
            setActiveId(null);

            if (!over) return;

            const activeIdStr = active.id as string;
            const overIdStr = over.id as string;

            const fromStatus = findContainer(activeIdStr);
            const toStatus = findContainer(overIdStr);

            if (!fromStatus || !toStatus) return;

            const activeItemId = parseItemId(activeIdStr);
            const prevItems = items;
            const activeIndex = prevItems.findIndex(
                (s) => s.id === activeItemId,
            );
            if (activeIndex === -1) return;

            const activeItem = prevItems[activeIndex];

            if (
                !isValidWorkItemTransition(
                    fromStatus,
                    toStatus,
                    activeItem.type,
                )
            )
                return;
            const updatedItem = { ...activeItem, status: toStatus };

            const remainingItems = prevItems.filter(
                (s) => s.id !== activeItemId,
            );
            const overItemId = parseItemId(overIdStr);
            const overIndex = remainingItems.findIndex(
                (s) => s.id === overItemId,
            );

            const newItems = [...remainingItems];
            if (overIndex !== -1) {
                newItems.splice(overIndex, 0, updatedItem);
            } else {
                newItems.push(updatedItem);
            }

            const columns = [
                "new",
                "active",
                "resolved",
                "closed",
                "removed",
                "onhold",
            ] as WorkItemStatus[];
            for (const col of columns) {
                const colItems = newItems.filter((s) => s.status === col);
                colItems.forEach((s) => {
                    const idx = newItems.findIndex((si) => si.id === s.id);
                    if (idx !== -1) {
                        newItems[idx] = { ...newItems[idx] };
                    }
                });
            }

            setItems(newItems);

            const movedIndex = newItems.findIndex((s) => s.id === activeItemId);
            const newSequence = movedIndex !== -1 ? movedIndex + 1 : undefined;

            const isSameColumn = fromStatus === toStatus;

            if (!isSameColumn) {
                try {
                    await onStatusChange?.(
                        prevItems[activeIndex],
                        toStatus,
                        newSequence,
                    );
                } catch {
                    setItems(prevItems);
                }
            }
        },
        [findContainer, items, onStatusChange],
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(event: DragEndEvent) => {
                setActiveId(event.active.id as string);
                setOverId(null);
            }}
            onDragOver={(event: DragOverEvent) => {
                const over = event.over;
                if (!over || !activeId) {
                    setOverId(null);
                    return;
                }
                const fromStatus = findContainer(activeId);
                const toStatus = findContainer(over.id as string);
                if (
                    fromStatus &&
                    toStatus &&
                    isValidWorkItemTransition(fromStatus, toStatus)
                ) {
                    setOverId(over.id as string);
                } else {
                    setOverId(null);
                }
            }}
            onDragEnd={handleDragEnd}
            onDragCancel={() => {
                setActiveId(null);
                setOverId(null);
            }}
        >
            <div className="overflow-x-auto pb-2">
                <div
                    className="flex gap-4 min-w-0"
                    style={{ width: "max-content" }}
                >
                    {WORK_ITEM_STATUSES.map((status) => (
                        <KanbanColumn
                            key={status}
                            status={status}
                            items={grouped[status]}
                            isHighlighted={overStatus === status}
                            onEditRequest={onEditRequest}
                            canView={canView}
                            canEdit={canEdit}
                            loading={loading[status]}
                            hasMore={hasMore[status]}
                            onLoadMore={() => loadMore(status)}
                        />
                    ))}
                </div>
            </div>

            <DragOverlay>
                {activeWorkItem ? (
                    <DragOverlayCard workItem={activeWorkItem} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default WorkItemKanbanBoard;
