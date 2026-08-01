import { logger } from "../../../config/logger.js";
import { subscriptionExpiryQueue } from "./subscription.expiry.queue.js";
import {
    SCAN_JOB_NAME,
    EXPIRY_CRON_PATTERN,
    SCAN_JOB_ID,
} from "./subscription.expiry.config.js";

/**
 * Initializes the repeating BullMQ cron job that scans for expired subscriptions.
 */
export const initializeSubscriptionExpiryScheduler =
    async (): Promise<void> => {
        try {
            await subscriptionExpiryQueue.add(
                SCAN_JOB_NAME,
                {},
                {
                    repeat: {
                        pattern: EXPIRY_CRON_PATTERN,
                    },
                    jobId: SCAN_JOB_ID,
                },
            );
            logger.info(
                { pattern: EXPIRY_CRON_PATTERN },
                "Subscription expiry scheduler initialized successfully",
            );
        } catch (error) {
            logger.error(
                { error },
                "Failed to initialize subscription expiry scheduler",
            );
        }
    };
