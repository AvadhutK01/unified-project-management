import { badRequestError } from "../errors/app-error.js";

const projectTransitions: Record<string, string[]> = {
    notstarted: ["started", "completed"],
    started: ["onhold", "completed"],
    onhold: ["started", "completed"],
    completed: [],
};

const sprintTransitions: Record<string, string[]> = {
    new: ["active", "removed"],
    active: ["onhold", "closed", "removed"],
    onhold: ["active", "closed", "removed"],
    removed: [],
    closed: [],
};

const workitemTransitions: Record<string, string[]> = {
    new: ["active", "removed"],
    active: ["resolved", "closed", "onhold", "removed"],
    onhold: ["active", "closed", "removed"],
    resolved: ["active", "closed", "removed"],
    closed: [],
    removed: [],
};

export const validateProjectTransition = (current: string, next: string) => {
    if (current === next) return;
    const allowed = projectTransitions[current] || [];
    if (!allowed.includes(next)) {
        throw badRequestError(
            `Invalid project status transition from '${current}' to '${next}'. Allowed transitions: ${allowed.length > 0 ? allowed.join(", ") : "none (terminal state)"}.`,
        );
    }
};

export const validateSprintTransition = (current: string, next: string) => {
    if (current === next) return;
    const allowed = sprintTransitions[current] || [];
    if (!allowed.includes(next)) {
        throw badRequestError(
            `Invalid sprint status transition from '${current}' to '${next}'. Allowed transitions: ${allowed.length > 0 ? allowed.join(", ") : "none (terminal state)"}.`,
        );
    }
};

export const validateWorkitemTransition = (current: string, next: string) => {
    if (current === next) return;
    const allowed = workitemTransitions[current] || [];
    if (!allowed.includes(next)) {
        throw badRequestError(
            `Invalid workitem status transition from '${current}' to '${next}'. Allowed transitions: ${allowed.length > 0 ? allowed.join(", ") : "none (terminal state)"}.`,
        );
    }
};
