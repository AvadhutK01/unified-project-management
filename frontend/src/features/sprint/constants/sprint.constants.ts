import { TONE_BADGE, WORKFLOW_TONE } from "@/lib/tones";
import type { SprintStatus } from "../types/sprint.types";

export const STATUS_LABELS: Record<SprintStatus, string> = {
    new: "New",
    active: "Active",
    closed: "Closed",
    removed: "Removed",
    onhold: "On Hold",
};

export const STATUS_STYLES: Record<SprintStatus, string> = {
    new: TONE_BADGE[WORKFLOW_TONE.new],
    active: TONE_BADGE[WORKFLOW_TONE.active],
    closed: TONE_BADGE[WORKFLOW_TONE.closed],
    removed: TONE_BADGE[WORKFLOW_TONE.removed],
    onhold: TONE_BADGE[WORKFLOW_TONE.onhold],
};

export const SPRINT_STATUSES: SprintStatus[] = [
    "new",
    "active",
    "closed",
    "removed",
    "onhold",
];

export const SPRINT_STATUS_OPTIONS = [
    { value: "new", label: "New" },
    { value: "active", label: "Active" },
    { value: "closed", label: "Closed" },
    { value: "removed", label: "Removed" },
    { value: "onhold", label: "On Hold" },
] as const;
