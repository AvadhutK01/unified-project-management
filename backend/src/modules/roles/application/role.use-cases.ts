import {
    createRole as createRoleRepo,
    findRoleById,
    findRoleByName,
    findAllRoles,
    countAllRoles,
    updateRole as updateRoleRepo,
    deleteRole as deleteRoleRepo,
    attachPermissionsToRole,
    detachAllPermissionsFromRole,
    findPermissionsByRoleId,
} from "../infrastructure/role.repository.js";
import { findPermissionById } from "../infrastructure/permission.repository.js";
import {
    badRequestError,
    notFoundError,
    internalServerError,
    forbiddenError,
} from "../../../shared/errors/app-error.js";

/**
 * Creates a new role with associated permissions.
 * @param data Role input data including permission IDs and organization ID.
 * @throws AppError if name already exists or permissions are invalid.
 * @returns The created role record with permissions.
 */
export const createRole = async (data: {
    name: string;
    description?: string;
    permissionIds?: string[];
    isActive?: boolean;
    organizationId: string;
}) => {
    const existingRole = await findRoleByName(data.name, data.organizationId);
    if (existingRole) {
        throw badRequestError("Role with this name already exists");
    }

    if (data.permissionIds && data.permissionIds.length > 0) {
        for (const permissionId of data.permissionIds) {
            const permission = await findPermissionById(permissionId);
            if (!permission) {
                throw badRequestError(
                    `Permission with ID ${permissionId} does not exist`,
                );
            }
        }
    }

    const role = await createRoleRepo({
        name: data.name,
        organizationId: data.organizationId,
        ...(data.description && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
    });

    if (!role) {
        throw internalServerError("Failed to create role");
    }

    if (data.permissionIds && data.permissionIds.length > 0) {
        await attachPermissionsToRole(role.id, data.permissionIds);
    }

    const permissions = await findPermissionsByRoleId(role.id);

    return { ...role, permissions };
};

/**
 * Retrieves a single role by its ID with its associated permissions.
 * @param id The role UUID.
 * @param organizationId The organization UUID.
 * @throws AppError if not found.
 * @returns The role record with permissions.
 */
export const getRoleById = async (id: string, organizationId: string) => {
    const role = await findRoleById(id, organizationId);
    if (!role) {
        throw notFoundError("Role not found");
    }

    const permissions = await findPermissionsByRoleId(id);

    return { ...role, permissions };
};

/**
 * Retrieves all roles with pagination and optional search filter.
 * @param page The page number.
 * @param limit The limit number.
 * @param search Optional search keyword.
 * @param organizationId The organization UUID.
 * @returns An object containing the data and pagination details.
 */
export const getAllRoles = async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    organizationId?: string,
) => {
    const [data, total] = await Promise.all([
        findAllRoles(page, limit, search, organizationId),
        countAllRoles(search, organizationId),
    ]);

    const rolesWithPermissions = await Promise.all(
        data.map(async (role) => {
            const permissions = await findPermissionsByRoleId(role.id);
            return { ...role, memberCount: role.memberCount ?? 0, permissions };
        }),
    );

    return {
        data: rolesWithPermissions,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Updates a role and its associated permissions.
 * @param id The role UUID.
 * @param data Partial role data to update including permission IDs.
 * @param organizationId The organization UUID.
 * @throws AppError if role not found or name is not unique.
 * @returns The updated role record with permissions.
 */
export const updateRole = async (
    id: string,
    data: {
        name?: string;
        description?: string | null;
        permissionIds?: string[];
        isActive?: boolean;
    },
    organizationId: string,
) => {
    const role = await findRoleById(id, organizationId);
    if (!role) {
        throw notFoundError("Role not found");
    }

    if (role.name === "Owner") {
        throw forbiddenError("The Owner role cannot be modified.");
    }

    if (data.name && data.name !== role.name) {
        const existingRole = await findRoleByName(data.name, organizationId);
        if (existingRole) {
            throw badRequestError("Role with this name already exists");
        }
    }

    if (data.permissionIds) {
        for (const permissionId of data.permissionIds) {
            const permission = await findPermissionById(permissionId);
            if (!permission) {
                throw badRequestError(
                    `Permission with ID ${permissionId} does not exist`,
                );
            }
        }

        await detachAllPermissionsFromRole(id);
        await attachPermissionsToRole(id, data.permissionIds);
    }

    const updated = await updateRoleRepo(
        id,
        {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && {
                description: data.description,
            }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        organizationId,
    );

    if (!updated) {
        throw internalServerError("Failed to update role");
    }

    const permissions = await findPermissionsByRoleId(id);

    return { ...updated, permissions };
};

/**
 * Deletes a role.
 * @param id The role UUID.
 * @param organizationId The organization UUID.
 * @throws AppError if role not found.
 * @returns The deleted role record.
 */
export const deleteRole = async (id: string, organizationId: string) => {
    const role = await findRoleById(id, organizationId);
    if (!role) {
        throw notFoundError("Role not found");
    }

    if (role.name === "Owner") {
        throw forbiddenError("The Owner role cannot be deleted.");
    }

    const deleted = await deleteRoleRepo(id, organizationId);

    if (!deleted) {
        throw internalServerError("Failed to delete role");
    }

    return deleted;
};
