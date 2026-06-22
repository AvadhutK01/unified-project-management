import type { SprintStatus } from "../types/sprint.types";

export const STATUS_LABELS: Record<SprintStatus, string> = {
    new: "New",
    active: "Active",
    closed: "Closed",
    removed: "Removed",
    onhold: "On Hold",
};

export const STATUS_STYLES: Record<SprintStatus, string> = {
    new: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800",
    active: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800",
    closed: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    removed:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800",
    onhold: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-800",
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
