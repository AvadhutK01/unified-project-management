import { useOrganizationStore } from "@/store/organization.store";
import type { Notification } from "../types/notification.types";

export const getNotificationRoute = (notification: Notification): string => {
    const activeOrgSlug =
        useOrganizationStore.getState().activeOrganization?.slug;
    const orgSlug = notification.metadata?.orgSlug || activeOrgSlug;

    if (!orgSlug) {
        return "/";
    }

    const { entityType, entityId, type, metadata } = notification;
    const projectId = metadata?.projectId;
    const phaseId = metadata?.phaseId;
    const sprintId = metadata?.sprintId;
    const workitemId = metadata?.workitemId || entityId;

    if (entityType === "workitem") {
        if (metadata?.isDeleted || type === "task_deleted") {
            if (projectId && phaseId && sprintId) {
                return `/${orgSlug}/projects/${projectId}/phases/${phaseId}/sprints/${sprintId}/work-items`;
            }
            if (projectId) {
                return `/${orgSlug}/projects/${projectId}`;
            }
            return `/${orgSlug}/dashboard`;
        }

        if (projectId && phaseId && sprintId && workitemId) {
            const basePath = `/${orgSlug}/projects/${projectId}/phases/${phaseId}/sprints/${sprintId}/work-items/${workitemId}`;
            return type === "comment_mention"
                ? `${basePath}?tab=comments`
                : basePath;
        }
        if (projectId && phaseId && sprintId) {
            return `/${orgSlug}/projects/${projectId}/phases/${phaseId}/sprints/${sprintId}/work-items`;
        }
        if (projectId) {
            return `/${orgSlug}/projects/${projectId}`;
        }
        return `/${orgSlug}/dashboard`;
    }

    if (entityType === "sprint") {
        const targetSprintId = sprintId || entityId;
        if (projectId && phaseId && targetSprintId) {
            const basePath = `/${orgSlug}/projects/${projectId}/phases/${phaseId}/sprints/${targetSprintId}`;
            return type === "comment_mention"
                ? `${basePath}?tab=comments`
                : basePath;
        }
        if (projectId && phaseId) {
            return `/${orgSlug}/projects/${projectId}/phases/${phaseId}/sprints`;
        }
        if (projectId) {
            return `/${orgSlug}/projects/${projectId}`;
        }
        return `/${orgSlug}/dashboard`;
    }

    return `/${orgSlug}/dashboard`;
};
