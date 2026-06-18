import {
    createPhase as createPhaseRepo,
    findPhaseById,
    findAllPhases,
    countAllPhases,
    updatePhase as updatePhaseRepo,
    softDeletePhase,
} from "../infrastructure/phase.repository.js";
import {
    badRequestError,
    notFoundError,
    internalServerError,
} from "../../../shared/errors/app-error.js";
import { verifyProjectAccess } from "../../projects/application/project.use-cases.js";
import { findProjectById } from "../../projects/infrastructure/project.repository.js";

/**
 * Creates a new phase for a project.
 * @param data Phase fields plus organizationId and userId for access check.
 * @returns The newly created phase.
 */
export const createPhase = async (data: {
    projectId: string;
    organizationId: string;
    userId: string;
    name: string;
    description?: string;
    type?: string;
    status?: "notstarted" | "started" | "onhold" | "completed";
    startDate?: string;
    endDate?: string;
}) => {
    const project = await findProjectById(data.projectId, data.organizationId);
    if (!project) {
        throw notFoundError("Project not found");
    }

    await verifyProjectAccess(data.projectId, data.organizationId, data.userId);

    if (data.startDate && data.endDate && data.startDate > data.endDate) {
        throw badRequestError("Start date must be before or equal to end date");
    }

    const phase = await createPhaseRepo({
        projectId: data.projectId,
        name: data.name,
        ...(data.description !== undefined && {
            description: data.description,
        }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
    });

    if (!phase) {
        throw internalServerError("Failed to create phase");
    }

    return phase;
};

/**
 * Retrieves a single phase by ID.
 * @param id The phase UUID.
 * @param organizationId The organization UUID.
 * @param userId The authenticated user's ID.
 * @returns The phase record.
 */
export const getPhaseById = async (
    id: string,
    organizationId: string,
    userId: string,
) => {
    const phase = await findPhaseById(id);
    if (!phase) {
        throw notFoundError("Phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    return phase;
};

/**
 * Retrieves all phases for a project.
 * @param projectId The project UUID.
 * @param organizationId The organization UUID.
 * @param userId The authenticated user's ID.
 * @param page Page number.
 * @param limit Items per page.
 * @param search Optional search term.
 * @returns Paginated phase list.
 */
export const getAllPhases = async (
    projectId: string,
    organizationId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
) => {
    const project = await findProjectById(projectId, organizationId);
    if (!project) {
        throw notFoundError("Project not found");
    }

    await verifyProjectAccess(projectId, organizationId, userId);

    const [data, total] = await Promise.all([
        findAllPhases(projectId, page, limit, search),
        countAllPhases(projectId, search),
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
 * Updates a phase.
 * @param id The phase UUID.
 * @param organizationId The organization UUID.
 * @param userId The authenticated user's ID.
 * @param data Fields to update.
 * @returns The updated phase.
 */
export const updatePhase = async (
    id: string,
    organizationId: string,
    userId: string,
    data: {
        name?: string;
        description?: string | null;
        type?: string | null;
        status?: "notstarted" | "started" | "onhold" | "completed";
        startDate?: string | null;
        endDate?: string | null;
    },
) => {
    const phase = await findPhaseById(id);
    if (!phase) {
        throw notFoundError("Phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    const resolvedStart = data.startDate ?? phase.startDate;
    const resolvedEnd = data.endDate ?? phase.endDate;
    if (resolvedStart && resolvedEnd && resolvedStart > resolvedEnd) {
        throw badRequestError("Start date must be before or equal to end date");
    }

    const updated = await updatePhaseRepo(id, data);
    if (!updated) {
        throw internalServerError("Failed to update phase");
    }

    return updated;
};

/**
 * Soft-deletes a phase.
 * @param id The phase UUID.
 * @param organizationId The organization UUID.
 * @param userId The authenticated user's ID.
 * @returns The deleted phase record.
 */
export const deletePhase = async (
    id: string,
    organizationId: string,
    userId: string,
) => {
    const phase = await findPhaseById(id);
    if (!phase) {
        throw notFoundError("Phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    const deleted = await softDeletePhase(id);
    if (!deleted) {
        throw internalServerError("Failed to delete phase");
    }

    return deleted;
};
