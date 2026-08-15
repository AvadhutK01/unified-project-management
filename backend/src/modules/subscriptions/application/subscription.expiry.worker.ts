import { Worker, Job } from "bullmq";
import { redisConnection } from "./subscription.expiry.queue.js";
import { logger } from "../../../config/logger.js";
import {
    EXPIRY_QUEUE_NAME,
    SCAN_JOB_NAME,
    EXPIRE_JOB_NAME,
    EXPIRY_BATCH_SIZE,
} from "../../../config/subscription.expiry.config.js";
import { findExpiredActiveSubscriptions } from "../infrastructure/subscription.repository.js";
import { expireSubscription } from "./subscription.expiry.service.js";
import { enqueueSubscriptionExpiryJob } from "./subscription.expiry.queue.js";

/**
 * Initializes the BullMQ worker for subscription expiry tasks.
 */
export const initializeSubscriptionExpiryWorker = (): Worker => {
    const worker = new Worker(
        EXPIRY_QUEUE_NAME,
        async (job: Job) => {
            if (job.name === SCAN_JOB_NAME) {
                logger.info("Running subscription expiry scan...");

                try {
                    const expiredSubscriptions =
                        await findExpiredActiveSubscriptions(EXPIRY_BATCH_SIZE);

                    if (expiredSubscriptions.length === 0) {
                        logger.info("No expired active subscriptions found.");
                        return;
                    }

                    logger.info(
                        { count: expiredSubscriptions.length },
                        `Found ${expiredSubscriptions.length} expired active subscriptions. Enqueuing individual expiry jobs.`,
                    );

                    for (const sub of expiredSubscriptions) {
                        await enqueueSubscriptionExpiryJob(sub.id);
                    }
                } catch (error) {
                    logger.error(
                        { error },
                        "Error occurred during subscription expiry scan",
                    );
                    throw error;
                }
            } else if (job.name === EXPIRE_JOB_NAME) {
                const { subscriptionId } = job.data;

                if (!subscriptionId) {
                    throw new Error("Job missing subscriptionId");
                }

                logger.info(
                    { subscriptionId },
                    "Processing subscription expiry job",
                );
                const processed = await expireSubscription(subscriptionId);

                if (processed) {
                    logger.info(
                        { subscriptionId },
                        "Successfully processed subscription expiry",
                    );
                } else {
                    logger.info(
                        { subscriptionId },
                        "Subscription expiry skipped (already processed)",
                    );
                }
            }
        },
        {
            connection: redisConnection,
            concurrency: 10,
        },
    );

    worker.on("failed", (job, err) => {
        logger.error(
            { jobId: job?.id, jobName: job?.name, error: err.message },
            "Subscription expiry job failed",
        );
    });

    worker.on("error", (err) => {
        logger.error(
            { err },
            "Subscription expiry worker encountered an error",
        );
    });

    return worker;
};
