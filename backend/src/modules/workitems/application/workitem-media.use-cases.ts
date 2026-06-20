import {
    createWorkitemMedia,
    findWorkitemMediaById,
    findWorkitemMediaPaginated,
    countWorkitemMedia,
    softDeleteWorkitemMedia,
} from "../infrastructure/workitem-media.repository.js";
import { findWorkitemById } from "../infrastructure/workitem.repository.js";
import { findMemberByOrgAndUserId } from "../../organizations/infrastructure/organization-member.repository.js";
import { uploadToS3 } from "../../../shared/utils/s3.js";
import {
    badRequestError,
    notFoundError,
    forbiddenError,
} from "../../../shared/errors/app-error.js";
import { createActivityLog } from "../infrastructure/workitem-activity-log.repository.js";

export const uploadWorkitemMedia = async (
    workitemId: string,
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

    const workitem = await findWorkitemById(workitemId);
    if (!workitem) {
        throw notFoundError("Workitem not found");
    }

    const url = await uploadToS3(file, "workitems");

    const media = await createWorkitemMedia({
        workitemId,
        memberId: member.id,
        name: file.originalname,
        url,
        fileType: file.mimetype,
        fileSize: file.size,
    });

    await createActivityLog({
        workitemId,
        userId,
        action: "added_attachment",
        description: "Attached a file",
    });

    return media;
};

export const getWorkitemMediaList = async (
    workitemId: string,
    orgId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
) => {
    const workitem = await findWorkitemById(workitemId);
    if (!workitem) {
        throw notFoundError("Workitem not found");
    }

    const [data, total] = await Promise.all([
        findWorkitemMediaPaginated(workitemId, page, limit, search),
        countWorkitemMedia(workitemId, search),
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

export const deleteWorkitemMedia = async (
    mediaId: string,
    userId: string,
    orgId: string,
) => {
    const member = await findMemberByOrgAndUserId(orgId, userId);
    if (!member) {
        throw forbiddenError("You are not a member of this organization");
    }

    const media = await findWorkitemMediaById(mediaId);
    if (!media) {
        throw notFoundError("Workitem media attachment not found");
    }

    if (media.memberId !== member.id) {
        throw forbiddenError(
            "You are not authorized to delete this media attachment",
        );
    }

    return softDeleteWorkitemMedia(mediaId);
};
