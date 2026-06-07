import { db } from "../../../infrastructure/database/client.js";
import { organizations } from "../../../infrastructure/database/schema/index.js";
import { eq, count, ilike, and } from "drizzle-orm";

/**
 * Creates a new organization in the database.
 * @param data Organization input data.
 * @returns The newly created organization record.
 */
export const createOrganization = async (data: {
    name: string;
    slug: string;
    logoUrl?: string;
    ownerUserId: string;
    websiteUrl?: string;
    description?: string;
    status?: string;
}) => {
    const [org] = await db
        .insert(organizations)
        .values({
            name: data.name,
            slug: data.slug,
            logoUrl: data.logoUrl ?? null,
            ownerUserId: data.ownerUserId,
            websiteUrl: data.websiteUrl ?? null,
            description: data.description ?? null,
            status: data.status ?? "active",
        })
        .returning();
    return org;
};

/**
 * Finds an organization by its primary key.
 * @param id The organization UUID.
 * @returns The organization record or null.
 */
export const findOrganizationById = async (id: string) => {
    const results = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, id))
        .limit(1);
    return results[0] ?? null;
};

/**
 * Finds an organization by its slug.
 * @param slug The organization slug.
 * @returns The organization record or null.
 */
export const findOrganizationBySlug = async (slug: string) => {
    const results = await db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, slug))
        .limit(1);
    return results[0] ?? null;
};

/**
 * Finds an organization by its name.
 * @param name The organization name.
 * @returns The organization record or null.
 */
export const findOrganizationByName = async (name: string) => {
    const results = await db
        .select()
        .from(organizations)
        .where(eq(organizations.name, name))
        .limit(1);
    return results[0] ?? null;
};

/**
 * Retrieves all organizations owned by a specific user with pagination and optional search filter.
 * @param ownerUserId The owner's user UUID.
 * @param page The page number.
 * @param limit The limit number.
 * @param search Optional search keyword.
 * @returns An array of organization records.
 */
export const findOrganizationsByOwner = async (
    ownerUserId: string,
    page: number,
    limit: number,
    search?: string,
) => {
    const offset = (page - 1) * limit;
    const filters = [eq(organizations.ownerUserId, ownerUserId)];
    if (search) {
        filters.push(ilike(organizations.name, `%${search}%`));
    }
    return db
        .select()
        .from(organizations)
        .where(and(...filters))
        .limit(limit)
        .offset(offset);
};

/**
 * Counts the total number of organizations owned by a specific user with optional search filter.
 * @param ownerUserId The owner's user UUID.
 * @param search Optional search keyword.
 * @returns The total count.
 */
export const countOrganizationsByOwner = async (
    ownerUserId: string,
    search?: string,
) => {
    const filters = [eq(organizations.ownerUserId, ownerUserId)];
    if (search) {
        filters.push(ilike(organizations.name, `%${search}%`));
    }
    const [result] = await db
        .select({ value: count() })
        .from(organizations)
        .where(and(...filters));
    return Number(result?.value ?? 0);
};

/**
 * Retrieves all organizations with pagination, optional owner user filter, and optional search filter.
 * @param page The page number.
 * @param limit The limit number.
 * @param ownerUserId Optional owner user UUID to restrict organizations.
 * @param search Optional search keyword.
 * @returns An array of all organization records.
 */
export const findAllOrganizations = async (
    page: number,
    limit: number,
    ownerUserId?: string,
    search?: string,
) => {
    const offset = (page - 1) * limit;
    const filters = [];
    if (ownerUserId) {
        filters.push(eq(organizations.ownerUserId, ownerUserId));
    }
    if (search) {
        filters.push(ilike(organizations.name, `%${search}%`));
    }
    const query = db.select().from(organizations);
    const dynamicQuery =
        filters.length > 0 ? query.where(and(...filters)) : query;
    return dynamicQuery.limit(limit).offset(offset);
};

/**
 * Counts the total number of organizations in the system with optional owner user filter and search filter.
 * @param ownerUserId Optional owner user UUID.
 * @param search Optional search keyword.
 * @returns The total count.
 */
export const countAllOrganizations = async (
    ownerUserId?: string,
    search?: string,
) => {
    const filters = [];
    if (ownerUserId) {
        filters.push(eq(organizations.ownerUserId, ownerUserId));
    }
    if (search) {
        filters.push(ilike(organizations.name, `%${search}%`));
    }
    const query = db.select({ value: count() }).from(organizations);
    const dynamicQuery =
        filters.length > 0 ? query.where(and(...filters)) : query;
    const [result] = await dynamicQuery;
    return Number(result?.value ?? 0);
};

/**
 * Updates an organization's fields.
 * @param id The organization UUID.
 * @param data Partial fields to update.
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
) => {
    const [org] = await db
        .update(organizations)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(organizations.id, id))
        .returning();
    return org;
};

/**
 * Deletes an organization by its primary key.
 * @param id The organization UUID.
 * @returns The deleted organization record or null.
 */
export const deleteOrganization = async (id: string) => {
    const [org] = await db
        .delete(organizations)
        .where(eq(organizations.id, id))
        .returning();
    return org ?? null;
};
