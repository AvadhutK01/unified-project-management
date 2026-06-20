import {
    createOrganization as createOrgRepo,
    findOrganizationById,
    findOrganizationBySlug,
    findOrganizationByName,
    findOrganizationsByOwner,
    countOrganizationsByOwner,
    findAllOrganizations,
    countAllOrganizations,
    updateOrganization as updateOrgRepo,
    deleteOrganization as deleteOrgRepo,
} from "../infrastructure/organization.repository.js";
import {
    badRequestError,
    notFoundError,
    forbiddenError,
    internalServerError,
} from "../../../shared/errors/app-error.js";
import { createRole } from "../../roles/infrastructure/role.repository.js";
import { createMember } from "../infrastructure/organization-member.repository.js";

/**
 * Creates a new organization for the authenticated user.
 * @param data Organization input data.
 * @param ownerId The authenticated user's ID.
 * @throws AppError if name or slug already exists.
 * @returns The created organization record.
 */
export const createOrganization = async (
    data: {
        name: string;
        slug: string;
        logoUrl?: string;
        websiteUrl?: string;
        description?: string;
        status?: string;
    },
    ownerId: string,
) => {
    const existingBySlug = await findOrganizationBySlug(data.slug);
    if (existingBySlug) {
        throw badRequestError("Slug already exists");
    }

    const existingByName = await findOrganizationByName(data.name);
    if (existingByName) {
        throw badRequestError("Name already exists");
    }

    const org = await createOrgRepo({ ...data, ownerUserId: ownerId });
    if (!org) {
        throw internalServerError("Failed to create organization");
    }

    const ownerRole = await createRole({
        name: "Owner",
        organizationId: org.id,
        description: "Organization Owner",
        isActive: true,
    });

    if (!ownerRole) {
        throw internalServerError("Failed to create owner role");
    }

    await createMember({
        organizationId: org.id,
        memberId: ownerId,
        roleId: ownerRole.id,
        status: "active",
    });

    return org;
};

/**
 * Retrieves a single organization by its ID.
 * @param id The organization UUID.
 * @throws AppError if not found.
 * @returns The organization record.
 */
export const getOrganizationById = async (id: string) => {
    const org = await findOrganizationById(id);
    if (!org) {
        throw notFoundError("Organization not found");
    }
    return org;
};

/**
 * Retrieves all organizations belonging to the authenticated user with pagination and optional search filter.
 * @param ownerId The authenticated user's ID.
 * @param page The page number.
 * @param limit The limit number.
 * @param search Optional search keyword.
 * @returns An object containing the data and pagination details.
 */
export const getMyOrganizations = async (
    ownerId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
) => {
    const [data, total] = await Promise.all([
        findOrganizationsByOwner(ownerId, page, limit, search),
        countOrganizationsByOwner(ownerId, search),
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
 * Retrieves all organizations in the system with pagination, optional owner user filter, and optional search filter.
 * @param page The page number.
 * @param limit The limit number.
 * @param ownerUserId Optional owner user UUID to restrict organizations.
 * @param search Optional search keyword.
 * @returns An object containing the data and pagination details.
 */
export const getAllOrganizations = async (
    page: number = 1,
    limit: number = 10,
    ownerUserId?: string,
    search?: string,
) => {
    const [data, total] = await Promise.all([
        findAllOrganizations(page, limit, ownerUserId, search),
        countAllOrganizations(ownerUserId, search),
    ]);

    return {
        organizations: data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Updates an organization. Only the owner can perform this action.
 * @param id The organization UUID.
 * @param data Partial fields to update.
 * @param requesterId The authenticated user's ID.
 * @throws AppError if not found, not authorized, or slug/name conflict.
 * @returns The updated organization record.
 */
export const updateOrganization = async (
    id: string,
    data: {
        name?: string;
        slug?: string;
        logoUrl?: string | null;
        websiteUrl?: string | null;
        description?: string | null;
        status?: string;
    },
    requesterId: string,
) => {
    const org = await findOrganizationById(id);
    if (!org) {
        throw notFoundError("Organization not found");
    }

    if (org.ownerUserId !== requesterId) {
        throw forbiddenError(
            "You are not authorized to update this organization",
        );
    }

    if (data.slug && data.slug !== org.slug) {
        const existingBySlug = await findOrganizationBySlug(data.slug);
        if (existingBySlug) {
            throw badRequestError("Slug already exists");
        }
    }

    if (data.name && data.name !== org.name) {
        const existingByName = await findOrganizationByName(data.name);
        if (existingByName) {
            throw badRequestError("Name already exists");
        }
    }

    const updated = await updateOrgRepo(id, data);
    if (!updated) {
        throw internalServerError("Failed to update organization");
    }
    return updated;
};

/**
 * Deletes an organization. Only the owner can perform this action.
 * @param id The organization UUID.
 * @param requesterId The authenticated user's ID.
 * @throws AppError if not found or not authorized.
 * @returns The deleted organization record.
 */
export const deleteOrganization = async (id: string, requesterId: string) => {
    const org = await findOrganizationById(id);
    if (!org) {
        throw notFoundError("Organization not found");
    }

    if (org.ownerUserId !== requesterId) {
        throw forbiddenError(
            "You are not authorized to delete this organization",
        );
    }

    const deleted = await deleteOrgRepo(id);
    if (!deleted) {
        throw internalServerError("Failed to delete organization");
    }
    return deleted;
};
