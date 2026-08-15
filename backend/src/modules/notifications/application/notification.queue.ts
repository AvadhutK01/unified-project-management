import { Queue } from "bullmq";
import { env } from "../../../config/env.js";
import type {
    NotificationType,
    NotificationEntityType,
    NotificationMetadata,
} from "../../../types/notifications.js";

const redisUrl = new URL(env.REDIS_URL);
const connection = {
    host: redisUrl.hostname,
    port: parseInt(redisUrl.port, 10),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
};

export const notificationQueue = new Queue("notifications", {
    connection,
});

/**
 * Enqueues a notification processing job.
 * @param userId The ID of the recipient user.
 * @param organizationId The ID of the parent organization.
 * @param notificationId The ID of the notification record.
 * @param title The title string.
 * @param message The detail message body.
 * @param type The type of notification.
 * @param entityId Optional related entity ID.
 * @param entityType Optional related entity domain type.
 * @param metadata Optional additional key-value payload object.
 */
export const enqueueNotificationJob = async (
    userId: string,
    organizationId: string,
    notificationId: string,
    title: string,
    message: string,
    type: NotificationType,
    entityId?: string | null,
    entityType?: NotificationEntityType | null,
    metadata?: NotificationMetadata | null,
) => {
    await notificationQueue.add("send-notification", {
        userId,
        organizationId,
        notificationId,
        title,
        message,
        type,
        entityId,
        entityType,
        metadata,
    });
};
export { connection as redisConnection };
