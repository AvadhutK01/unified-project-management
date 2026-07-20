import { Queue } from "bullmq";
import { env } from "../../../config/env.js";

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

export const enqueueNotificationJob = async (
    userId: string,
    organizationId: string,
    notificationId: string,
    title: string,
    message: string,
    type: string,
    entityId?: string | null,
    entityType?: string | null,
    metadata?: Record<string, any> | null,
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
