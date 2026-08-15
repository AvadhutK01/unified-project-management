import {
    createNotification,
    getUserDetailsFromProjectMemberId,
    getUserDetailsFromOrgMemberId,
    getWorkitemContext,
    getSprintContext,
    findUsernameById,
    findSprintsEndingOnDate,
    findProjectMembersWithUsersByProjectId,
    findOrgSlugById,
    markDirectMessageNotificationsAsReadRepo,
} from "../infrastructure/notification.repository.js";
import { enqueueNotificationJob } from "./notification.queue.js";
import {
    sendTaskAssignmentEmail,
    sendTaskUpdateEmail,
    sendCommentMentionEmail,
    sendSprintDeadlineEmail,
} from "../../../shared/utils/email.js";

import {
    NOTIFICATION_TYPE,
    NOTIFICATION_ENTITY_TYPE,
} from "../../../shared/constants/enumConstants.js";

import type {
    NotificationType,
    NotificationEntityType,
    NotificationMetadata,
} from "../../../types/notifications.js";

export const sendNotification = async (
    userId: string,
    organizationId: string,
    type: NotificationType,
    title: string,
    message: string,
    entityId?: string | null,
    entityType?: NotificationEntityType | null,
    metadata?: NotificationMetadata | null,
) => {
    const notification = await createNotification({
        userId,
        organizationId,
        type,
        title,
        message,
        entityId: entityId ?? null,
        entityType: entityType ?? null,
        metadata: metadata ?? null,
    });
    if (!notification) {
        throw new Error("Failed to create notification");
    }
    await enqueueNotificationJob(
        userId,
        organizationId,
        notification.id,
        title,
        message,
        type,
        entityId ?? null,
        entityType ?? null,
        metadata ?? null,
    );
    return notification;
};

export const notifyTaskAssignment = async (
    task: { id: string; title: string; assignedTo?: string | null },
    requesterUserId: string,
) => {
    if (task.assignedTo) {
        const memberDetails = await getUserDetailsFromProjectMemberId(
            task.assignedTo,
        );
        const context = await getWorkitemContext(task.id);
        if (
            memberDetails &&
            context &&
            memberDetails.userId !== requesterUserId
        ) {
            const message = `You have been assigned to task "${context.workitemTitle}" in sprint "${context.sprintTitle}" (Phase: "${context.phaseTitle}", Project: "${context.projectTitle}", Org: "${context.organizationName}").`;
            const metadata = {
                orgSlug: context.orgSlug,
                projectId: context.projectId,
                phaseId: context.phaseId,
                sprintId: context.sprintId,
                workitemId: context.workitemId,
            };
            await sendNotification(
                memberDetails.userId,
                context.organizationId,
                "task_assignment",
                "Task Assigned",
                message,
                task.id,
                "workitem",
                metadata,
            );
            sendTaskAssignmentEmail(
                memberDetails.email,
                context.workitemTitle,
                context.sprintTitle,
                context.projectTitle,
                context.organizationName,
                metadata,
            ).catch((err) =>
                console.error("Failed to send task assignment email:", err),
            );
        }
    }
};

export const notifyTaskUpdate = async (
    task: { id: string; title: string; assignedTo?: string | null },
    changesDescription: string,
    requesterUserId: string,
) => {
    if (task.assignedTo) {
        const memberDetails = await getUserDetailsFromProjectMemberId(
            task.assignedTo,
        );
        const context = await getWorkitemContext(task.id);
        if (
            memberDetails &&
            context &&
            memberDetails.userId !== requesterUserId
        ) {
            const message = `Task "${context.workitemTitle}" in sprint "${context.sprintTitle}" (Project: "${context.projectTitle}", Org: "${context.organizationName}") was updated: ${changesDescription}.`;
            const metadata = {
                orgSlug: context.orgSlug,
                projectId: context.projectId,
                phaseId: context.phaseId,
                sprintId: context.sprintId,
                workitemId: context.workitemId,
            };
            await sendNotification(
                memberDetails.userId,
                context.organizationId,
                "task_update",
                "Task Updated",
                message,
                task.id,
                "workitem",
                metadata,
            );
            sendTaskUpdateEmail(
                memberDetails.email,
                context.workitemTitle,
                "In Progress",
                "Updated",
                context.projectTitle,
                context.organizationName,
                metadata,
            ).catch((err) =>
                console.error("Failed to send task update email:", err),
            );
        }
    }
};

export const notifyTaskStatusUpdate = async (
    task: { id: string; title: string; assignedTo?: string | null },
    oldStatus: string,
    newStatus: string,
    requesterUserId: string,
) => {
    if (task.assignedTo) {
        const memberDetails = await getUserDetailsFromProjectMemberId(
            task.assignedTo,
        );
        const context = await getWorkitemContext(task.id);
        if (
            memberDetails &&
            context &&
            memberDetails.userId !== requesterUserId
        ) {
            const message = `Status of task "${context.workitemTitle}" in sprint "${context.sprintTitle}" (Project: "${context.projectTitle}", Org: "${context.organizationName}") changed from '${oldStatus}' to '${newStatus}'.`;
            const metadata = {
                orgSlug: context.orgSlug,
                projectId: context.projectId,
                phaseId: context.phaseId,
                sprintId: context.sprintId,
                workitemId: context.workitemId,
            };
            await sendNotification(
                memberDetails.userId,
                context.organizationId,
                "task_status_updated",
                "Task Status Updated",
                message,
                task.id,
                "workitem",
                metadata,
            );
            sendTaskUpdateEmail(
                memberDetails.email,
                context.workitemTitle,
                oldStatus,
                newStatus,
                context.projectTitle,
                context.organizationName,
                metadata,
            ).catch((err) =>
                console.error("Failed to send task status update email:", err),
            );
        }
    }
};

export const notifyTaskDeletion = async (
    task: { id: string; title: string; assignedTo?: string | null },
    requesterUserId: string,
) => {
    if (task.assignedTo) {
        const memberDetails = await getUserDetailsFromProjectMemberId(
            task.assignedTo,
        );
        const context = await getWorkitemContext(task.id);
        if (
            memberDetails &&
            context &&
            memberDetails.userId !== requesterUserId
        ) {
            const message = `Task "${context.workitemTitle}" in sprint "${context.sprintTitle}" (Project: "${context.projectTitle}", Org: "${context.organizationName}") has been deleted.`;
            const metadata = {
                orgSlug: context.orgSlug,
                projectId: context.projectId,
                phaseId: context.phaseId,
                sprintId: context.sprintId,
                workitemId: context.workitemId,
                isDeleted: true,
            };
            await sendNotification(
                memberDetails.userId,
                context.organizationId,
                "task_deleted",
                "Task Deleted",
                message,
                task.id,
                "workitem",
                metadata,
            );
        }
    }
};

export const notifyDiscussionMention = async (
    mentionerId: string,
    commentText: string,
    recipientMemberId: string,
    entityId: string,
    entityType: NotificationEntityType,
) => {
    const memberDetails =
        await getUserDetailsFromOrgMemberId(recipientMemberId);
    if (!memberDetails || memberDetails.userId === mentionerId) return;

    let orgId: string | null = null;
    let detailMsg = "";
    let metadata: NotificationMetadata | null = null;

    if (entityType === NOTIFICATION_ENTITY_TYPE.WORKITEM) {
        const context = await getWorkitemContext(entityId);
        if (context) {
            orgId = context.organizationId;
            detailMsg = `on task "${context.workitemTitle}" in sprint "${context.sprintTitle}" (Project: "${context.projectTitle}", Org: "${context.organizationName}")`;
            metadata = {
                orgSlug: context.orgSlug,
                projectId: context.projectId,
                phaseId: context.phaseId,
                sprintId: context.sprintId,
                workitemId: context.workitemId,
            };
        }
    } else if (entityType === NOTIFICATION_ENTITY_TYPE.SPRINT) {
        const context = await getSprintContext(entityId);
        if (context) {
            orgId = context.organizationId;
            detailMsg = `on sprint "${context.sprintTitle}" (Project: "${context.projectTitle}", Org: "${context.organizationName}")`;
            metadata = {
                orgSlug: context.orgSlug,
                projectId: context.projectId,
                phaseId: context.phaseId,
                sprintId: context.sprintId,
            };
        }
    }

    if (orgId) {
        const mentionerName =
            (await findUsernameById(mentionerId)) || "Someone";
        const cleanComment = commentText.replace(/<[^>]*>/g, "");
        const preview = `"${cleanComment.substring(0, 50)}${cleanComment.length > 50 ? "..." : ""}"`;
        const message = `${mentionerName} mentioned you in a comment ${detailMsg}: ${preview}`;
        await sendNotification(
            memberDetails.userId,
            orgId,
            "comment_mention",
            "New Mention",
            message,
            entityId,
            entityType,
            metadata,
        );
        sendCommentMentionEmail(
            memberDetails.email,
            mentionerName,
            preview,
            detailMsg,
            metadata ?? undefined,
        ).catch((err) =>
            console.error("Failed to send comment mention email:", err),
        );
    }
};

/**
 * Scans for sprints ending tomorrow and dispatches deadline notification alerts to team members.
 */
export const checkUpcomingSprintDeadlines = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0] || "";

    const upcomingSprints = await findSprintsEndingOnDate(tomorrowStr);

    for (const sprint of upcomingSprints) {
        const context = await getSprintContext(sprint.id);
        if (!context) continue;

        const members = await findProjectMembersWithUsersByProjectId(
            context.projectId,
        );

        for (const member of members) {
            const message = `Sprint "${context.sprintTitle}" in phase "${context.phaseTitle}" (Project: "${context.projectTitle}", Org: "${context.organizationName}") is ending tomorrow (${sprint.endDate}).`;
            const metadata = {
                orgSlug: context.orgSlug,
                projectId: context.projectId,
                phaseId: context.phaseId,
                sprintId: context.sprintId,
            };
            await sendNotification(
                member.userId,
                context.organizationId,
                "sprint_deadline",
                "Sprint Ending Soon",
                message,
                sprint.id,
                "sprint",
                metadata,
            );
            sendSprintDeadlineEmail(
                member.email,
                context.sprintTitle,
                sprint.endDate || "",
                context.projectTitle,
                context.organizationName,
                metadata,
            ).catch((err) =>
                console.error("Failed to send sprint deadline email:", err),
            );
        }
    }
};

export const notifyDirectMessage = async (
    senderUserId: string,
    receiverUserId: string,
    organizationId: string,
    messageSnippet: string,
    senderName: string,
) => {
    if (senderUserId === receiverUserId) return;

    const orgSlug = await findOrgSlugById(organizationId);

    const cleanSnippet = messageSnippet.replace(/<[^>]*>/g, "");
    const preview =
        cleanSnippet.length > 60
            ? `${cleanSnippet.substring(0, 60)}...`
            : cleanSnippet;

    await sendNotification(
        receiverUserId,
        organizationId,
        "direct_message",
        `New Message from ${senderName}`,
        preview,
        senderUserId,
        "direct_chat",
        {
            orgSlug: orgSlug || undefined,
            senderUserId,
            senderName,
        },
    );
};

export const markDirectMessageNotificationsAsRead = async (
    organizationId: string,
    senderUserId: string,
    receiverUserId: string,
) => {
    await markDirectMessageNotificationsAsReadRepo(
        organizationId,
        senderUserId,
        receiverUserId,
    );
};
