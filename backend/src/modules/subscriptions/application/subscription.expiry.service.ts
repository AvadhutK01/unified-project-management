/**
 * subscription.expiry.service.ts
 *
 * Business logic for expiring a single subscription.
 *
 * Design principles:
 *  - Idempotent: re-running for an already-expired subscription is a no-op.
 *  - Transactional: subscription update and org plan downgrade happen atomically.
 *  - Single-responsibility: the service knows nothing about queues or workers.
 */

import { db } from "../../../infrastructure/database/client.js";
import { logger } from "../../../config/logger.js";
import {
    markSubscriptionExpired,
    downgradeOrganizationToFree,
} from "../infrastructure/subscription.repository.js";
import { findOrganizationById } from "../../organizations/infrastructure/organization.repository.js";
import { findUserById } from "../../users/infrastructure/user.repository.js";
import { sendSubscriptionExpiryEmail } from "../../../shared/utils/email.js";

/**
 * Expires a subscription and downgrades the corresponding organization plan
 * to "free" inside a single database transaction.
 * @param subscriptionId UUID of the subscription to expire.
 * @returns true if the subscription was expired, false if it was already expired.
 */
export const expireSubscription = async (
    subscriptionId: string,
): Promise<boolean> => {
    let organizationId: string | null = null;

    try {
        await db.transaction(async (tx) => {
            const expired = await markSubscriptionExpired(subscriptionId, tx);

            if (!expired) {
                logger.info(
                    { subscriptionId },
                    "Subscription already expired — skipping (idempotent)",
                );
                return;
            }

            organizationId = expired.organizationId;

            await downgradeOrganizationToFree(organizationId, tx);

            logger.info(
                { subscriptionId, organizationId },
                "Subscription expired and organization downgraded to free plan",
            );
        });
    } catch (error) {
        logger.error(
            { subscriptionId, organizationId, error },
            "Failed to expire subscription inside transaction",
        );
        throw error;
    }

    if (organizationId) {
        const org = await findOrganizationById(organizationId);
        if (org) {
            const owner = await findUserById(org.ownerUserId);
            if (owner) {
                sendSubscriptionExpiryEmail(
                    owner.email,
                    org.name,
                    new Date().toISOString().split("T")[0] || "",
                ).catch((err: unknown) =>
                    console.error(
                        "Failed to send subscription expiry email:",
                        err,
                    ),
                );
            }
        }
    }

    return organizationId !== null;
};
