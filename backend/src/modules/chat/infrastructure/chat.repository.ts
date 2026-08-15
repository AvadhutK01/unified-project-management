import { db } from "../../../infrastructure/database/client.js";
import { markDirectMessageNotificationsAsRead } from "../../notifications/application/notification.service.js";
import {
    directMessages,
    users,
    organizationMembers,
    organizations,
    projects,
    phases,
    sprints,
    workitems,
    DirectMessageInsert,
} from "../../../infrastructure/database/schema/index.js";
import { eq, and, or, desc, asc, count, SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const senderUsers = alias(users, "sender_users");
const receiverUsers = alias(users, "receiver_users");

/**
 * Resolves a receiver ID string to a valid users.id UUID.
 * If an organizationMembers.id was provided, maps it to memberId (users.id).
 */
async function resolveUserId(id: string): Promise<string> {
    const [userRecord] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    if (userRecord) {
        return userRecord.id;
    }

    const [memberRecord] = await db
        .select({ memberId: organizationMembers.memberId })
        .from(organizationMembers)
        .where(eq(organizationMembers.id, id))
        .limit(1);

    if (memberRecord) {
        return memberRecord.memberId;
    }

    return id;
}

/**
 * Saves a new direct message record to the database and returns the populated message with sender info.
 */
export const saveDirectMessage = async (data: {
    organizationId: string;
    senderId: string;
    receiverId: string;
    message?: string | null;
    fileUrl?: string | null;
    fileName?: string | null;
    fileType?: string | null;
    fileSize?: number | null;
    replyToId?: string | null;
    replyToSenderName?: string | null;
    replyToSnippet?: string | null;
    isForwarded?: boolean;
    forwardedFromSenderName?: string | null;
}) => {
    const resolvedReceiverId = await resolveUserId(data.receiverId);
    const resolvedSenderId = await resolveUserId(data.senderId);

    const [inserted] = await db
        .insert(directMessages)
        .values({
            organizationId: data.organizationId,
            senderId: resolvedSenderId,
            receiverId: resolvedReceiverId,
            message: data.message ?? null,
            fileUrl: data.fileUrl ?? null,
            fileName: data.fileName ?? null,
            fileType: data.fileType ?? null,
            fileSize: data.fileSize ?? null,
            replyToId: data.replyToId ?? null,
            replyToSenderName: data.replyToSenderName ?? null,
            replyToSnippet: data.replyToSnippet ?? null,
            isForwarded: data.isForwarded ?? false,
            forwardedFromSenderName: data.forwardedFromSenderName ?? null,
        })
        .returning();

    if (!inserted) {
        throw new Error("Failed to save direct message");
    }

    const [saved] = await db
        .select({
            id: directMessages.id,
            organizationId: directMessages.organizationId,
            senderId: directMessages.senderId,
            receiverId: directMessages.receiverId,
            message: directMessages.message,
            fileUrl: directMessages.fileUrl,
            fileName: directMessages.fileName,
            fileType: directMessages.fileType,
            fileSize: directMessages.fileSize,
            isRead: directMessages.isRead,
            replyToId: directMessages.replyToId,
            replyToSenderName: directMessages.replyToSenderName,
            replyToSnippet: directMessages.replyToSnippet,
            isForwarded: directMessages.isForwarded,
            forwardedFromSenderName: directMessages.forwardedFromSenderName,
            isDeleted: directMessages.isDeleted,
            deletedByUserName: directMessages.deletedByUserName,
            createdAt: directMessages.createdAt,
            updatedAt: directMessages.updatedAt,
            senderName: users.username,
            senderEmail: users.email,
        })
        .from(directMessages)
        .innerJoin(users, eq(directMessages.senderId, users.id))
        .where(eq(directMessages.id, inserted.id));

    return saved;
};

/**
 * Retrieves chronological 1-to-1 direct chat history between two users with pagination.
 */
export const getDirectMessagesBetweenUsers = async (
    organizationId: string,
    userId1: string,
    userId2: string,
    limit: number = 50,
    offset: number = 0,
) => {
    const resolvedUser1 = await resolveUserId(userId1);
    const resolvedUser2 = await resolveUserId(userId2);

    const condition = and(
        eq(directMessages.organizationId, organizationId),
        or(
            and(
                eq(directMessages.senderId, resolvedUser1),
                eq(directMessages.receiverId, resolvedUser2),
            ),
            and(
                eq(directMessages.senderId, resolvedUser2),
                eq(directMessages.receiverId, resolvedUser1),
            ),
        ),
    );

    const messages = await db
        .select({
            id: directMessages.id,
            organizationId: directMessages.organizationId,
            senderId: directMessages.senderId,
            receiverId: directMessages.receiverId,
            message: directMessages.message,
            fileUrl: directMessages.fileUrl,
            fileName: directMessages.fileName,
            fileType: directMessages.fileType,
            fileSize: directMessages.fileSize,
            isRead: directMessages.isRead,
            replyToId: directMessages.replyToId,
            replyToSenderName: directMessages.replyToSenderName,
            replyToSnippet: directMessages.replyToSnippet,
            isForwarded: directMessages.isForwarded,
            forwardedFromSenderName: directMessages.forwardedFromSenderName,
            isDeleted: directMessages.isDeleted,
            deletedByUserName: directMessages.deletedByUserName,
            createdAt: directMessages.createdAt,
            updatedAt: directMessages.updatedAt,
            senderName: senderUsers.username,
            senderEmail: senderUsers.email,
        })
        .from(directMessages)
        .innerJoin(senderUsers, eq(directMessages.senderId, senderUsers.id))
        .where(condition)
        .orderBy(desc(directMessages.createdAt))
        .limit(limit)
        .offset(offset);

    return messages.reverse();
};

/**
 * Counts total direct messages exchanged between two users in an organization.
 */
export const countDirectMessagesBetweenUsers = async (
    organizationId: string,
    userId1: string,
    userId2: string,
) => {
    const resolvedUser1 = await resolveUserId(userId1);
    const resolvedUser2 = await resolveUserId(userId2);

    const condition = and(
        eq(directMessages.organizationId, organizationId),
        or(
            and(
                eq(directMessages.senderId, resolvedUser1),
                eq(directMessages.receiverId, resolvedUser2),
            ),
            and(
                eq(directMessages.senderId, resolvedUser2),
                eq(directMessages.receiverId, resolvedUser1),
            ),
        ),
    );

    const [result] = await db
        .select({ value: count() })
        .from(directMessages)
        .where(condition);

    return Number(result?.value ?? 0);
};

/**
 * Marks all unread direct messages sent by senderId to receiverId as read.
 */
export const markDirectMessagesAsRead = async (
    organizationId: string,
    senderId: string,
    receiverId: string,
) => {
    const resolvedSenderId = await resolveUserId(senderId);
    const resolvedReceiverId = await resolveUserId(receiverId);

    await db
        .update(directMessages)
        .set({ isRead: true, updatedAt: new Date() })
        .where(
            and(
                eq(directMessages.organizationId, organizationId),
                eq(directMessages.senderId, resolvedSenderId),
                eq(directMessages.receiverId, resolvedReceiverId),
                eq(directMessages.isRead, false),
            ),
        );

    await markDirectMessageNotificationsAsRead(
        organizationId,
        resolvedSenderId,
        resolvedReceiverId,
    ).catch((err) => console.error("Failed to mark notifications read:", err));
};

/**
 * Gets the total count of unread direct messages for a user in an organization.
 */
export const getUnreadDirectMessagesCount = async (
    organizationId: string,
    userId: string,
) => {
    const resolvedUserId = await resolveUserId(userId);

    const results = await db
        .select({ count: count() })
        .from(directMessages)
        .where(
            and(
                eq(directMessages.organizationId, organizationId),
                eq(directMessages.receiverId, resolvedUserId),
                eq(directMessages.isRead, false),
            ),
        );

    return results[0]?.count ?? 0;
};

/**
 * Deletes a direct message within the 1-hour deletion window.
 */
export const deleteDirectMessage = async (
    organizationId: string,
    messageId: string,
    userId: string,
    deleterUserName: string,
) => {
    const resolvedUserId = await resolveUserId(userId);

    const [msg] = await db
        .select({
            id: directMessages.id,
            senderId: directMessages.senderId,
            createdAt: directMessages.createdAt,
            isDeleted: directMessages.isDeleted,
        })
        .from(directMessages)
        .where(
            and(
                eq(directMessages.id, messageId),
                eq(directMessages.organizationId, organizationId),
            ),
        );

    if (!msg) {
        throw new Error("Message not found");
    }

    if (msg.senderId !== resolvedUserId) {
        throw new Error("You can only delete your own messages");
    }

    if (msg.isDeleted) {
        throw new Error("Message is already deleted");
    }

    const ageMs = Date.now() - new Date(msg.createdAt).getTime();
    if (ageMs > 60 * 60 * 1000) {
        throw new Error(
            "Messages can only be deleted within 1 hour of sending.",
        );
    }

    const [updated] = await db
        .update(directMessages)
        .set({
            isDeleted: true,
            deletedByUserName: deleterUserName,
            message: null,
            fileUrl: null,
            fileName: null,
            fileType: null,
            fileSize: null,
            updatedAt: new Date(),
        })
        .where(eq(directMessages.id, messageId))
        .returning();

    return updated;
};

/**
 * Forwards one or multiple direct messages to a list of target recipients.
 */
export const forwardDirectMessages = async (data: {
    organizationId: string;
    senderId: string;
    messageIds: string[];
    recipientIds: string[];
    senderName: string;
}) => {
    const msgs = await db
        .select({
            id: directMessages.id,
            message: directMessages.message,
            fileUrl: directMessages.fileUrl,
            fileName: directMessages.fileName,
            fileType: directMessages.fileType,
            fileSize: directMessages.fileSize,
            isForwarded: directMessages.isForwarded,
            forwardedFromSenderName: directMessages.forwardedFromSenderName,
            isDeleted: directMessages.isDeleted,
            senderName: senderUsers.username,
        })
        .from(directMessages)
        .innerJoin(senderUsers, eq(directMessages.senderId, senderUsers.id))
        .where(
            and(
                eq(directMessages.organizationId, data.organizationId),
                or(...data.messageIds.map((id) => eq(directMessages.id, id))),
            ),
        );

    const createdMessages: any[] = [];

    for (const msg of msgs) {
        if (msg.isDeleted) continue;

        const originalAuthor =
            msg.forwardedFromSenderName || msg.senderName || data.senderName;

        for (const recipientId of data.recipientIds) {
            const saved = await saveDirectMessage({
                organizationId: data.organizationId,
                senderId: data.senderId,
                receiverId: recipientId,
                message: msg.message,
                fileUrl: msg.fileUrl,
                fileName: msg.fileName,
                fileType: msg.fileType,
                fileSize: msg.fileSize,
                isForwarded: true,
                forwardedFromSenderName: originalAuthor,
            });

            createdMessages.push(saved);
        }
    }

    return createdMessages;
};

/**
 * Fetches deep organization hierarchy including projects, phases, sprints, and work items.
 */
export const getDeepOrganizationContextRepo = async (
    organizationId: string,
) => {
    const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, organizationId));

    if (!org) return null;

    const orgProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.organizationId, organizationId));

    const projectsWithDetails = await Promise.all(
        orgProjects.map(async (project) => {
            const projectPhases = await db
                .select()
                .from(phases)
                .where(eq(phases.projectId, project.id));

            const phasesWithSprints = await Promise.all(
                projectPhases.map(async (phase) => {
                    const phaseSprints = await db
                        .select()
                        .from(sprints)
                        .where(eq(sprints.phaseId, phase.id));

                    const sprintsWithWorkitems = await Promise.all(
                        phaseSprints.map(async (sprint) => {
                            const sprintWorkitems = await db
                                .select()
                                .from(workitems)
                                .where(eq(workitems.sprintId, sprint.id));

                            return {
                                ...sprint,
                                workitems: sprintWorkitems,
                            };
                        }),
                    );

                    return {
                        ...phase,
                        sprints: sprintsWithWorkitems,
                    };
                }),
            );

            return {
                ...project,
                phases: phasesWithSprints,
            };
        }),
    );

    return {
        organization: org,
        projects: projectsWithDetails,
    };
};
