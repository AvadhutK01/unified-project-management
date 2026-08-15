import {
    getDirectMessagesBetweenUsers,
    countDirectMessagesBetweenUsers,
    markDirectMessagesAsRead,
    getDeepOrganizationContextRepo,
} from "../infrastructure/chat.repository.js";

import { isOrganizationOnPlan } from "../../../shared/middleware/require-premium.js";
import { uploadToS3 } from "../../../shared/utils/s3.js";
import {
    forbiddenError,
    badRequestError,
    notFoundError,
} from "../../../shared/errors/app-error.js";

/**
 * Verifies that the organization is on a Pro or Premium plan.
 * Throws a forbidden error if feature is unavailable.
 */
export const verifyProPlan = async (organizationId: string) => {
    const hasPro = await isOrganizationOnPlan(organizationId, "pro");
    if (!hasPro) {
        throw forbiddenError(
            "Member direct chat requires a Pro or Premium subscription. Upgrade your plan to use this feature.",
        );
    }
};

/**
 * Retrieves paginated 1-to-1 direct chat history between two members.
 * Marks incoming unread messages as read automatically upon opening history.
 */
export const getDirectChatHistoryUseCase = async (
    organizationId: string,
    userId: string,
    recipientId: string,
    page: number = 1,
    limit: number = 10,
) => {
    await verifyProPlan(organizationId);

    await markDirectMessagesAsRead(organizationId, recipientId, userId);

    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
        getDirectMessagesBetweenUsers(
            organizationId,
            userId,
            recipientId,
            limit,
            offset,
        ),
        countDirectMessagesBetweenUsers(organizationId, userId, recipientId),
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
 * Marks all unread direct messages sent by a specified member to the current user as read.
 */
export const markDirectChatAsReadUseCase = async (
    organizationId: string,
    userId: string,
    senderId: string,
) => {
    await verifyProPlan(organizationId);
    await markDirectMessagesAsRead(organizationId, senderId, userId);
    return { success: true };
};

/**
 * Uploads a media attachment for a 1-to-1 direct chat to S3.
 */
export const uploadDirectChatAttachmentUseCase = async (
    organizationId: string,
    userId: string,
    file: Express.Multer.File,
) => {
    await verifyProPlan(organizationId);

    if (!file) {
        throw badRequestError("No file uploaded");
    }

    const fileUrl = await uploadToS3(file, "chat");

    return {
        fileUrl,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
    };
};

/**
 * Fetches deep organization hierarchy including projects, phases, sprints, and work items.
 */
export const getDeepOrganizationContext = async (organizationId: string) => {
    const result = await getDeepOrganizationContextRepo(organizationId);
    if (!result) {
        throw notFoundError("Organization not found");
    }
    return result;
};
