export const AUTH_PROVIDER = {
    LOCAL: "local",
    GOOGLE: "google",
} as const;

export const PROJECT_STATUS = {
    NOT_STARTED: "notstarted",
    STARTED: "started",
    ON_HOLD: "onhold",
    COMPLETED: "completed",
} as const;

export const PHASE_STATUS = {
    NOT_STARTED: "notstarted",
    STARTED: "started",
    ON_HOLD: "onhold",
    COMPLETED: "completed",
} as const;

export const SPRINT_STATUS = {
    NEW: "new",
    ACTIVE: "active",
    ON_HOLD: "onhold",
    REMOVED: "removed",
    CLOSED: "closed",
} as const;

export const WORKITEM_STATUS = {
    NEW: "new",
    ACTIVE: "active",
    RESOLVED: "resolved",
    CLOSED: "closed",
    REMOVED: "removed",
    ON_HOLD: "onhold",
} as const;

export const WORKITEM_TYPE = {
    TASK: "task",
    BUG: "bug",
} as const;

export const ORGANIZATION_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    ARCHIVED: "archived",
} as const;

export const ORGANIZATION_MEMBER_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    ON_LEAVE: "onleave",
    SUSPENDED: "suspended",
} as const;

export const ORGANIZATION_INVITATION_STATUS = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    REVOKED: "revoked",
} as const;

export const SUBSCRIPTION_PLAN = {
    FREE: "free",
    BASIC: "basic",
    PRO: "pro",
    PREMIUM: "premium",
} as const;

export const SUBSCRIPTION_STATUS = {
    ACTIVE: "active",
    EXPIRED: "expired",
    CANCELLED: "cancelled",
    PAST_DUE: "past_due",
} as const;

export const TRANSACTION_STATUS = {
    CREATED: "created",
    CAPTURED: "captured",
    FAILED: "failed",
    REFUNDED: "refunded",
} as const;

export const USER_PRESENCE_STATUS = {
    ACTIVE: "active",
    AWAY: "away",
    OFFLINE: "offline",
} as const;

export const NOTIFICATION_TYPE = {
    TASK_ASSIGNMENT: "task_assignment",
    TASK_UPDATE: "task_update",
    TASK_STATUS_UPDATED: "task_status_updated",
    TASK_DELETED: "task_deleted",
    COMMENT_MENTION: "comment_mention",
    SPRINT_DEADLINE: "sprint_deadline",
    DIRECT_MESSAGE: "direct_message",
} as const;

export const NOTIFICATION_ENTITY_TYPE = {
    WORKITEM: "workitem",
    SPRINT: "sprint",
    PROJECT: "project",
    DIRECT_CHAT: "direct_chat",
} as const;

export const CALL_TYPE = {
    VOICE: "voice",
    VIDEO: "video",
} as const;
