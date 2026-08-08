import {
    getDirectMessagesBetweenUsers,
    countDirectMessagesBetweenUsers,
    markDirectMessagesAsRead,
} from "../infrastructure/chat.repository.js";

import { isOrganizationOnPlan } from "../../../shared/middleware/require-premium.js";
import { uploadToS3 } from "../../../shared/utils/s3.js";
import {
    forbiddenError,
    badRequestError,
    notFoundError,
} from "../../../shared/errors/app-error.js";
import { findOrganizationById } from "../../organizations/infrastructure/organization.repository.js";
import { db } from "../../../infrastructure/database/client.js";
import {
    projects,
    phases,
    sprints,
    workitems,
} from "../../../infrastructure/database/schema/index.js";
import { eq } from "drizzle-orm";

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
    const org = await findOrganizationById(organizationId);
    if (!org) {
        throw notFoundError("Organization not found");
    }

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
