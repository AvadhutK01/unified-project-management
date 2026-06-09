import { db } from "../../../infrastructure/database/client.js";
import {
    roles,
    rolePermissions,
    permissions,
} from "../../../infrastructure/database/schema/index.js";
import { eq, count, and, or, ilike } from "drizzle-orm";

/**
 * Creates a new role in the database.
 * @param data Role input data.
 * @returns The newly created role record.
 */
export const createRole = async (data: {
    name: string;
    description?: string;
    isActive?: boolean;
}) => {
    const [role] = await db
        .insert(roles)
        .values({
            name: data.name,
            description: data.description ?? null,
            isActive: data.isActive ?? true,
        })
        .returning();
    return role;
};

/**
 * Finds a role by its primary key.
 * @param id The role UUID.
 * @returns The role record or null.
 */
export const findRoleById = async (id: string) => {
    const results = await db
        .select()
        .from(roles)
        .where(eq(roles.id, id))
        .limit(1);
    return results[0] ?? null;
};

/**
 * Finds a role by its name.
 * @param name The role name.
 * @returns The role record or null.
 */
export const findRoleByName = async (name: string) => {
    const results = await db
        .select()
        .from(roles)
        .where(eq(roles.name, name))
        .limit(1);
    return results[0] ?? null;
};

/**
 * Retrieves all roles with pagination and optional search filter.
 * @param page The page number.
 * @param limit The limit number.
 * @param search Optional search keyword.
 * @returns Array of role records.
 */
export const findAllRoles = async (
    page: number = 1,
    limit: number = 10,
    search?: string,
) => {
    const filters = [];
    if (search) {
        filters.push(
            or(
                ilike(roles.name, `%${search}%`),
                ilike(roles.description, `%${search}%`),
            ),
        );
    }

    const query = db.select().from(roles);
    if (filters.length > 0) {
        return query
            .where(filters[0])
            .limit(limit)
            .offset((page - 1) * limit);
    }
    return query.limit(limit).offset((page - 1) * limit);
};

/**
 * Counts all roles, optionally filtered by search keyword.
 * @param search Optional search keyword.
 * @returns The count of roles.
 */
export const countAllRoles = async (search?: string) => {
    const filters = [];
    if (search) {
        filters.push(
            or(
                ilike(roles.name, `%${search}%`),
                ilike(roles.description, `%${search}%`),
            ),
        );
    }

    const query = db.select({ count: count() }).from(roles);
    if (filters.length > 0) {
        const results = await query.where(filters[0]);
        return results[0]?.count ?? 0;
    }

    const results = await query;
    return results[0]?.count ?? 0;
};

/**
 * Attaches permissions to a role.
 * @param roleId The role UUID.
 * @param permissionIds Array of permission UUIDs.
 */
export const attachPermissionsToRole = async (
    roleId: string,
    permissionIds: string[],
) => {
    if (permissionIds.length === 0) return;

    await db.insert(rolePermissions).values(
        permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
        })),
    );
};

/**
 * Detaches all permissions from a role.
 * @param roleId The role UUID.
 */
export const detachAllPermissionsFromRole = async (roleId: string) => {
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
};

/**
 * Detaches specific permissions from a role.
 * @param roleId The role UUID.
 * @param permissionIds Array of permission UUIDs to remove.
 */
export const detachPermissionsFromRole = async (
    roleId: string,
    permissionIds: string[],
) => {
    if (permissionIds.length === 0) return;

    for (const permissionId of permissionIds) {
        await db
            .delete(rolePermissions)
            .where(
                and(
                    eq(rolePermissions.roleId, roleId),
                    eq(rolePermissions.permissionId, permissionId),
                ),
            );
    }
};

/**
 * Retrieves all permissions for a specific role.
 * @param roleId The role UUID.
 * @returns Array of permission records.
 */
export const findPermissionsByRoleId = async (roleId: string) => {
    return db
        .select({
            id: permissions.id,
            name: permissions.name,
            codename: permissions.codename,
            description: permissions.description,
            isActive: permissions.isActive,
        })
        .from(rolePermissions)
        .innerJoin(
            permissions,
            eq(rolePermissions.permissionId, permissions.id),
        )
        .where(eq(rolePermissions.roleId, roleId));
};

/**
 * Updates a role in the database.
 * @param id The role UUID.
 * @param data Partial role data to update.
 * @returns The updated role record.
 */
export const updateRole = async (
    id: string,
    data: {
        name?: string;
        description?: string | null;
        isActive?: boolean;
    },
) => {
    const updates: any = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.isActive !== undefined) updates.isActive = data.isActive;
    updates.updatedAt = new Date();

    const [updated] = await db
        .update(roles)
        .set(updates)
        .where(eq(roles.id, id))
        .returning();
    return updated;
};

/**
 * Deletes a role from the database.
 * @param id The role UUID.
 * @returns The deleted role record.
 */
export const deleteRole = async (id: string) => {
    await detachAllPermissionsFromRole(id);

    const [deleted] = await db
        .delete(roles)
        .where(eq(roles.id, id))
        .returning();
    return deleted;
};
