import {
    createProjectWithMembersTx,
    findProjectById,
    findAllProjects,
    countAllProjects,
    updateProject as updateProjectRepo,
    softDeleteProject,
    addProjectMember as addProjectMemberRepo,
    findProjectMember,
    findMembersByProjectId,
    removeProjectMember as removeProjectMemberRepo,
    findProjectByTitle,
} from "../infrastructure/project.repository.js";
import {
    badRequestError,
    notFoundError,
    forbiddenError,
    internalServerError,
} from "../../../shared/errors/app-error.js";
import { findOrganizationById } from "../../organizations/infrastructure/organization.repository.js";
import { findMemberByOrgAndUserId } from "../../organizations/infrastructure/organization-member.repository.js";
import { validateProjectTransition } from "../../../shared/utils/status-transitions.js";

/**
 * Verifies if a user has access to a project (is org owner or mapped project member).
 * @param projectId The project UUID.
 * @param organizationId The organization UUID.
 * @param userId The user UUID to verify.
 * @throws AppError if not authorized.
 */
export const verifyProjectAccess = async (
    projectId: string,
    organizationId: string,
    userId: string,
) => {
    const org = await findOrganizationById(organizationId);
    if (!org) {
        throw forbiddenError("Organization not found");
    }

    if (org.ownerUserId === userId) {
        return;
    }

    const orgMember = await findMemberByOrgAndUserId(organizationId, userId);
    if (
        !orgMember ||
        (orgMember.status !== "active" && orgMember.status !== "onleave")
    ) {
        throw forbiddenError(
            "You are not an active member of this organization",
        );
    }

    const isMapped = await findProjectMember(projectId, orgMember.id);
    if (!isMapped) {
        throw forbiddenError("You do not have access to this project");
    }
};

/**
 * Creates a new project within an organization.
 * @param data Project fields plus organizationId.
 * @throws AppError if title is not unique or startDate > endDate.
 * @returns The newly created project.
 */
export const createProject = async (data: {
    organizationId: string;
    userId?: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    clientName?: string;
    logoUrl?: string;
    status?: "notstarted" | "started" | "onhold" | "completed";
    orgMemberIds?: string[];
}) => {
    const existingTitle = await findProjectByTitle(
        data.title,
        data.organizationId,
    );
    if (existingTitle) {
        throw badRequestError(
            "Project with this title already exists in this organization",
        );
    }

    if (data.startDate && data.endDate && data.startDate > data.endDate) {
        throw badRequestError("Start date must be before or equal to end date");
    }

    const orgMemberIdsToMap = new Set<string>(data.orgMemberIds || []);

    const org = await findOrganizationById(data.organizationId);
    if (org) {
        const ownerOrgMember = await findMemberByOrgAndUserId(
            data.organizationId,
            org.ownerUserId,
        );
        if (ownerOrgMember) {
            orgMemberIdsToMap.add(ownerOrgMember.id);
        }
        if (data.userId && data.userId !== org.ownerUserId) {
            const creatorOrgMember = await findMemberByOrgAndUserId(
                data.organizationId,
                data.userId,
            );
            if (creatorOrgMember) {
                orgMemberIdsToMap.add(creatorOrgMember.id);
            }
        }
    }

    const project = await createProjectWithMembersTx(
        {
            organizationId: data.organizationId,
            title: data.title,
            ...(data.description !== undefined && {
                description: data.description,
            }),
            ...(data.startDate !== undefined && { startDate: data.startDate }),
            ...(data.endDate !== undefined && { endDate: data.endDate }),
            ...(data.clientName !== undefined && {
                clientName: data.clientName,
            }),
            ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
            ...(data.status !== undefined && { status: data.status }),
        },
        Array.from(orgMemberIdsToMap),
    );

    if (!project) {
        throw internalServerError("Failed to create project");
    }

    return project;
};

/**
 * Retrieves a single project by ID.
 * @param id The project UUID.
 * @param organizationId The organization UUID.
 * @param userId The authenticated user's ID.
 * @throws AppError if not found.
 * @returns The project record with its members.
 */
export const getProjectById = async (
    id: string,
    organizationId: string,
    userId: string,
) => {
    const project = await findProjectById(id, organizationId);
    if (!project) {
        throw notFoundError("Project not found");
    }

    await verifyProjectAccess(id, organizationId, userId);

    const members = await findMembersByProjectId(id);
    return { ...project, members };
};

/**
 * Retrieves all projects for an organization with pagination.
 * @param organizationId The organization UUID.
 * @param page Page number.
 * @param limit Items per page.
 * @param search Optional search term.
 * @returns Paginated project list.
 */
export const getAllProjects = async (
    organizationId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    userId?: string,
) => {
    let filterUserId: string | undefined = undefined;
    if (userId) {
        const org = await findOrganizationById(organizationId);
        if (org && org.ownerUserId !== userId) {
            filterUserId = userId;
        }
    }

    const [data, total] = await Promise.all([
        findAllProjects(organizationId, page, limit, search, filterUserId),
        countAllProjects(organizationId, search, filterUserId),
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
 * Updates a project.
 * @param id The project UUID.
 * @param organizationId The organization UUID.
 * @param data Fields to update.
 * @param userId The authenticated user's ID.
 * @throws AppError if not found, title not unique or date validation fails.
 * @returns The updated project.
 */
export const updateProject = async (
    id: string,
    organizationId: string,
    data: {
        title?: string;
        description?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        clientName?: string | null;
        logoUrl?: string | null;
        status?: "notstarted" | "started" | "onhold" | "completed";
        orgMemberIds?: string[];
    },
    userId: string,
) => {
    const project = await findProjectById(id, organizationId);
    if (!project) {
        throw notFoundError("Project not found");
    }

    await verifyProjectAccess(id, organizationId, userId);

    if (data.title && data.title !== project.title) {
        const existingTitle = await findProjectByTitle(
            data.title,
            organizationId,
        );
        if (existingTitle) {
            throw badRequestError(
                "Project with this title already exists in this organization",
            );
        }
    }

    const resolvedStart = data.startDate ?? project.startDate;
    const resolvedEnd = data.endDate ?? project.endDate;
    if (resolvedStart && resolvedEnd && resolvedStart > resolvedEnd) {
        throw badRequestError("Start date must be before or equal to end date");
    }

    if (data.status && data.status !== project.status) {
        validateProjectTransition(project.status as string, data.status);
    }

    const updated = await updateProjectRepo(id, organizationId, {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
            description: data.description,
        }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.clientName !== undefined && { clientName: data.clientName }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.status !== undefined && { status: data.status }),
    });
    if (!updated) {
        throw internalServerError("Failed to update project");
    }

    if (data.orgMemberIds !== undefined) {
        const existingMembers = await findMembersByProjectId(id);
        const existingOrgMemberIds = existingMembers.map(
            (m) => m.organizationMemberId,
        );

        let ownerOrgMemberId: string | undefined = undefined;
        const org = await findOrganizationById(organizationId);
        if (org) {
            const ownerOrgMember = await findMemberByOrgAndUserId(
                organizationId,
                org.ownerUserId,
            );
            if (ownerOrgMember) {
                ownerOrgMemberId = ownerOrgMember.id;
            }
        }

        const toAdd = data.orgMemberIds.filter(
            (mId) => !existingOrgMemberIds.includes(mId),
        );
        const toRemove = existingOrgMemberIds.filter(
            (mId) =>
                !data.orgMemberIds!.includes(mId) && mId !== ownerOrgMemberId,
        );

        for (const orgMemberId of toAdd) {
            await addProjectMemberRepo(id, orgMemberId);
        }

        for (const orgMemberId of toRemove) {
            await removeProjectMemberRepo(id, orgMemberId);
        }
    }

    return updated;
};

/**
 * Soft-deletes a project.
 * @param id The project UUID.
 * @param organizationId The organization UUID.
 * @param userId The authenticated user's ID.
 * @throws AppError if not found.
 * @returns The deleted project record.
 */
export const deleteProject = async (
    id: string,
    organizationId: string,
    userId: string,
) => {
    const project = await findProjectById(id, organizationId);
    if (!project) {
        throw notFoundError("Project not found");
    }

    await verifyProjectAccess(id, organizationId, userId);

    const deleted = await softDeleteProject(id, organizationId);
    if (!deleted) {
        throw internalServerError("Failed to delete project");
    }

    return deleted;
};

/**
 * Adds an organization member to a project.
 * @param projectId The project UUID.
 * @param organizationId The organization UUID.
 * @param orgMemberId The organization member UUID to add.
 * @param userId The authenticated user's ID.
 * @throws AppError if project not found or member already mapped.
 * @returns The new project member record.
 */
export const addProjectMember = async (
    projectId: string,
    organizationId: string,
    orgMemberId: string,
    userId: string,
) => {
    const project = await findProjectById(projectId, organizationId);
    if (!project) {
        throw notFoundError("Project not found");
    }

    await verifyProjectAccess(projectId, organizationId, userId);

    const existing = await findProjectMember(projectId, orgMemberId);
    if (existing) {
        throw badRequestError("Member is already a member of this project");
    }

    const member = await addProjectMemberRepo(projectId, orgMemberId);
    if (!member) {
        throw internalServerError("Failed to add project member");
    }

    return member;
};

/**
 * Removes an organization member from a project.
 * @param projectId The project UUID.
 * @param organizationId The organization UUID.
 * @param orgMemberId The organization member UUID to remove.
 * @param userId The authenticated user's ID.
 * @throws AppError if project not found or member is not mapped.
 * @returns The removed project member record.
 */
export const removeProjectMember = async (
    projectId: string,
    organizationId: string,
    orgMemberId: string,
    userId: string,
) => {
    const project = await findProjectById(projectId, organizationId);
    if (!project) {
        throw notFoundError("Project not found");
    }

    await verifyProjectAccess(projectId, organizationId, userId);

    const existing = await findProjectMember(projectId, orgMemberId);
    if (!existing) {
        throw notFoundError("Member is not a member of this project");
    }

    const removed = await removeProjectMemberRepo(projectId, orgMemberId);
    if (!removed) {
        throw internalServerError("Failed to remove project member");
    }

    return removed;
};

/**
 * Lists all members of a project.
 * @param projectId The project UUID.
 * @param organizationId The organization UUID.
 * @param userId The authenticated user's ID.
 * @throws AppError if project not found.
 * @returns Array of project member records.
 */
export const getProjectMembers = async (
    projectId: string,
    organizationId: string,
    userId: string,
) => {
    const project = await findProjectById(projectId, organizationId);
    if (!project) {
        throw notFoundError("Project not found");
    }

    await verifyProjectAccess(projectId, organizationId, userId);

    return findMembersByProjectId(projectId);
};
