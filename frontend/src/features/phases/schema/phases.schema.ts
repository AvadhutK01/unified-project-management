import { z } from "zod";

export const PHASE_TYPES = [
    "New Development",
    "Change Request",
    "Maintenance",
    "Custom",
] as const;

export const PHASE_STATUS_OPTIONS = [
    { value: "notstarted", label: "Not Started" },
    { value: "started", label: "Started" },
    { value: "on_hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
] as const;

export const PHASE_STATUS_STYLES: Record<string, string> = {
    notstarted:
        "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700",
    started:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    completed:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    on_hold:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
};

export const PHASE_STATUS_LABELS: Record<string, string> = {
    notstarted: "Not Started",
    started: "Started",
    completed: "Completed",
    on_hold: "On Hold",
};

export const phaseFormSchema = z
    .object({
        name: z.string().min(2, "Phase name must be at least 2 characters"),
        type: z.enum(PHASE_TYPES, {
            message: "Please select a type",
        }),
        customType: z.string().optional(),
        description: z.string(),
        startDate: z.date({
            message: "Please select a valid start date",
        }),
        endDate: z.date({
            message: "Please select a valid end date",
        }),
        status: z.enum(["notstarted", "started", "on_hold", "completed"], {
            message: "Please select a status",
        }),
    })
    .refine(
        (data) => {
            if (data.type === "Custom") {
                return (
                    data.customType !== undefined &&
                    data.customType.trim().length > 0
                );
            }
            return true;
        },
        {
            message: "Please enter a custom type",
            path: ["customType"],
        },
    );

export type PhaseFormValues = z.infer<typeof phaseFormSchema>;
