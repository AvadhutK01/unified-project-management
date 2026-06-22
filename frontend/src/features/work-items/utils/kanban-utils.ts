import { WORK_ITEM_STATUSES } from "../constants/workitem.constants";
import type { WorkItemStatus } from "../types/workitem.types";

export const STATUS_COLORS: Record<WorkItemStatus, string> = {
    new: "border-t-purple-500",
    active: "border-t-green-500",
    resolved: "border-t-blue-500",
    closed: "border-t-gray-400",
    removed: "border-t-red-500",
    onhold: "border-t-amber-500",
};

export function getItemId(id: string) {
    return `item-${id}`;
}

export function parseItemId(id: string) {
    return id.replace(/^item-/, "");
}

export function getColumnId(status: WorkItemStatus) {
    return `column-${status}`;
}

export function parseColumnId(id: string): WorkItemStatus | null {
    const status = id.replace(/^column-/, "");
    return (WORK_ITEM_STATUSES as readonly string[]).includes(status)
        ? (status as WorkItemStatus)
        : null;
}
