import { createApp } from "./create-app.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { initializeSocket } from "./socket.js";
import { initializeNotificationWorker } from "../modules/notifications/application/notification.worker.js";
import { notificationQueue } from "../modules/notifications/application/notification.queue.js";

export const startServer = (): void => {
    const app = createApp();
    const server = app.listen(env.PORT, () => {
        logger.info(
            `Server running in ${env.NODE_ENV} mode on port ${env.PORT}`,
        );
    });

    initializeSocket(server);

    initializeNotificationWorker();

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
