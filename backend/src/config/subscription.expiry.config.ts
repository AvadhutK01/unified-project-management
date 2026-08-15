/**
 * subscription.expiry.config.ts
 *
 * Central configuration for the subscription expiry mechanism.
 */

/** BullMQ queue name for all subscription-expiry jobs. */
export const EXPIRY_QUEUE_NAME = "subscription-expiry";

/**
 * Cron pattern for the scanner job.
 * Default: every 5 minutes.
 */
export const EXPIRY_CRON_PATTERN = "*/5 * * * *";

/**
 * Number of expired subscriptions to pull from Postgres per scheduler tick.
 */
export const EXPIRY_BATCH_SIZE = 500;

/** BullMQ job name for the scanner (one repeating job). */
export const SCAN_JOB_NAME = "scan-expired-subscriptions";

/** BullMQ job name for individual expiry jobs. */
export const EXPIRE_JOB_NAME = "expire-subscription";

/**
 * Stable job ID for the repeating scanner so BullMQ de-duplicates it and
 * never queues the same scan more than once.
 */
export const SCAN_JOB_ID = "subscription-expiry-scanner";

/** How many times BullMQ will retry a failed expiry job. */
export const EXPIRY_JOB_ATTEMPTS = 3;

/**
 * Base delay in ms for exponential backoff on retry.
 */
export const EXPIRY_BACKOFF_DELAY_MS = 5_000;
