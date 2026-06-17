export const STATUS_STYLES: Record<string, string> = {
    notstarted:
        "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700",
    started:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    completed:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    on_hold:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
};

export const STATUS_LABELS: Record<string, string> = {
    notstarted: "Not Started",
    started: "Started",
    completed: "Completed",
    on_hold: "On Hold",
};

export const PROJECT_STATUS_OPTIONS = [
    { value: "notstarted", label: "Not Started" },
    { value: "started", label: "Started" },
    { value: "on_hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
] as const;
