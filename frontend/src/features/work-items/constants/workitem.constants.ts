import { TONE_BADGE, WORKFLOW_TONE } from "@/lib/tones";
import type { WorkItemStatus, WorkItemType } from "../types/workitem.types";

export const STATUS_LABELS: Record<WorkItemStatus, string> = {
    new: "New",
    active: "Active",
    resolved: "Resolved",
    closed: "Closed",
    removed: "Removed",
    onhold: "On Hold",
};

export const STATUS_STYLES: Record<WorkItemStatus, string> = {
    new: TONE_BADGE[WORKFLOW_TONE.new],
    active: TONE_BADGE[WORKFLOW_TONE.active],
    resolved: TONE_BADGE[WORKFLOW_TONE.resolved],
    closed: TONE_BADGE[WORKFLOW_TONE.closed],
    removed: TONE_BADGE[WORKFLOW_TONE.removed],
    onhold: TONE_BADGE[WORKFLOW_TONE.onhold],
};

export const WORK_ITEM_STATUSES: WorkItemStatus[] = [
    "new",
    "active",
    "resolved",
    "closed",
    "removed",
    "onhold",
];

export const TYPE_LABELS: Record<WorkItemType, string> = {
    task: "Task",
    bug: "Bug",
};

export const TYPE_STYLES: Record<WorkItemType, string> = {
    task: TONE_BADGE.primary,
    bug: TONE_BADGE.danger,
};

export const WORK_ITEM_TYPES: WorkItemType[] = ["task", "bug"];

export const WORK_ITEM_STATUS_OPTIONS = [
    { value: "new", label: "New" },
    { value: "active", label: "Active" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
    { value: "removed", label: "Removed" },
    { value: "onhold", label: "On Hold" },
] as const;

export const WORK_ITEM_TYPE_OPTIONS = [
    { value: "task", label: "Task" },
    { value: "bug", label: "Bug" },
] as const;
