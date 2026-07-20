import { db } from "../../../infrastructure/database/client.js";
import { notifications } from "../../../infrastructure/database/schema/index.js";
import { eq, and, desc, sql } from "drizzle-orm";

export const createNotification = async (data: {
    userId: string;
    organizationId: string;
    type: string;
    title: string;
    message: string;
    entityId?: string | null;
    entityType?: string | null;
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
