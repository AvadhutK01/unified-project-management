import { db } from "../../../infrastructure/database/client.js";
import {
    notifications,
    projectMembers,
    organizationMembers,
    users,
    sprints,
    workitems,
    projects,
    organizations,
} from "../../../infrastructure/database/schema/index.js";
import { phases } from "../../../infrastructure/database/schema/phase.js";
import { eq, and, desc, sql } from "drizzle-orm";

import {
    NOTIFICATION_TYPE,
    NOTIFICATION_ENTITY_TYPE,
} from "../../../shared/constants/enumConstants.js";

import type {
    NotificationType,
    NotificationEntityType,
    NotificationMetadata,
} from "../../../types/notifications.js";

export const createNotification = async (data: {
    userId: string;
    organizationId: string;
    type: NotificationType;
    title: string;
    message: string;
    entityId?: string | null;
    entityType?: NotificationEntityType | null;
    metadata?: NotificationMetadata | null;
}) => {
    const [notification] = await db
        .insert(notifications)
        .values(data)
        .returning();
    return notification;
};

export const findNotificationsByUserId = async (
    userId: string,
    organizationId: string,
    page: number = 1,
    limit: number = 10,
) => {
    const offset = (page - 1) * limit;
    return db
        .select()
        .from(notifications)
        .where(
            and(
                eq(notifications.userId, userId),
                eq(notifications.organizationId, organizationId),
            ),
        )
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);
};

export const countNotificationsByUserId = async (
    userId: string,
    organizationId: string,
) => {
    const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(
            and(
                eq(notifications.userId, userId),
                eq(notifications.organizationId, organizationId),
            ),
        );
    return Number(result?.count || 0);
};

/**
 * Updates a notification record as read for a given user.
 * @param id UUID of the notification.
 * @param userId UUID of the user.
 * @returns Updated notification row or undefined.
 */
export const updateNotificationRead = async (id: string, userId: string) => {
    const [notification] = await db
        .update(notifications)
        .set({ isRead: true, updatedAt: new Date() })
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
        .returning();
    return notification;
};

/**
 * Marks all notifications as read for a given user and organization.
 * @param userId UUID of the user.
 * @param organizationId UUID of the organization.
 */
export const markAllNotificationsRead = async (
    userId: string,
    organizationId: string,
) => {
    return db
        .update(notifications)
        .set({ isRead: true, updatedAt: new Date() })
        .where(
            and(
                eq(notifications.userId, userId),
                eq(notifications.organizationId, organizationId),
            ),
        );
};

/**
 * Resolves user ID and email address from a project member ID.
 * @param projectMemberId UUID of the project member.
 * @returns Member details containing userId and email.
 */
export const getUserDetailsFromProjectMemberId = async (
    projectMemberId: string,
) => {
    const [member] = await db
        .select({ userId: organizationMembers.memberId, email: users.email })
        .from(projectMembers)
        .innerJoin(
            organizationMembers,
            eq(projectMembers.organizationMemberId, organizationMembers.id),
        )
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .where(eq(projectMembers.id, projectMemberId));
    return member;
};

/**
 * Resolves user ID and email address from an organization member ID.
 * @param orgMemberId UUID of the organization member.
 * @returns Member details containing userId and email.
 */
export const getUserDetailsFromOrgMemberId = async (orgMemberId: string) => {
    const [member] = await db
        .select({ userId: organizationMembers.memberId, email: users.email })
        .from(organizationMembers)
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .where(eq(organizationMembers.id, orgMemberId));
    return member;
};

/**
 * Fetches hierarchical context (sprint, phase, project, organization) for a workitem.
 * @param workitemId UUID of the workitem.
 * @returns Object containing workitem and parent hierarchy metadata.
 */
export const getWorkitemContext = async (workitemId: string) => {
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

/**
 * Fetches hierarchical context (phase, project, organization) for a sprint.
 * @param sprintId UUID of the sprint.
 * @returns Object containing sprint and parent hierarchy metadata.
 */
export const getSprintContext = async (sprintId: string) => {
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

/**
 * Finds username associated with a user ID.
 * @param userId UUID of the user.
 * @returns Username string or null.
 */
export const findUsernameById = async (userId: string) => {
    const [user] = await db
        .select({ username: users.username })
        .from(users)
        .where(eq(users.id, userId));
    return user?.username || null;
};

/**
 * Finds all sprints ending on a specific date string (YYYY-MM-DD).
 * @param dateStr Target end date string.
 * @returns Array of matching sprint records.
 */
export const findSprintsEndingOnDate = async (dateStr: string) => {
    return db.select().from(sprints).where(eq(sprints.endDate, dateStr));
};

/**
 * Finds project members with user credentials for a specific project.
 * @param projectId UUID of the project.
 * @returns Array of project members containing userId and email.
 */
export const findProjectMembersWithUsersByProjectId = async (
    projectId: string,
) => {
    return db
        .select({
            userId: organizationMembers.memberId,
            email: users.email,
        })
        .from(projectMembers)
        .innerJoin(
            organizationMembers,
            eq(projectMembers.organizationMemberId, organizationMembers.id),
        )
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .where(eq(projectMembers.projectId, projectId));
};

/**
 * Fetches organization slug by organization ID.
 * @param organizationId UUID of the organization.
 * @returns Organization slug or null.
 */
export const findOrgSlugById = async (organizationId: string) => {
    const [org] = await db
        .select({ slug: organizations.slug })
        .from(organizations)
        .where(eq(organizations.id, organizationId));
    return org?.slug || null;
};

export const markDirectMessageNotificationsAsReadRepo = async (
    organizationId: string,
    senderUserId: string,
    receiverUserId: string,
) => {
    return db
        .update(notifications)
        .set({ isRead: true, updatedAt: new Date() })
        .where(
            and(
                eq(notifications.organizationId, organizationId),
                eq(notifications.userId, receiverUserId),
                eq(notifications.entityId, senderUserId),
                eq(notifications.entityType, "direct_chat"),
                eq(notifications.isRead, false),
            ),
        );
};
