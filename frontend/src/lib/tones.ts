/**
 * Semantic colour tones shared by badges, status dots, stat icons and
 * kanban accents. Every status in the product maps to one of these so the
 * same meaning always reads with the same colour, in both themes.
 */
export type Tone =
    | "neutral"
    | "primary"
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "violet";

/** Soft tinted pill — used by StatusBadge and status selects. */
export const TONE_BADGE: Record<Tone, string> = {
    neutral: "border-border bg-muted text-muted-foreground",
    primary: "border-primary/20 bg-primary/10 text-primary dark:bg-primary/15",
    info: "border-info/20 bg-info/10 text-info dark:bg-info/15",
    success: "border-success/20 bg-success/10 text-success dark:bg-success/15",
    warning: "border-warning/25 bg-warning/10 text-warning dark:bg-warning/15",
    danger: "border-danger/20 bg-danger/10 text-danger dark:bg-danger/15",
    violet: "border-violet/20 bg-violet/10 text-violet dark:bg-violet/15",
};

/** Solid status dot. */
export const TONE_DOT: Record<Tone, string> = {
    neutral: "bg-neutral",
    primary: "bg-primary",
    info: "bg-info",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    violet: "bg-violet",
};

/** Icon tile background + foreground (stat cards, list icons). */
export const TONE_ICON: Record<Tone, string> = {
    neutral: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary dark:bg-primary/15",
    info: "bg-info/10 text-info dark:bg-info/15",
    success: "bg-success/10 text-success dark:bg-success/15",
    warning: "bg-warning/10 text-warning dark:bg-warning/15",
    danger: "bg-danger/10 text-danger dark:bg-danger/15",
    violet: "bg-violet/10 text-violet dark:bg-violet/15",
};

/** Progress bar fill. */
export const TONE_FILL: Record<Tone, string> = TONE_DOT;

/** Text colour only. */
export const TONE_TEXT: Record<Tone, string> = {
    neutral: "text-muted-foreground",
    primary: "text-primary",
    info: "text-info",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    violet: "text-violet",
};

/** Top accent border for kanban cards. */
export const TONE_BORDER_TOP: Record<Tone, string> = {
    neutral: "border-t-neutral/60",
    primary: "border-t-primary",
    info: "border-t-info",
    success: "border-t-success",
    warning: "border-t-warning",
    danger: "border-t-danger",
    violet: "border-t-violet",
};

/* ---- Domain status → tone ------------------------------------------- */

/** Projects and phases share the same lifecycle. */
export const LIFECYCLE_TONE: Record<string, Tone> = {
    notstarted: "neutral",
    started: "info",
    completed: "success",
    on_hold: "warning",
};

/** Sprints and work items share the same workflow states. */
export const WORKFLOW_TONE: Record<string, Tone> = {
    new: "violet",
    active: "info",
    resolved: "success",
    closed: "neutral",
    removed: "danger",
    onhold: "warning",
};

/** Completion percentage → tone, used for progress bars. */
export function progressTone(pct: number): Tone {
    return pct >= 100 ? "success" : "primary";
}
