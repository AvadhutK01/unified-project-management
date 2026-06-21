import { SPRINT_STATUSES } from "../constants/sprint.constants";
import { type SprintStatus } from "../types/sprint.types";

export const STATUS_COLORS: Record<SprintStatus, string> = {
    new: "border-t-purple-500",
    active: "border-t-green-500",
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

export function getColumnId(status: SprintStatus) {
    return `column-${status}`;
}

export function parseColumnId(id: string): SprintStatus | null {
    const status = id.replace(/^column-/, "");
    return (SPRINT_STATUSES as string[]).includes(status)
        ? (status as SprintStatus)
        : null;
}
