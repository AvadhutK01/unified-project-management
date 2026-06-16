import { db } from "../../../infrastructure/database/client.js";
import { permissions } from "../../../infrastructure/database/schema/index.js";
import { eq, count, or, ilike } from "drizzle-orm";

/**
 * Creates a new permission in the database.
 * @param data Permission input data.
 * @returns The newly created permission record.
 */
export const createPermission = async (data: {
    name: string;
    codename: string;
    description?: string;
    isActive?: boolean;
}) => {
    const [permission] = await db
        .insert(permissions)
        .values({
            name: data.name,
            codename: data.codename,
            description: data.description ?? null,
            isActive: data.isActive ?? true,
        })
        .returning();
    return permission;
};

/**
 * Finds a permission by its primary key.
 * @param id The permission UUID.
 * @returns The permission record or null.
 */
export const findPermissionById = async (id: string) => {
    const results = await db
        .select()
        .from(permissions)
        .where(eq(permissions.id, id))
        .limit(1);
    return results[0] ?? null;
};

/**
 * Finds a permission by its codename.
 * @param codename The permission codename.
 * @returns The permission record or null.
 */
export const findPermissionByCodename = async (codename: string) => {
    const results = await db
        .select()
        .from(permissions)
        .where(eq(permissions.codename, codename))
        .limit(1);
    return results[0] ?? null;
};

/**
 * Retrieves all permissions with pagination and optional search filter.
 * @param page The page number.
 * @param limit The limit number.
 * @param search Optional search keyword.
 * @returns Array of permission records.
 */
export const findAllPermissions = async (search?: string) => {
    const filters = [];
    if (search) {
        filters.push(
            or(
                ilike(permissions.name, `%${search}%`),
                ilike(permissions.codename, `%${search}%`),
            ),
        );
    }

    const query = db.select().from(permissions);
    if (filters.length > 0) {
        return query.where(filters[0]);
    }
    return query;
};

/**
 * Counts all permissions, optionally filtered by search keyword.
 * @param search Optional search keyword.
 * @returns The count of permissions.
 */
export const countAllPermissions = async (search?: string) => {
    const filters = [];
    if (search) {
        filters.push(
            or(
                ilike(permissions.name, `%${search}%`),
                ilike(permissions.codename, `%${search}%`),
            ),
        );
    }

    const query = db.select({ count: count() }).from(permissions);
    if (filters.length > 0) {
        const results = await query.where(filters[0]);
        return results[0]?.count ?? 0;
    }

    const results = await query;
    return results[0]?.count ?? 0;
};

/**
 * Updates a permission in the database.
 * @param id The permission UUID.
 * @param data Partial permission data to update.
 * @returns The updated permission record.
 */
export const updatePermission = async (
    id: string,
    data: {
        name?: string;
        codename?: string;
        description?: string | null;
        isActive?: boolean;
    },
) => {
    const updates: any = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.codename !== undefined) updates.codename = data.codename;
    if (data.description !== undefined) updates.description = data.description;
    if (data.isActive !== undefined) updates.isActive = data.isActive;
    updates.updatedAt = new Date();

    const [updated] = await db
        .update(permissions)
        .set(updates)
        .where(eq(permissions.id, id))
        .returning();
    return updated;
};

/**
 * Deletes a permission from the database.
 * @param id The permission UUID.
 * @returns The deleted permission record.
 */
export const deletePermission = async (id: string) => {
    const [deleted] = await db
        .delete(permissions)
        .where(eq(permissions.id, id))
        .returning();
    return deleted;
};
