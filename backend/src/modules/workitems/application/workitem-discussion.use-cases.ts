import {
    createDiscussionComment,
    addDiscussionTags,
    clearDiscussionTags,
    findDiscussionById,
    findDiscussionsPaginated,
    countDiscussions,
    findTagsForDiscussions,
    updateDiscussionComment,
    softDeleteDiscussion,
} from "../infrastructure/workitem-discussion.repository.js";
import { findWorkitemById } from "../infrastructure/workitem.repository.js";
import {
    findMemberByOrgAndUserId,
    findMemberById,
} from "../../organizations/infrastructure/organization-member.repository.js";
import {
    badRequestError,
    notFoundError,
    forbiddenError,
} from "../../../shared/errors/app-error.js";
import { createActivityLog } from "../infrastructure/workitem-activity-log.repository.js";

export const createWorkitemDiscussion = async (
    workitemId: string,
    userId: string,
    orgId: string,
    comment: string,
    taggedMemberIds: string[] = [],
) => {
    const creatorMember = await findMemberByOrgAndUserId(orgId, userId);
    if (!creatorMember) {
        throw forbiddenError("You are not a member of this organization");
    }

    const workitem = await findWorkitemById(workitemId);
    if (!workitem) {
        throw notFoundError("Workitem not found");
    }

    for (const taggedMemberId of taggedMemberIds) {
        const taggedMember = await findMemberById(taggedMemberId);
        if (!taggedMember || taggedMember.organizationId !== orgId) {
            throw badRequestError(
                `Tagged member with ID ${taggedMemberId} does not belong to this organization`,
            );
        }
    }

    const discussion = await createDiscussionComment({
        workitemId,
        memberId: creatorMember.id,
        comment,
    });
    if (!discussion) {
        throw new Error("Failed to create discussion comment");
    }

    let tags: any[] = [];
    if (taggedMemberIds.length > 0) {
        tags = await addDiscussionTags(discussion.id, taggedMemberIds);
    }

    await createActivityLog({
        workitemId,
        userId,
        action: "added_comment",
        description: "Added a comment",
    });

    return {
        ...discussion,
        tags,
    };
};

export const updateWorkitemDiscussion = async (
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

    let tags: any[] = [];
    if (taggedMemberIds.length > 0) {
        tags = await addDiscussionTags(discussionId, taggedMemberIds);
    }

    return {
        ...updatedDiscussion,
        tags,
    };
};

export const getWorkitemDiscussions = async (
    workitemId: string,
    orgId: string,
    page: number = 1,
    limit: number = 10,
) => {
    const workitem = await findWorkitemById(workitemId);
    if (!workitem) {
        throw notFoundError("Workitem not found");
    }

    const [discussions, total] = await Promise.all([
        findDiscussionsPaginated(workitemId, page, limit),
        countDiscussions(workitemId),
    ]);

    const discussionIds = discussions.map((d) => d.id);
    const tags = await findTagsForDiscussions(discussionIds);

    const formattedData = discussions.map((d) => {
        const commentTags = tags
            .filter((t) => t.workitemDiscussionId === d.id)
            .map((t) => ({
                id: t.id,
                memberId: t.memberId,
                userId: t.userId,
                username: t.username,
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

export const deleteWorkitemDiscussion = async (
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
