import { db } from "../../../infrastructure/database/client.js";
import {
    workitemDiscussions,
    workitemDiscussionTags,
    workitemActivityLogs,
    organizationMembers,
    users,
} from "../../../infrastructure/database/schema/index.js";
import { eq, and, isNull, inArray, desc, count } from "drizzle-orm";

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

        let tags: any[] = [];
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
