import {
    NOTIFICATION_TYPE,
    NOTIFICATION_ENTITY_TYPE,
} from "../shared/constants/enumConstants.js";

export type NotificationType =
    (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export type NotificationEntityType =
    (typeof NOTIFICATION_ENTITY_TYPE)[keyof typeof NOTIFICATION_ENTITY_TYPE];

export interface NotificationMetadata {
    orgSlug?: string | undefined;
    projectId?: string | undefined;
    phaseId?: string | undefined;
    sprintId?: string | undefined;
    workitemId?: string | undefined;
    [key: string]: string | number | boolean | Date | null | undefined;
}
