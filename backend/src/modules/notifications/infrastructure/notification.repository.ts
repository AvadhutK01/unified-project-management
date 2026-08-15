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

type NotificationType =
    (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
type NotificationEntityType =
    (typeof NOTIFICATION_ENTITY_TYPE)[keyof typeof NOTIFICATION_ENTITY_TYPE];

export const createNotification = async (data: {
    userId: string;
    organizationId: string;
    type: NotificationType;
    title: string;
    message: string;
    entityId?: string | null;
    entityType?: NotificationEntityType | null;
    metadata?: Record<string, any> | null;
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

export const updateNotificationRead = async (id: string, userId: string) => {
    const [notification] = await db
        .update(notifications)
        .set({ isRead: true, updatedAt: new Date() })
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
        .returning();
    return notification;
};

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

export const getUserDetailsFromOrgMemberId = async (orgMemberId: string) => {
    const [member] = await db
        .select({ userId: organizationMembers.memberId, email: users.email })
        .from(organizationMembers)
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .where(eq(organizationMembers.id, orgMemberId));
    return member;
};

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

export const findUsernameById = async (userId: string) => {
    const [user] = await db
        .select({ username: users.username })
        .from(users)
        .where(eq(users.id, userId));
    return user?.username || null;
};

export const findSprintsEndingOnDate = async (dateStr: string) => {
    return db.select().from(sprints).where(eq(sprints.endDate, dateStr));
};

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
