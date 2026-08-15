import {
    createSprintMedia,
    findSprintMediaById,
    findSprintMediaPaginated,
    countSprintMedia,
    softDeleteSprintMedia,
} from "../infrastructure/sprint-media.repository.js";
import { findSprintById } from "../infrastructure/sprint.repository.js";
import { findMemberByOrgAndUserId } from "../../organizations/infrastructure/organization-member.repository.js";
import { uploadToS3 } from "../../../shared/utils/s3.js";
import {
    badRequestError,
    notFoundError,
    forbiddenError,
} from "../../../shared/errors/app-error.js";
import { createActivityLog } from "../infrastructure/sprint-activity-log.repository.js";

/**
 * Uploads a file to S3 and registers it in sprint media schema.
 */
export const uploadSprintMedia = async (
    sprintId: string,
    userId: string,
    orgId: string,
    file: Express.Multer.File | undefined,
) => {
    if (!file) {
        throw badRequestError("No file uploaded");
    }

    const member = await findMemberByOrgAndUserId(orgId, userId);
    if (!member) {
        throw forbiddenError("You are not a member of this organization");
    }

    const sprint = await findSprintById(sprintId);
    if (!sprint) {
        throw notFoundError("Sprint not found");
    }

    const url = await uploadToS3(file, "sprints");

    const media = await createSprintMedia({
        sprintId,
        memberId: member.id,
        name: file.originalname,
        url,
        fileType: file.mimetype,
        fileSize: file.size,
    });

    await createActivityLog({
        sprintId,
        userId,
        action: "added_attachment",
        description: "Attached a file",
    });

    return media;
};

/**
 * Retrieves a paginated list of sprint media attachments.
 */
export const getSprintMediaList = async (
    sprintId: string,
    orgId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
) => {
    const sprint = await findSprintById(sprintId);
    if (!sprint) {
        throw notFoundError("Sprint not found");
    }

    const [data, total] = await Promise.all([
        findSprintMediaPaginated(sprintId, page, limit, search),
        countSprintMedia(sprintId, search),
    ]);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Soft deletes a sprint media attachment. Only the original uploader can delete.
 */
export const deleteSprintMedia = async (
    mediaId: string,
    userId: string,
    orgId: string,
) => {
    const member = await findMemberByOrgAndUserId(orgId, userId);
    if (!member) {
        throw forbiddenError("You are not a member of this organization");
    }

    const media = await findSprintMediaById(mediaId);
    if (!media) {
        throw notFoundError("Sprint media attachment not found");
    }

    if (media.memberId !== member.id) {
        throw forbiddenError(
            "You are not authorized to delete this media attachment",
        );
    }

    return softDeleteSprintMedia(mediaId);
};
