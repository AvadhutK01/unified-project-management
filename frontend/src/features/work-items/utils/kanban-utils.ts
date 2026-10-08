import { TONE_BORDER_TOP, WORKFLOW_TONE } from "@/lib/tones";
import { WORK_ITEM_STATUSES } from "../constants/workitem.constants";
import type { WorkItemStatus } from "../types/workitem.types";

export const STATUS_COLORS: Record<WorkItemStatus, string> = {
    new: TONE_BORDER_TOP[WORKFLOW_TONE.new],
    active: TONE_BORDER_TOP[WORKFLOW_TONE.active],
    resolved: TONE_BORDER_TOP[WORKFLOW_TONE.resolved],
    closed: TONE_BORDER_TOP[WORKFLOW_TONE.closed],
    removed: TONE_BORDER_TOP[WORKFLOW_TONE.removed],
    onhold: TONE_BORDER_TOP[WORKFLOW_TONE.onhold],
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
