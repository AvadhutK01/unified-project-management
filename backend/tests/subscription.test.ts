import { describe, it, expect, beforeAll } from "vitest";
import { db } from "../src/infrastructure/database/client.js";
import {
    subscriptions,
    organizations,
} from "../src/infrastructure/database/schema/index.js";
import {
    registerUser,
    verifyOtp,
} from "../src/modules/users/application/user.use-cases.js";
import { createOrganization } from "../src/modules/organizations/application/organization.use-cases.js";
import {
    upsertSubscriptionRecord,
    activateOrganizationSubscription,
} from "../src/modules/subscriptions/infrastructure/subscription.repository.js";
import {
    findExpiredActiveSubscriptions,
    markSubscriptionExpired,
    downgradeOrganizationToFree,
} from "../src/modules/subscriptions/infrastructure/subscription.repository.js";
import { expireSubscription } from "../src/modules/subscriptions/application/subscription.expiry.service.js";
import { eq } from "drizzle-orm";

describe("Subscription Expiry Integration Tests", () => {
    let ownerId: string;
    let organizationId: string;
    const uniqueTime = Date.now();

    beforeAll(async () => {
        const ownerEmail = `sub_owner_${uniqueTime}@example.com`;
        const ownerPhone = `9999${String(uniqueTime).slice(-6)}`;
        const ownerResult = await registerUser({
            username: `sub_owner_${uniqueTime}`,
            email: ownerEmail,
            phoneNumber: ownerPhone,
            password: "Password@123",
        });
        await verifyOtp({
            email: ownerEmail,
            phoneNumber: ownerPhone,
            emailOtp: "123456",
            phoneOtp: "123456",
        });
        ownerId = ownerResult.id;

        const org = await createOrganization(
            {
                name: `Org_Sub_${uniqueTime}`,
                slug: `org-sub-${uniqueTime}`,
                description: "Subscription test organization",
            },
            ownerId,
        );
        organizationId = org.id;
    });

    it("should successfully find, mark, and process expired subscriptions", async () => {
        const periodStart = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        const periodEnd = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

        await upsertSubscriptionRecord({
            organizationId,
            razorpayOrderId: "order_mock_123",
            plan: "premium",
            amount: 999,
            periodStart,
            periodEnd,
        });

        await activateOrganizationSubscription(
            organizationId,
            "premium",
            periodEnd,
        );

        const [orgBefore] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.id, organizationId));
        expect(orgBefore!.plan).toBe("premium");
        expect(orgBefore!.subscriptionExpiresAt).toBeDefined();

        const expiredActive = await findExpiredActiveSubscriptions(10);
        expect(expiredActive.length).toBeGreaterThanOrEqual(1);
        const targetSub = expiredActive.find(
            (s) => s.organizationId === organizationId,
        );
        expect(targetSub).toBeDefined();
        expect(targetSub!.id).toBeDefined();

        const success = await expireSubscription(targetSub!.id);
        expect(success).toBe(true);

        const [orgAfter] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.id, organizationId));
        expect(orgAfter!.plan).toBe("free");
        expect(orgAfter!.subscriptionExpiresAt).toBeNull();

        const [subAfter] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.id, targetSub!.id));
        expect(subAfter!.status).toBe("expired");

        const secondRun = await expireSubscription(targetSub!.id);
        expect(secondRun).toBe(false);
    });
});
