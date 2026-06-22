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
    new: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800",
    active: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800",
    resolved:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800",
    closed: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    removed:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800",
    onhold: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-800",
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
    task: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-800",
    bug: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900 dark:text-rose-300 dark:border-rose-800",
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
