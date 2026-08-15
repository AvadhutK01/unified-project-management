import { db } from "../../../infrastructure/database/client.js";
import {
    sprintDiscussions,
    sprintDiscussionTags,
    sprintActivityLogs,
    organizationMembers,
    users,
} from "../../../infrastructure/database/schema/index.js";
import { eq, and, isNull, inArray, count, desc } from "drizzle-orm";

/**
 * Adds tagged organization members to a discussion.
 */
export const addDiscussionTags = async (
    sprintDiscussionId: string,
    organizationMemberIds: string[],
) => {
    if (organizationMemberIds.length === 0) return [];
    return db
        .insert(sprintDiscussionTags)
        .values(
            organizationMemberIds.map((orgMemberId) => ({
                sprintDiscussionId,
                organizationMemberId: orgMemberId,
            })),
        )
        .returning();
};

/**
 * Clears all tags for a discussion.
 */
export const clearDiscussionTags = async (sprintDiscussionId: string) => {
    return db
        .delete(sprintDiscussionTags)
        .where(eq(sprintDiscussionTags.sprintDiscussionId, sprintDiscussionId));
};

/**
 * Finds a discussion record by its primary key.
 */
export const findDiscussionById = async (id: string) => {
    const results = await db
        .select()
        .from(sprintDiscussions)
        .where(
            and(
                eq(sprintDiscussions.id, id),
                isNull(sprintDiscussions.deletedAt),
            ),
        )
        .limit(1);
    return results[0] ?? null;
};

/**
 * Retrieves discussions for a sprint with pagination.
 */
export const findDiscussionsPaginated = async (
    sprintId: string,
    page: number,
    limit: number,
) => {
    const offset = (page - 1) * limit;
    return db
        .select({
            id: sprintDiscussions.id,
            sprintId: sprintDiscussions.sprintId,
            memberId: sprintDiscussions.memberId,
            comment: sprintDiscussions.comment,
            createdAt: sprintDiscussions.createdAt,
            updatedAt: sprintDiscussions.updatedAt,
            authorName: users.username,
            authorEmail: users.email,
            authorStatus: organizationMembers.status,
            authorUserId: users.id,
        })
        .from(sprintDiscussions)
        .innerJoin(
            organizationMembers,
            eq(sprintDiscussions.memberId, organizationMembers.id),
        )
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .where(
            and(
                eq(sprintDiscussions.sprintId, sprintId),
                isNull(sprintDiscussions.deletedAt),
            ),
        )
        .orderBy(desc(sprintDiscussions.updatedAt))
        .limit(limit)
        .offset(offset);
};

/**
 * Counts total discussions on a sprint.
 */
export const countDiscussions = async (sprintId: string) => {
    const [result] = await db
        .select({ value: count() })
        .from(sprintDiscussions)
        .where(
            and(
                eq(sprintDiscussions.sprintId, sprintId),
                isNull(sprintDiscussions.deletedAt),
            ),
        );
    return Number(result?.value ?? 0);
};

/**
 * Retrieves tags for a list of discussion IDs, including user details.
 */
export const findTagsForDiscussions = async (discussionIds: string[]) => {
    if (discussionIds.length === 0) return [];
    return db
        .select({
            id: sprintDiscussionTags.id,
            sprintDiscussionId: sprintDiscussionTags.sprintDiscussionId,
            memberId: sprintDiscussionTags.organizationMemberId,
            userId: users.id,
            name: users.username,
            email: users.email,
        })
        .from(sprintDiscussionTags)
        .innerJoin(
            organizationMembers,
            eq(
                sprintDiscussionTags.organizationMemberId,
                organizationMembers.id,
            ),
        )
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .where(inArray(sprintDiscussionTags.sprintDiscussionId, discussionIds));
};

/**
 * Updates a sprint discussion comment.
 */
export const updateDiscussionComment = async (id: string, comment: string) => {
    const [updated] = await db
        .update(sprintDiscussions)
        .set({ comment, updatedAt: new Date() })
        .where(
            and(
                eq(sprintDiscussions.id, id),
                isNull(sprintDiscussions.deletedAt),
            ),
        )
        .returning();
    return updated ?? null;
};

/**
 * Soft deletes a sprint discussion comment.
 */
export const softDeleteDiscussion = async (id: string) => {
    const [deleted] = await db
        .update(sprintDiscussions)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(
            and(
                eq(sprintDiscussions.id, id),
                isNull(sprintDiscussions.deletedAt),
            ),
        )
        .returning();
    return deleted ?? null;
};

/**
 * Creates a sprint discussion comment, adds discussion tags, and logs activity in a single DB transaction.
 */
export const createSprintDiscussionWithTagsAndLogTx = async (data: {
    sprintId: string;
    memberId: string;
    comment: string;
    userId: string;
    taggedMemberIds: string[];
}) => {
    return db.transaction(async (tx) => {
        const [discussion] = await tx
            .insert(sprintDiscussions)
            .values({
                sprintId: data.sprintId,
                memberId: data.memberId,
                comment: data.comment,
            })
            .returning();

        if (!discussion) {
            throw new Error("Failed to create discussion comment");
        }

        let tags: any[] = [];
        if (data.taggedMemberIds.length > 0) {
            tags = await tx
                .insert(sprintDiscussionTags)
                .values(
                    data.taggedMemberIds.map((orgMemberId) => ({
                        sprintDiscussionId: discussion.id,
                        organizationMemberId: orgMemberId,
                    })),
                )
                .returning();
        }

        await tx.insert(sprintActivityLogs).values({
            sprintId: data.sprintId,
            userId: data.userId,
            action: "added_comment",
            description: "Added a comment",
        });

        return { discussion, tags };
    });
};
