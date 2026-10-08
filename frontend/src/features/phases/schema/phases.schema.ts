import { LIFECYCLE_TONE, TONE_BADGE } from "@/lib/tones";
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
    notstarted: TONE_BADGE[LIFECYCLE_TONE.notstarted],
    started: TONE_BADGE[LIFECYCLE_TONE.started],
    completed: TONE_BADGE[LIFECYCLE_TONE.completed],
    on_hold: TONE_BADGE[LIFECYCLE_TONE.on_hold],
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
