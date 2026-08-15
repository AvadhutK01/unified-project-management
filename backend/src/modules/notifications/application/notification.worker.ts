import { Worker } from "bullmq";
import { redisConnection } from "./notification.queue.js";
import { getSocketServer } from "../../../app/socket.js";

/**
 * Initializes the BullMQ worker for processing notification delivery and deadline checking jobs.
 * @returns Initialized BullMQ Worker instance.
 */
export const initializeNotificationWorker = () => {
    const worker = new Worker(
        "notifications",
        async (job) => {
            if (job.name === "send-notification") {
                const {
                    userId,
                    organizationId,
                    notificationId,
                    title,
                    message,
                    type,
                    entityId,
                    entityType,
                    metadata,
                } = job.data;

                try {
                    const io = getSocketServer();
                    io.of("/socket.io")
                        .to(`user:${userId}:org:${organizationId}`)
                        .emit("notification:new", {
                            id: notificationId,
                            organizationId,
                            title,
                            message,
                            type,
                            entityId: entityId ?? null,
                            entityType: entityType ?? null,
                            metadata: metadata ?? null,
                            isRead: false,
                            createdAt: new Date().toISOString(),
                        });
                } catch (socketErr) {}
            } else if (job.name === "check-deadlines") {
                const { checkUpcomingSprintDeadlines } =
                    await import("./notification.service.js");
                await checkUpcomingSprintDeadlines();
            }
        },
        {
            connection: redisConnection,
        },
    );

    worker.on("failed", (job, err) => {});

    return worker;
};
