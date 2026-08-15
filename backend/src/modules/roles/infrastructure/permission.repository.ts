import { db } from "../../../infrastructure/database/client.js";
import { permissions } from "../../../infrastructure/database/schema/index.js";
import { eq, count, or, ilike } from "drizzle-orm";

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
 * Retrieves all permissions with optional search filter.
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
