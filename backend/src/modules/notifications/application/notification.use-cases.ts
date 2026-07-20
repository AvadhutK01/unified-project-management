import {
    findNotificationsByUserId,
    countNotificationsByUserId,
    updateNotificationRead,
    markAllNotificationsRead,
} from "../infrastructure/notification.repository.js";
import { notFoundError } from "../../../shared/errors/app-error.js";

export const getUserNotifications = async (
    userId: string,
    organizationId: string,
    page: number = 1,
    limit: number = 10,
) => {
    const [data, total] = await Promise.all([
        findNotificationsByUserId(userId, organizationId, page, limit),
        countNotificationsByUserId(userId, organizationId),
    ]);
    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const markAsRead = async (id: string, userId: string) => {
    const updated = await updateNotificationRead(id, userId);
    if (!updated) {
        throw notFoundError("Notification not found");
    }
    return updated;
};

export const markAllAsRead = async (userId: string, organizationId: string) => {
    await markAllNotificationsRead(userId, organizationId);
    return { success: true };
};
