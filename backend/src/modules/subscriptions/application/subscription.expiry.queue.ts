import { Queue } from "bullmq";
import { env } from "../../../config/env.js";
import {
    EXPIRY_QUEUE_NAME,
    EXPIRE_JOB_NAME,
    EXPIRY_JOB_ATTEMPTS,
    EXPIRY_BACKOFF_DELAY_MS,
} from "./subscription.expiry.config.js";

const redisUrl = new URL(env.REDIS_URL);
export const redisConnection = {
    host: redisUrl.hostname,
    port: parseInt(redisUrl.port, 10),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
};

export const subscriptionExpiryQueue = new Queue(EXPIRY_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
    },
});

/**
 * Enqueues a job to expire a specific subscription.
 *
 * @param subscriptionId UUID of the subscription to expire.
 */
export const enqueueSubscriptionExpiryJob = async (subscriptionId: string) => {
    await subscriptionExpiryQueue.add(
        EXPIRE_JOB_NAME,
        { subscriptionId },
        {
            attempts: EXPIRY_JOB_ATTEMPTS,
            backoff: {
                type: "exponential",
                delay: EXPIRY_BACKOFF_DELAY_MS,
            },
            removeOnComplete: true,
            removeOnFail: false,
        },
    );
};
