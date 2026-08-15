import { db } from "../../../infrastructure/database/client.js";
import {
    workitemDiscussions,
    workitemDiscussionTags,
    workitemActivityLogs,
    organizationMembers,
    users,
} from "../../../infrastructure/database/schema/index.js";
import { eq, and, isNull, inArray, desc, count } from "drizzle-orm";

/**
 * Associates tagged member IDs with a workitem discussion comment.
 * @param workitemDiscussionId UUID of the workitem discussion.
 * @param memberIds Array of member UUIDs.
 * @returns Array of created tag records.
 */
export const addDiscussionTags = async (
    workitemDiscussionId: string,
    memberIds: string[],
) => {
    const tagsData = memberIds.map((memberId) => ({
        workitemDiscussionId,
        memberId,
    }));
    const tags = await db
        .insert(workitemDiscussionTags)
        .values(tagsData)
        .returning();
    return tags;
};

/**
 * Removes all member tags from a workitem discussion.
 * @param workitemDiscussionId UUID of the workitem discussion.
 */
export const clearDiscussionTags = async (workitemDiscussionId: string) => {
    await db
        .delete(workitemDiscussionTags)
        .where(
            eq(
                workitemDiscussionTags.workitemDiscussionId,
                workitemDiscussionId,
            ),
        );
};

/**
 * Finds a workitem discussion record by ID.
 * @param id UUID of the discussion.
 * @returns Discussion record or null.
 */
export const findDiscussionById = async (id: string) => {
    const results = await db
        .select()
        .from(workitemDiscussions)
        .where(
            and(
                eq(workitemDiscussions.id, id),
                isNull(workitemDiscussions.deletedAt),
            ),
        )
        .limit(1);
    return results[0] ?? null;
};

/**
 * Retrieves paginated discussion comments for a workitem.
 * @param workitemId UUID of the workitem.
 * @param page Page number.
 * @param limit Page limit size.
 * @returns Array of discussion comment rows with author details.
 */
export const findDiscussionsPaginated = async (
    workitemId: string,
    page: number = 1,
    limit: number = 10,
) => {
    return db
        .select({
            id: workitemDiscussions.id,
            workitemId: workitemDiscussions.workitemId,
            memberId: workitemDiscussions.memberId,
            comment: workitemDiscussions.comment,
            createdAt: workitemDiscussions.createdAt,
            updatedAt: workitemDiscussions.updatedAt,
            deletedAt: workitemDiscussions.deletedAt,
            authorName: users.username,
            authorEmail: users.email,
            authorStatus: organizationMembers.status,
            authorUserId: users.id,
        })
        .from(workitemDiscussions)
        .innerJoin(
            organizationMembers,
            eq(workitemDiscussions.memberId, organizationMembers.id),
        )
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .where(
            and(
                eq(workitemDiscussions.workitemId, workitemId),
                isNull(workitemDiscussions.deletedAt),
            ),
        )
        .orderBy(desc(workitemDiscussions.updatedAt))
        .limit(limit)
        .offset((page - 1) * limit);
};

/**
 * Counts total active discussions for a workitem.
 * @param workitemId UUID of the workitem.
 * @returns Total count number.
 */
export const countDiscussions = async (workitemId: string) => {
    const results = await db
        .select({ count: count() })
        .from(workitemDiscussions)
        .where(
            and(
                eq(workitemDiscussions.workitemId, workitemId),
                isNull(workitemDiscussions.deletedAt),
            ),
        );
    return results[0]?.count ?? 0;
};

/**
 * Fetches tagged members for a set of discussion IDs.
 * @param discussionIds Array of discussion UUIDs.
 * @returns Array of tag records with user details.
 */
export const findTagsForDiscussions = async (discussionIds: string[]) => {
    if (discussionIds.length === 0) return [];
    return db
        .select({
            id: workitemDiscussionTags.id,
            workitemDiscussionId: workitemDiscussionTags.workitemDiscussionId,
            memberId: workitemDiscussionTags.memberId,
            userId: organizationMembers.memberId,
            username: users.username,
            email: users.email,
        })
        .from(workitemDiscussionTags)
        .innerJoin(
            organizationMembers,
            eq(workitemDiscussionTags.memberId, organizationMembers.id),
        )
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .where(
            inArray(workitemDiscussionTags.workitemDiscussionId, discussionIds),
        );
};

/**
 * Updates text comment of a workitem discussion.
 * @param id UUID of the discussion.
 * @param comment New comment text string.
 * @returns Updated discussion record or null.
 */
export const updateDiscussionComment = async (id: string, comment: string) => {
    const [updated] = await db
        .update(workitemDiscussions)
        .set({ comment, updatedAt: new Date() })
        .where(
            and(
                eq(workitemDiscussions.id, id),
                isNull(workitemDiscussions.deletedAt),
            ),
        )
        .returning();
    return updated ?? null;
};

/**
 * Soft deletes a workitem discussion record.
 * @param id UUID of the discussion.
 * @returns Soft deleted discussion record or null.
 */
export const softDeleteDiscussion = async (id: string) => {
    const [deleted] = await db
        .update(workitemDiscussions)
        .set({ deletedAt: new Date() })
        .where(
            and(
                eq(workitemDiscussions.id, id),
                isNull(workitemDiscussions.deletedAt),
            ),
        )
        .returning();
    return deleted ?? null;
};

/**
 * Creates a discussion comment, adds discussion tags, and logs activity in a single DB transaction.
 */
export const createWorkitemDiscussionWithTagsAndLogTx = async (data: {
    workitemId: string;
    memberId: string;
    comment: string;
    userId: string;
    taggedMemberIds: string[];
}) => {
    return db.transaction(async (tx) => {
        const [discussion] = await tx
            .insert(workitemDiscussions)
            .values({
                workitemId: data.workitemId,
                memberId: data.memberId,
                comment: data.comment,
            })
            .returning();

        if (!discussion) {
            throw new Error("Failed to create discussion comment");
        }

        let tags: Array<typeof workitemDiscussionTags.$inferSelect> = [];
        if (data.taggedMemberIds.length > 0) {
            tags = await tx
                .insert(workitemDiscussionTags)
                .values(
                    data.taggedMemberIds.map((memberId) => ({
                        workitemDiscussionId: discussion.id,
                        memberId,
                    })),
                )
                .returning();
        }

        await tx.insert(workitemActivityLogs).values({
            workitemId: data.workitemId,
            userId: data.userId,
            action: "added_comment",
            description: "Added a comment",
        });

        return { discussion, tags };
    });
};
