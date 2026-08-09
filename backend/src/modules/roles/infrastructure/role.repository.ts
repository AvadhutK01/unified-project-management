import { db } from "../../../infrastructure/database/client.js";
import {
    roles,
    rolePermissions,
    permissions,
    organizationMembers,
} from "../../../infrastructure/database/schema/index.js";
import { eq, count, and, or, ilike, ne, desc, sql } from "drizzle-orm";

/**
 * Creates a new role in the database.
 * @param data Role input data including organization ID.
 * @returns The newly created role record.
 */
export const createRole = async (data: {
    name: string;
    organizationId: string;
    description?: string;
    isActive?: boolean;
}) => {
    const [role] = await db
        .insert(roles)
        .values({
            name: data.name,
            organizationId: data.organizationId,
            description: data.description ?? null,
            isActive: data.isActive ?? true,
        })
        .returning();
    return role;
};

/**
 * Finds a role by its primary key.
 * @param id The role UUID.
 * @param organizationId The organization UUID.
 * @returns The role record or null.
 */
export const findRoleById = async (id: string, organizationId: string) => {
    const results = await db
        .select()
        .from(roles)
        .where(and(eq(roles.id, id), eq(roles.organizationId, organizationId)))
        .limit(1);
    return results[0] ?? null;
};

/**
 * Finds a role by its name within an organization.
 * @param name The role name.
 * @param organizationId The organization UUID.
 * @returns The role record or null.
 */
export const findRoleByName = async (name: string, organizationId: string) => {
    const results = await db
        .select()
        .from(roles)
        .where(
            and(eq(roles.name, name), eq(roles.organizationId, organizationId)),
        )
        .limit(1);
    return results[0] ?? null;
};

/**
 * Retrieves all roles with pagination and optional search filter.
 * @param page The page number.
 * @param limit The limit number.
 * @param search Optional search keyword.
 * @param organizationId The organization UUID.
 * @returns Array of role records.
 */
export const findAllRoles = async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    organizationId?: string,
) => {
    const filters = [];
    if (organizationId) {
        filters.push(eq(roles.organizationId, organizationId));
    }
    filters.push(ne(roles.name, "Owner"));
    if (search) {
        filters.push(
            or(
                ilike(roles.name, `%${search}%`),
                ilike(roles.description, `%${search}%`),
            ),
        );
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const results = await db
        .select({
            id: roles.id,
            name: roles.name,
            description: roles.description,
            organizationId: roles.organizationId,
            isActive: roles.isActive,
            createdAt: roles.createdAt,
            updatedAt: roles.updatedAt,
            memberCount: sql<number>`cast(count(${organizationMembers.id}) as int)`,
        })
        .from(roles)
        .leftJoin(organizationMembers, eq(organizationMembers.roleId, roles.id))
        .where(whereClause)
        .groupBy(roles.id)
        .orderBy(desc(roles.updatedAt))
        .limit(limit)
        .offset((page - 1) * limit);

    return results;
};

/**
 * Counts all roles, optionally filtered by search keyword.
 * @param search Optional search keyword.
 * @param organizationId The organization UUID.
 * @returns The count of roles.
 */
export const countAllRoles = async (
    search?: string,
    organizationId?: string,
) => {
    const filters = [];
    if (organizationId) {
        filters.push(eq(roles.organizationId, organizationId));
    }
    filters.push(ne(roles.name, "Owner"));
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
        const results = await query.where(and(...filters));
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
 * @param organizationId The organization UUID.
 * @returns The updated role record.
 */
export const updateRole = async (
    id: string,
    data: {
        name?: string;
        description?: string | null;
        isActive?: boolean;
    },
    organizationId: string,
) => {
    const updates: any = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.isActive !== undefined) updates.isActive = data.isActive;
    updates.updatedAt = new Date();

    const [updated] = await db
        .update(roles)
        .set(updates)
        .where(and(eq(roles.id, id), eq(roles.organizationId, organizationId)))
        .returning();
    return updated;
};

/**
 * Deletes a role from the database.
 * @param id The role UUID.
 * @param organizationId The organization UUID.
 * @returns The deleted role record.
 */
export const deleteRole = async (id: string, organizationId: string) => {
    await detachAllPermissionsFromRole(id);

    const [deleted] = await db
        .delete(roles)
        .where(and(eq(roles.id, id), eq(roles.organizationId, organizationId)))
        .returning();
    return deleted;
};

/**
 * Finds a role by its primary key only.
 * @param id The role UUID.
 * @returns The role record or null.
 */
export const findRoleByIdRaw = async (id: string) => {
    const results = await db
        .select()
        .from(roles)
        .where(eq(roles.id, id))
        .limit(1);
    return results[0] ?? null;
};

/**
 * Counts active members assigned to a specific role.
 */
export const countMembersByRoleId = async (roleId: string): Promise<number> => {
    const result = await db
        .select({ value: count() })
        .from(organizationMembers)
        .where(eq(organizationMembers.roleId, roleId));
    return Number(result[0]?.value ?? 0);
};

/**
 * Deletes all roles (and their permissions) belonging to an organization.
 * Used as part of cascaded organization deletion.
 */
export const deleteRolesByOrganizationId = async (
    organizationId: string,
): Promise<void> => {
    const orgRoles = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.organizationId, organizationId));

    for (const role of orgRoles) {
        await detachAllPermissionsFromRole(role.id);
    }

    await db.delete(roles).where(eq(roles.organizationId, organizationId));
};
