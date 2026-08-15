import {
    findNotificationsByUserId,
    countNotificationsByUserId,
    updateNotificationRead,
    markAllNotificationsRead,
} from "../infrastructure/notification.repository.js";
import { notFoundError } from "../../../shared/errors/app-error.js";

/**
 * Retrieves paginated notifications for a specific user in an organization.
 * @param userId UUID of the recipient user.
 * @param organizationId UUID of the organization.
 * @param page Page number.
 * @param limit Page size.
 * @returns Object containing notification records and pagination metadata.
 */
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

/**
 * Marks a single notification as read for a user.
 * @param id UUID of the notification.
 * @param userId UUID of the user.
 * @returns Updated notification record.
 */
export const markAsRead = async (id: string, userId: string) => {
    const updated = await updateNotificationRead(id, userId);
    if (!updated) {
        throw notFoundError("Notification not found");
    }
    return updated;
};

/**
 * Marks all unread notifications as read for a user in an organization.
 * @param userId UUID of the user.
 * @param organizationId UUID of the organization.
 * @returns Object indicating success.
 */
export const markAllAsRead = async (userId: string, organizationId: string) => {
    await markAllNotificationsRead(userId, organizationId);
    return { success: true };
};
