import { createNotification } from "../infrastructure/notification.repository.js";
import { enqueueNotificationJob } from "./notification.queue.js";
import { db } from "../../../infrastructure/database/client.js";
import {
    projectMembers,
    organizationMembers,
    users,
    sprints,
    workitems,
    projects,
    organizations,
} from "../../../infrastructure/database/schema/index.js";
import { phases } from "../../../infrastructure/database/schema/phase.js";
import { eq } from "drizzle-orm";

export const sendNotification = async (
    userId: string,
    organizationId: string,
    type: string,
    title: string,
    message: string,
    entityId?: string | null,
    entityType?: string | null,
    metadata?: Record<string, any> | null,
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

const getUserIdFromProjectMemberId = async (projectMemberId: string) => {
    const [member] = await db
        .select({ userId: organizationMembers.memberId })
        .from(projectMembers)
        .innerJoin(
            organizationMembers,
            eq(projectMembers.organizationMemberId, organizationMembers.id),
        )
        .where(eq(projectMembers.id, projectMemberId));
    return member?.userId;
};

const getUserIdFromOrgMemberId = async (orgMemberId: string) => {
    const [member] = await db
        .select({ userId: organizationMembers.memberId })
        .from(organizationMembers)
        .where(eq(organizationMembers.id, orgMemberId));
    return member?.userId;
};

const getWorkitemContext = async (workitemId: string) => {
    const [result] = await db
        .select({
            workitemId: workitems.id,
            workitemTitle: workitems.title,
            sprintId: sprints.id,
            sprintTitle: sprints.title,
            phaseId: phases.id,
            phaseTitle: phases.name,
            projectId: projects.id,
            projectTitle: projects.title,
            orgSlug: organizations.slug,
            organizationName: organizations.name,
            organizationId: projects.organizationId,
        })
        .from(workitems)
        .innerJoin(sprints, eq(workitems.sprintId, sprints.id))
        .innerJoin(phases, eq(sprints.phaseId, phases.id))
        .innerJoin(projects, eq(phases.projectId, projects.id))
        .innerJoin(organizations, eq(projects.organizationId, organizations.id))
        .where(eq(workitems.id, workitemId));
    return result;
};

const getSprintContext = async (sprintId: string) => {
    const [result] = await db
        .select({
            sprintId: sprints.id,
            sprintTitle: sprints.title,
            phaseId: phases.id,
            phaseTitle: phases.name,
            projectId: phases.projectId,
            projectTitle: projects.title,
            orgSlug: organizations.slug,
            organizationName: organizations.name,
            organizationId: projects.organizationId,
        })
        .from(sprints)
        .innerJoin(phases, eq(sprints.phaseId, phases.id))
        .innerJoin(projects, eq(phases.projectId, projects.id))
        .innerJoin(organizations, eq(projects.organizationId, organizations.id))
        .where(eq(sprints.id, sprintId));
    return result;
};

export const notifyTaskAssignment = async (
    task: { id: string; title: string; assignedTo?: string | null },
    requesterUserId: string,
) => {
    if (task.assignedTo) {
        const userId = await getUserIdFromProjectMemberId(task.assignedTo);
        const context = await getWorkitemContext(task.id);
        if (userId && context && userId !== requesterUserId) {
            const message = `You have been assigned to task "${context.workitemTitle}" in sprint "${context.sprintTitle}" (Phase: "${context.phaseTitle}", Project: "${context.projectTitle}", Org: "${context.organizationName}").`;
            const metadata = {
                orgSlug: context.orgSlug,
                projectId: context.projectId,
                phaseId: context.phaseId,
                sprintId: context.sprintId,
                workitemId: context.workitemId,
            };
            await sendNotification(
                userId,
                context.organizationId,
                "task_assignment",
                "Task Assigned",
                message,
                task.id,
                "workitem",
                metadata,
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
        const userId = await getUserIdFromProjectMemberId(task.assignedTo);
        const context = await getWorkitemContext(task.id);
        if (userId && context && userId !== requesterUserId) {
            const message = `Task "${context.workitemTitle}" in sprint "${context.sprintTitle}" (Project: "${context.projectTitle}", Org: "${context.organizationName}") was updated: ${changesDescription}.`;
            const metadata = {
                orgSlug: context.orgSlug,
                projectId: context.projectId,
                phaseId: context.phaseId,
                sprintId: context.sprintId,
                workitemId: context.workitemId,
            };
            await sendNotification(
                userId,
                context.organizationId,
                "task_update",
                "Task Updated",
                message,
                task.id,
                "workitem",
                metadata,
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
        const userId = await getUserIdFromProjectMemberId(task.assignedTo);
        const context = await getWorkitemContext(task.id);
        if (userId && context && userId !== requesterUserId) {
            const message = `Status of task "${context.workitemTitle}" in sprint "${context.sprintTitle}" (Project: "${context.projectTitle}", Org: "${context.organizationName}") changed from '${oldStatus}' to '${newStatus}'.`;
            const metadata = {
                orgSlug: context.orgSlug,
                projectId: context.projectId,
                phaseId: context.phaseId,
                sprintId: context.sprintId,
                workitemId: context.workitemId,
            };
            await sendNotification(
                userId,
                context.organizationId,
                "task_status_updated",
                "Task Status Updated",
                message,
                task.id,
                "workitem",
                metadata,
            );
        }
    }
};

export const notifyTaskDeletion = async (
    task: { id: string; title: string; assignedTo?: string | null },
    requesterUserId: string,
) => {
    if (task.assignedTo) {
        const userId = await getUserIdFromProjectMemberId(task.assignedTo);
        const context = await getWorkitemContext(task.id);
        if (userId && context && userId !== requesterUserId) {
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
                userId,
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
    entityType: string,
) => {
    const userId = await getUserIdFromOrgMemberId(recipientMemberId);
    if (!userId || userId === mentionerId) return;

    let orgId: string | null = null;
    let detailMsg = "";
    let metadata: Record<string, any> | null = null;

    if (entityType === "workitem") {
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
    } else if (entityType === "sprint") {
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
        const [mentioner] = await db
            .select({ username: users.username })
            .from(users)
            .where(eq(users.id, mentionerId));
        const mentionerName = mentioner?.username || "Someone";
        const cleanComment = commentText.replace(/<[^>]*>/g, "");
        const preview = `"${cleanComment.substring(0, 50)}${cleanComment.length > 50 ? "..." : ""}"`;
        const message = `${mentionerName} mentioned you in a comment ${detailMsg}: ${preview}`;
        await sendNotification(
            userId,
            orgId,
            "comment_mention",
            "New Mention",
            message,
            entityId,
            entityType,
            metadata,
        );
    }
};

export const checkUpcomingSprintDeadlines = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0] || "";

    const upcomingSprints = await db
        .select()
        .from(sprints)
        .where(eq(sprints.endDate, tomorrowStr));

    for (const sprint of upcomingSprints) {
        const context = await getSprintContext(sprint.id);
        if (!context) continue;

        const members = await db
            .select({ userId: organizationMembers.memberId })
            .from(projectMembers)
            .innerJoin(
                organizationMembers,
                eq(projectMembers.organizationMemberId, organizationMembers.id),
            )
            .where(eq(projectMembers.projectId, context.projectId));

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
        }
    }
};
