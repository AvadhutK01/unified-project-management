import { LIFECYCLE_TONE, TONE_BADGE } from "@/lib/tones";

export const STATUS_STYLES: Record<string, string> = {
    notstarted: TONE_BADGE[LIFECYCLE_TONE.notstarted],
    started: TONE_BADGE[LIFECYCLE_TONE.started],
    completed: TONE_BADGE[LIFECYCLE_TONE.completed],
    on_hold: TONE_BADGE[LIFECYCLE_TONE.on_hold],
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
