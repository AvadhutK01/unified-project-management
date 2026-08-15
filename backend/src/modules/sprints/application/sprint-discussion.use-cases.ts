import {
    createSprintDiscussionWithTagsAndLogTx,
    addDiscussionTags,
    clearDiscussionTags,
    findDiscussionById,
    findDiscussionsPaginated,
    countDiscussions,
    findTagsForDiscussions,
    updateDiscussionComment,
    softDeleteDiscussion,
} from "../infrastructure/sprint-discussion.repository.js";
import { findSprintById } from "../infrastructure/sprint.repository.js";
import {
    findMemberByOrgAndUserId,
    findMemberById,
} from "../../organizations/infrastructure/organization-member.repository.js";
import {
    badRequestError,
    notFoundError,
    forbiddenError,
} from "../../../shared/errors/app-error.js";
import { createActivityLog } from "../infrastructure/sprint-activity-log.repository.js";
import { notifyDiscussionMention } from "../../notifications/application/notification.service.js";

/**
 * Creates a new sprint discussion comment and tags members.
 */
export const createSprintDiscussion = async (
    sprintId: string,
    userId: string,
    orgId: string,
    comment: string,
    taggedMemberIds: string[] = [],
) => {
    const creatorMember = await findMemberByOrgAndUserId(orgId, userId);
    if (!creatorMember) {
        throw forbiddenError("You are not a member of this organization");
    }

    const sprint = await findSprintById(sprintId);
    if (!sprint) {
        throw notFoundError("Sprint not found");
    }

    for (const taggedMemberId of taggedMemberIds) {
        const taggedMember = await findMemberById(taggedMemberId);
        if (!taggedMember || taggedMember.organizationId !== orgId) {
            throw badRequestError(
                `Tagged member with ID ${taggedMemberId} does not belong to this organization`,
            );
        }
    }

    const { discussion, tags } = await createSprintDiscussionWithTagsAndLogTx({
        sprintId,
        memberId: creatorMember.id,
        comment,
        userId,
        taggedMemberIds,
    });

    if (taggedMemberIds.length > 0) {
        for (const taggedMemberId of taggedMemberIds) {
            await notifyDiscussionMention(
                userId,
                comment,
                taggedMemberId,
                sprintId,
                "sprint",
            );
        }
    }

    return {
        ...discussion,
        tags,
    };
};

/**
 * Updates a sprint discussion comment and updates tagged members.
 */
export const updateSprintDiscussion = async (
    discussionId: string,
    userId: string,
    orgId: string,
    comment: string,
    taggedMemberIds: string[] = [],
) => {
    const creatorMember = await findMemberByOrgAndUserId(orgId, userId);
    if (!creatorMember) {
        throw forbiddenError("You are not a member of this organization");
    }

    const discussion = await findDiscussionById(discussionId);
    if (!discussion) {
        throw notFoundError("Discussion comment not found");
    }

    if (discussion.memberId !== creatorMember.id) {
        throw forbiddenError(
            "You are not authorized to update this discussion comment",
        );
    }

    for (const taggedMemberId of taggedMemberIds) {
        const taggedMember = await findMemberById(taggedMemberId);
        if (!taggedMember || taggedMember.organizationId !== orgId) {
            throw badRequestError(
                `Tagged member with ID ${taggedMemberId} does not belong to this organization`,
            );
        }
    }

    const updatedDiscussion = await updateDiscussionComment(
        discussionId,
        comment,
    );
    if (!updatedDiscussion) {
        throw new Error("Failed to update discussion comment");
    }
    await clearDiscussionTags(discussionId);

    let tags: Awaited<ReturnType<typeof addDiscussionTags>> = [];
    if (taggedMemberIds.length > 0) {
        tags = await addDiscussionTags(discussionId, taggedMemberIds);
        for (const taggedMemberId of taggedMemberIds) {
            await notifyDiscussionMention(
                userId,
                comment,
                taggedMemberId,
                discussion.sprintId,
                "sprint",
            );
        }
    }

    return {
        ...updatedDiscussion,
        tags,
    };
};

/**
 * Retrieves a paginated list of discussions for a sprint.
 */
export const getSprintDiscussions = async (
    sprintId: string,
    orgId: string,
    page: number = 1,
    limit: number = 10,
) => {
    const sprint = await findSprintById(sprintId);
    if (!sprint) {
        throw notFoundError("Sprint not found");
    }

    const [discussions, total] = await Promise.all([
        findDiscussionsPaginated(sprintId, page, limit),
        countDiscussions(sprintId),
    ]);

    const discussionIds = discussions.map((d) => d.id);
    const tags = await findTagsForDiscussions(discussionIds);

    const formattedData = discussions.map((d) => {
        const commentTags = tags
            .filter((t) => t.sprintDiscussionId === d.id)
            .map((t) => ({
                id: t.id,
                memberId: t.memberId,
                userId: t.userId,
                name: t.name,
                email: t.email,
            }));
        return {
            ...d,
            taggedMembers: commentTags,
        };
    });

    return {
        data: formattedData,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Deletes a sprint discussion comment.
 */
export const deleteSprintDiscussion = async (
    discussionId: string,
    userId: string,
    orgId: string,
) => {
    const creatorMember = await findMemberByOrgAndUserId(orgId, userId);
    if (!creatorMember) {
        throw forbiddenError("You are not a member of this organization");
    }

    const discussion = await findDiscussionById(discussionId);
    if (!discussion) {
        throw notFoundError("Discussion comment not found");
    }

    if (discussion.memberId !== creatorMember.id) {
        throw forbiddenError(
            "You are not authorized to delete this discussion comment",
        );
    }

    return softDeleteDiscussion(discussionId);
};
