import { createApp } from "./create-app.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { initializeSocket } from "./socket.js";
import { initializeNotificationWorker } from "../modules/notifications/application/notification.worker.js";
import { notificationQueue } from "../modules/notifications/application/notification.queue.js";
import { initializeSubscriptionExpiryWorker } from "../modules/subscriptions/application/subscription.expiry.worker.js";
import { initializeSubscriptionExpiryScheduler } from "../modules/subscriptions/application/subscription.expiry.scheduler.js";

/**
 * Starts the HTTP server, initializes socket.io, background workers, and schedules cron tasks.
 */
export const startServer = (): void => {
    const app = createApp();
    const server = app.listen(env.PORT, () => {
        logger.info(
            `Server running in ${env.NODE_ENV} mode on port ${env.PORT}`,
        );
    });

    initializeSocket(server);

    initializeNotificationWorker();

    initializeSubscriptionExpiryWorker();
    initializeSubscriptionExpiryScheduler();

    notificationQueue
        .add(
            "check-deadlines",
            {},
            {
                repeat: {
                    pattern: "0 * * * *",
                },
                jobId: "sprint-deadline-checker",
            },
        )
        .catch(() => {});

    /**
     * Handles graceful shutdown of the HTTP server upon receiving termination signals.
     * @param signal The process signal received (e.g., SIGTERM, SIGINT).
     */
    const shutdown = (signal: string) => {
        logger.info(`Received ${signal}. Shutting down server gracefully...`);
        server.close(() => {
            logger.info("Server closed successfully.");
            process.exit(0);
        });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
};
