import { describe, it, expect, beforeAll } from "vitest";
import {
    registerUser,
    verifyOtp,
} from "../src/modules/users/application/user.use-cases.js";
import { createOrganization } from "../src/modules/organizations/application/organization.use-cases.js";
import {
    saveDirectMessage,
    getDirectMessagesBetweenUsers,
    markDirectMessagesAsRead,
    getUnreadDirectMessagesCount,
    deleteDirectMessage,
    forwardDirectMessages,
} from "../src/modules/chat/infrastructure/chat.repository.js";
import { getDirectChatHistoryUseCase } from "../src/modules/chat/application/chat.use-cases.js";

import { db } from "../src/infrastructure/database/client.js";
import {
    organizationMembers,
    roles,
    organizations,
    directMessages,
} from "../src/infrastructure/database/schema/index.js";
import { eq } from "drizzle-orm";

describe("Direct Chat Integration Tests", () => {
    let ownerId: string;
    let member2Id: string;
    let ownerName: string;
    let orgId: string;
    let lastMessageId: string;

    beforeAll(async () => {
        const uniqueTime = Date.now();

        const ownerEmail = `owner_chat_${uniqueTime}@example.com`;
        const ownerPhone = `9997${String(uniqueTime).slice(-6)}`;
        ownerName = `owner_chat_${uniqueTime}`;
        const owner = await registerUser({
            username: ownerName,
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
        ownerId = owner.id;

        const member2Email = `member2_chat_${uniqueTime}@example.com`;
        const member2Phone = `8886${String(uniqueTime).slice(-6)}`;
        const member2 = await registerUser({
            username: `member2_chat_${uniqueTime}`,
            email: member2Email,
            phoneNumber: member2Phone,
            password: "Password@123",
        });
        await verifyOtp({
            email: member2Email,
            phoneNumber: member2Phone,
            emailOtp: "123456",
            phoneOtp: "123456",
        });
        member2Id = member2.id;

        const org = await createOrganization(
            {
                name: `Org_Chat_Test_${uniqueTime}`,
                slug: `org-chat-test-${uniqueTime}`,
            },
            ownerId,
        );
        orgId = org.id;

        const role = await db
            .insert(roles)
            .values({
                organizationId: orgId,
                name: "Developer",
            })
            .returning();

        await db.insert(organizationMembers).values({
            organizationId: orgId,
            memberId: member2Id,
            roleId: role[0]!.id,
            status: "active",
        });

        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);

        await db
            .update(organizations)
            .set({ plan: "pro", subscriptionExpiresAt: futureDate })
            .where(eq(organizations.id, orgId));
    }, 40000);

    it("should successfully save a 1-to-1 direct message and retrieve history", async () => {
        const msg1 = await saveDirectMessage({
            organizationId: orgId,
            senderId: ownerId,
            receiverId: member2Id,
            message: "Hello member 2!",
        });

        expect(msg1.id).toBeDefined();
        expect(msg1.senderId).toBe(ownerId);
        expect(msg1.receiverId).toBe(member2Id);
        expect(msg1.message).toBe("Hello member 2!");
        expect(msg1.isRead).toBe(false);
        lastMessageId = msg1.id;

        const history = await getDirectMessagesBetweenUsers(
            orgId,
            ownerId,
            member2Id,
        );

        expect(history.length).toBe(1);
        expect(history[0]!.message).toBe("Hello member 2!");
        expect(history[0]!.senderName).toBeDefined();
    });

    it("should save message with reply to parent message", async () => {
        const replyMsg = await saveDirectMessage({
            organizationId: orgId,
            senderId: member2Id,
            receiverId: ownerId,
            message: "Replying to your hello!",
            replyToId: lastMessageId,
            replyToSenderName: ownerName,
            replyToSnippet: "Hello member 2!",
        });

        expect(replyMsg.replyToId).toBe(lastMessageId);
        expect(replyMsg.replyToSenderName).toBe(ownerName);
        expect(replyMsg.replyToSnippet).toBe("Hello member 2!");
    });

    it("should forward messages to recipient showing original sender name", async () => {
        const forwarded = await forwardDirectMessages({
            organizationId: orgId,
            senderId: ownerId,
            messageIds: [lastMessageId],
            recipientIds: [member2Id],
            senderName: ownerName,
        });

        expect(forwarded.length).toBe(1);
        expect(forwarded[0]!.isForwarded).toBe(true);
        expect(forwarded[0]!.forwardedFromSenderName).toBe(ownerName);
    });

    it("should allow deleting own message within 1 hour window", async () => {
        const deleted = await deleteDirectMessage(
            orgId,
            lastMessageId,
            ownerId,
            ownerName,
        );

        expect(deleted.isDeleted).toBe(true);
        expect(deleted.deletedByUserName).toBe(ownerName);
        expect(deleted.message).toBeNull();
    });

    it("should reject deleting message sent more than 1 hour ago", async () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const [oldMsg] = await db
            .insert(directMessages)
            .values({
                organizationId: orgId,
                senderId: ownerId,
                receiverId: member2Id,
                message: "Old message",
                createdAt: twoHoursAgo,
            })
            .returning();

        await expect(
            deleteDirectMessage(orgId, oldMsg!.id, ownerId, ownerName),
        ).rejects.toThrow(
            "Messages can only be deleted within 1 hour of sending.",
        );
    });
});
