import { badRequestError } from "../errors/app-error.js";
import {
    PROJECT_STATUS,
    SPRINT_STATUS,
    WORKITEM_STATUS,
} from "../constants/enumConstants.js";

const projectTransitions: Record<string, string[]> = {
    [PROJECT_STATUS.NOT_STARTED]: [
        PROJECT_STATUS.STARTED,
        PROJECT_STATUS.COMPLETED,
    ],
    [PROJECT_STATUS.STARTED]: [
        PROJECT_STATUS.ON_HOLD,
        PROJECT_STATUS.COMPLETED,
    ],
    [PROJECT_STATUS.ON_HOLD]: [
        PROJECT_STATUS.STARTED,
        PROJECT_STATUS.COMPLETED,
    ],
    [PROJECT_STATUS.COMPLETED]: [],
};

const sprintTransitions: Record<string, string[]> = {
    [SPRINT_STATUS.NEW]: [SPRINT_STATUS.ACTIVE, SPRINT_STATUS.REMOVED],
    [SPRINT_STATUS.ACTIVE]: [
        SPRINT_STATUS.ON_HOLD,
        SPRINT_STATUS.CLOSED,
        SPRINT_STATUS.REMOVED,
    ],
    [SPRINT_STATUS.ON_HOLD]: [
        SPRINT_STATUS.ACTIVE,
        SPRINT_STATUS.CLOSED,
        SPRINT_STATUS.REMOVED,
    ],
    [SPRINT_STATUS.REMOVED]: [],
    [SPRINT_STATUS.CLOSED]: [],
};

const workitemTransitions: Record<string, string[]> = {
    [WORKITEM_STATUS.NEW]: [WORKITEM_STATUS.ACTIVE, WORKITEM_STATUS.REMOVED],
    [WORKITEM_STATUS.ACTIVE]: [
        WORKITEM_STATUS.RESOLVED,
        WORKITEM_STATUS.CLOSED,
        WORKITEM_STATUS.ON_HOLD,
        WORKITEM_STATUS.REMOVED,
    ],
    [WORKITEM_STATUS.ON_HOLD]: [
        WORKITEM_STATUS.ACTIVE,
        WORKITEM_STATUS.CLOSED,
        WORKITEM_STATUS.REMOVED,
    ],
    [WORKITEM_STATUS.RESOLVED]: [
        WORKITEM_STATUS.ACTIVE,
        WORKITEM_STATUS.CLOSED,
        WORKITEM_STATUS.REMOVED,
    ],
    [WORKITEM_STATUS.CLOSED]: [],
    [WORKITEM_STATUS.REMOVED]: [],
};

/**
 * Validates whether a project status transition from current state to target next state is permitted.
 * @param current Current status string.
 * @param next Target status string.
 * @throws AppError 400 Bad Request if transition is invalid.
 */
export const validateProjectTransition = (current: string, next: string) => {
    if (current === next) return;
    const allowed = projectTransitions[current] || [];
    if (!allowed.includes(next)) {
        throw badRequestError(
            `Invalid project status transition from '${current}' to '${next}'. Allowed transitions: ${allowed.length > 0 ? allowed.join(", ") : "none (terminal state)"}.`,
        );
    }
};

/**
 * Validates whether a sprint status transition from current state to target next state is permitted.
 * @param current Current status string.
 * @param next Target status string.
 * @throws AppError 400 Bad Request if transition is invalid.
 */
export const validateSprintTransition = (current: string, next: string) => {
    if (current === next) return;
    const allowed = sprintTransitions[current] || [];
    if (!allowed.includes(next)) {
        throw badRequestError(
            `Invalid sprint status transition from '${current}' to '${next}'. Allowed transitions: ${allowed.length > 0 ? allowed.join(", ") : "none (terminal state)"}.`,
        );
    }
};

/**
 * Validates whether a workitem status transition from current state to target next state is permitted.
 * @param current Current status string.
 * @param next Target status string.
 * @throws AppError 400 Bad Request if transition is invalid.
 */
export const validateWorkitemTransition = (current: string, next: string) => {
    if (current === next) return;
    const allowed = workitemTransitions[current] || [];
    if (!allowed.includes(next)) {
        throw badRequestError(
            `Invalid workitem status transition from '${current}' to '${next}'. Allowed transitions: ${allowed.length > 0 ? allowed.join(", ") : "none (terminal state)"}.`,
        );
    }
};
