import {
    createSprint as createSprintRepo,
    findSprintById,
    findAllSprints,
    countAllSprints,
    updateSprint as updateSprintRepo,
    updateSprintStatus as updateSprintStatusRepo,
    softDeleteSprint,
} from "../infrastructure/sprint.repository.js";
import {
    createActivityLog,
    findActivityLogsBySprintId,
    countActivityLogsBySprintId,
} from "../infrastructure/sprint-activity-log.repository.js";
import { findPhaseById } from "../../phases/infrastructure/phase.repository.js";
import {
    badRequestError,
    notFoundError,
    internalServerError,
} from "../../../shared/errors/app-error.js";
import { verifyProjectAccess } from "../../projects/application/project.use-cases.js";

/**
 * Generates automated update description comparing old and new values.
 * @param oldSprint The current sprint state in database.
 * @param data The fields being updated.
 * @returns A descriptive string of changes.
 */
const generateUpdateDescription = (oldSprint: any, data: any): string => {
    const changes: string[] = [];
    if (data.title !== undefined && data.title !== oldSprint.title) {
        changes.push(
            `Updated title from '${oldSprint.title}' to '${data.title}'`,
        );
    }
    if (
        data.description !== undefined &&
        data.description !== oldSprint.description
    ) {
        const oldVal = oldSprint.description
            ? `'${oldSprint.description}'`
            : "empty";
        const newVal = data.description ? `'${data.description}'` : "empty";
        changes.push(`Updated description from ${oldVal} to ${newVal}`);
    }
    if (
        data.startDate !== undefined &&
        data.startDate !== oldSprint.startDate
    ) {
        const oldVal = oldSprint.startDate
            ? `'${oldSprint.startDate}'`
            : "empty";
        const newVal = data.startDate ? `'${data.startDate}'` : "empty";
        changes.push(`Updated start date from ${oldVal} to ${newVal}`);
    }
    if (data.endDate !== undefined && data.endDate !== oldSprint.endDate) {
        const oldVal = oldSprint.endDate ? `'${oldSprint.endDate}'` : "empty";
        const newVal = data.endDate ? `'${data.endDate}'` : "empty";
        changes.push(`Updated end date from ${oldVal} to ${newVal}`);
    }
    if (data.sequence !== undefined && data.sequence !== oldSprint.sequence) {
        const oldVal =
            oldSprint.sequence !== null ? oldSprint.sequence : "empty";
        const newVal = data.sequence !== null ? data.sequence : "empty";
        changes.push(`Updated sequence from ${oldVal} to ${newVal}`);
    }
    if (
        data.acceptanceCriteria !== undefined &&
        data.acceptanceCriteria !== oldSprint.acceptanceCriteria
    ) {
        const oldVal = oldSprint.acceptanceCriteria
            ? `'${oldSprint.acceptanceCriteria}'`
            : "empty";
        const newVal = data.acceptanceCriteria
            ? `'${data.acceptanceCriteria}'`
            : "empty";
        changes.push(`Updated acceptance criteria from ${oldVal} to ${newVal}`);
    }
    if (data.status !== undefined && data.status !== oldSprint.status) {
        changes.push(
            `Updated status from '${oldSprint.status}' to '${data.status}'`,
        );
    }
    return changes.length > 0 ? changes.join(". ") + "." : "No changes made.";
};

/**
 * Creates a new sprint for a phase.
 * @param data Sprint fields plus organizationId and userId for access check.
 * @returns The newly created sprint.
 */
export const createSprint = async (data: {
    title: string;
    description?: string;
    phaseId: string;
    startDate?: string;
    endDate?: string;
    sequence?: number;
    acceptanceCriteria?: string;
    status?: "new" | "active" | "onhold" | "removed" | "closed";
    organizationId: string;
    userId: string;
}) => {
    const phase = await findPhaseById(data.phaseId);
    if (!phase) {
        throw notFoundError("Phase not found");
    }

    await verifyProjectAccess(
        phase.projectId,
        data.organizationId,
        data.userId,
    );

    if (data.startDate && data.endDate && data.startDate > data.endDate) {
        throw badRequestError("Start date must be before or equal to end date");
    }

    const sprint = await createSprintRepo({
        title: data.title,
        phaseId: data.phaseId,
        ...(data.description !== undefined && {
            description: data.description,
        }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.sequence !== undefined && { sequence: data.sequence }),
        ...(data.acceptanceCriteria !== undefined && {
            acceptanceCriteria: data.acceptanceCriteria,
        }),
        ...(data.status !== undefined && { status: data.status }),
    });

    if (!sprint) {
        throw internalServerError("Failed to create sprint");
    }

    await createActivityLog({
        sprintId: sprint.id,
        userId: data.userId,
        action: "created",
        description: "Sprint created",
    });

    return sprint;
};

/**
 * Retrieves a single sprint by ID.
 * @param id The sprint UUID.
 * @param organizationId The organization UUID.
 * @param userId The authenticated user's ID.
 * @returns The sprint record.
 */
export const getSprintById = async (
    id: string,
    organizationId: string,
    userId: string,
) => {
    const sprint = await findSprintById(id);
    if (!sprint) {
        throw notFoundError("Sprint not found");
    }

    const phase = await findPhaseById(sprint.phaseId);
    if (!phase) {
        throw notFoundError("Parent phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    return sprint;
};

/**
 * Retrieves all sprints for a phase with pagination.
 * @param phaseId The phase UUID.
 * @param organizationId The organization UUID.
 * @param userId The authenticated user's ID.
 * @param page Page number.
 * @param limit Items per page.
 * @param search Optional search term.
 * @returns Paginated sprint list.
 */
export const getAllSprints = async (
    phaseId: string,
    organizationId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
) => {
    const phase = await findPhaseById(phaseId);
    if (!phase) {
        throw notFoundError("Phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    const [data, total] = await Promise.all([
        findAllSprints(phaseId, page, limit, search),
        countAllSprints(phaseId, search),
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
 * Updates a sprint.
 * @param id The sprint UUID.
 * @param organizationId The organization UUID.
 * @param userId The authenticated user's ID.
 * @param data Fields to update.
 * @returns The updated sprint.
 */
export const updateSprint = async (
    id: string,
    organizationId: string,
    userId: string,
    data: {
        title?: string;
        description?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        sequence?: number | null;
        acceptanceCriteria?: string | null;
        status?: "new" | "active" | "onhold" | "removed" | "closed";
    },
) => {
    const sprint = await findSprintById(id);
    if (!sprint) {
        throw notFoundError("Sprint not found");
    }

    const phase = await findPhaseById(sprint.phaseId);
    if (!phase) {
        throw notFoundError("Parent phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    const resolvedStart = data.startDate ?? sprint.startDate;
    const resolvedEnd = data.endDate ?? sprint.endDate;
    if (resolvedStart && resolvedEnd && resolvedStart > resolvedEnd) {
        throw badRequestError("Start date must be before or equal to end date");
    }

    const description = generateUpdateDescription(sprint, data);

    const updated = await updateSprintRepo(id, data);
    if (!updated) {
        throw internalServerError("Failed to update sprint");
    }

    await createActivityLog({
        sprintId: id,
        userId,
        action: "updated",
        description,
    });

    return updated;
};

/**
 * Updates status of a sprint.
 * @param id The sprint UUID.
 * @param organizationId The organization UUID.
 * @param userId The authenticated user's ID.
 * @param status The new status.
 * @returns The updated sprint.
 */
export const updateSprintStatus = async (
    id: string,
    organizationId: string,
    userId: string,
    status: "new" | "active" | "onhold" | "removed" | "closed",
) => {
    const sprint = await findSprintById(id);
    if (!sprint) {
        throw notFoundError("Sprint not found");
    }

    const phase = await findPhaseById(sprint.phaseId);
    if (!phase) {
        throw notFoundError("Parent phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    const oldStatus = sprint.status;

    const updated = await updateSprintStatusRepo(id, status);
    if (!updated) {
        throw internalServerError("Failed to update sprint status");
    }

    await createActivityLog({
        sprintId: id,
        userId,
        action: "status_updated",
        description: `Status updated from '${oldStatus}' to '${status}'`,
    });

    return updated;
};

/**
 * Soft-deletes a sprint.
 * @param id The sprint UUID.
 * @param organizationId The organization UUID.
 * @param userId The authenticated user's ID.
 * @returns The deleted sprint record.
 */
export const deleteSprint = async (
    id: string,
    organizationId: string,
    userId: string,
) => {
    const sprint = await findSprintById(id);
    if (!sprint) {
        throw notFoundError("Sprint not found");
    }

    const phase = await findPhaseById(sprint.phaseId);
    if (!phase) {
        throw notFoundError("Parent phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    const deleted = await softDeleteSprint(id);
    if (!deleted) {
        throw internalServerError("Failed to delete sprint");
    }

    await createActivityLog({
        sprintId: id,
        userId,
        action: "deleted",
        description: "Sprint soft-deleted",
    });

    return deleted;
};

/**
 * Retrieves paginated activity logs for a sprint.
 * @param sprintId The sprint UUID.
 * @param organizationId The organization UUID.
 * @param userId The authenticated user's ID.
 * @param page Page number.
 * @param limit Items per page.
 * @returns Paginated list of activity logs.
 */
export const getSprintActivities = async (
    sprintId: string,
    organizationId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
) => {
    const sprint = await findSprintById(sprintId);
    if (!sprint) {
        throw notFoundError("Sprint not found");
    }

    const phase = await findPhaseById(sprint.phaseId);
    if (!phase) {
        throw notFoundError("Parent phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    const [data, total] = await Promise.all([
        findActivityLogsBySprintId(sprintId, page, limit),
        countActivityLogsBySprintId(sprintId),
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
