import { TONE_BORDER_TOP, WORKFLOW_TONE } from "@/lib/tones";
import { SPRINT_STATUSES } from "../constants/sprint.constants";
import { type SprintStatus } from "../types/sprint.types";

export const STATUS_COLORS: Record<SprintStatus, string> = {
    new: TONE_BORDER_TOP[WORKFLOW_TONE.new],
    active: TONE_BORDER_TOP[WORKFLOW_TONE.active],
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

export function getColumnId(status: SprintStatus) {
    return `column-${status}`;
}

export function parseColumnId(id: string): SprintStatus | null {
    const status = id.replace(/^column-/, "");
    return (SPRINT_STATUSES as string[]).includes(status)
        ? (status as SprintStatus)
        : null;
}
