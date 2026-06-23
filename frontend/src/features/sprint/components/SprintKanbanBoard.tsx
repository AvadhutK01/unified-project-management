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
import { SPRINT_STATUSES } from "../constants/sprint.constants";
import { type SprintItem, type SprintStatus } from "../types/sprint.types";
import { getItemId, parseItemId, parseColumnId } from "../utils/kanban-utils";
import { useSprintsKanban } from "../hooks/useSprintsKanban";
import KanbanColumn from "./KanbanColumn";
import DragOverlayCard from "./DragOverlayCard";

const SPRINT_TRANSITIONS: Record<string, string[]> = {
    new: ["active", "removed"],
    active: ["onhold", "closed", "removed"],
    onhold: ["active", "closed", "removed"],
    removed: [],
    closed: [],
};

function isValidSprintTransition(from: string, to: string): boolean {
    if (from === to) return true;
    return SPRINT_TRANSITIONS[from]?.includes(to) ?? false;
}

interface SprintKanbanBoardProps {
    phaseId?: string;
    onEditRequest?: (sprint: SprintItem) => void;
    onStatusChange?: (
        sprint: SprintItem,
        newStatus: string,
        newSequence?: number,
    ) => Promise<void> | void;
    canView?: boolean;
    canEdit?: boolean;
}

const SprintKanbanBoard = ({
    phaseId,
    onEditRequest,
    onStatusChange,
    canView,
    canEdit,
}: SprintKanbanBoardProps) => {
    const { itemsByStatus, loading, hasMore, loadMore } =
        useSprintsKanban(phaseId);

    const [items, setItems] = useState<SprintItem[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    useEffect(() => {
        setItems(Object.values(itemsByStatus).flat());
    }, [itemsByStatus]);

    const grouped = useMemo(() => {
        const map: Record<SprintStatus, SprintItem[]> = {
            new: [],
            active: [],
            closed: [],
            removed: [],
            onhold: [],
        };
        for (const item of items) {
            if (map[item.status]) {
                map[item.status].push(item);
            }
        }
        for (const key of Object.keys(map)) {
            map[key as SprintStatus].sort(
                (a, b) => (a.sequence ?? 0) - (b.sequence ?? 0),
            );
        }
        return map;
    }, [items]);

    const activeSprint = useMemo(
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
        (id: string): SprintStatus | null => {
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

            if (!isValidSprintTransition(fromStatus, toStatus)) return;

            const activeItemId = parseItemId(activeIdStr);
            const prevItems = items;
            const activeIndex = prevItems.findIndex(
                (s) => s.id === activeItemId,
            );
            if (activeIndex === -1) return;

            const activeItem = prevItems[activeIndex];
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
                "closed",
                "removed",
                "onhold",
            ] as SprintStatus[];
            for (const col of columns) {
                const colItems = newItems.filter((s) => s.status === col);
                colItems.forEach((s, i) => {
                    const idx = newItems.findIndex((si) => si.id === s.id);
                    if (idx !== -1) {
                        newItems[idx] = { ...newItems[idx], sequence: i + 1 };
                    }
                });
            }

            setItems(newItems);

            const movedIndex = newItems.findIndex((s) => s.id === activeItemId);
            const newSequence = newItems[movedIndex]?.sequence;

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
                    isValidSprintTransition(fromStatus, toStatus)
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
                    {SPRINT_STATUSES.map((status) => (
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
                {activeSprint ? (
                    <DragOverlayCard sprint={activeSprint} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default SprintKanbanBoard;
