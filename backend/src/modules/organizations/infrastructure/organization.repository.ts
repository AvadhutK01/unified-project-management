import { db } from "../../../infrastructure/database/client.js";
import {
    organizations,
    organizationMembers,
    roles,
} from "../../../infrastructure/database/schema/index.js";
import { eq, count, ilike, and, or, isNull, desc } from "drizzle-orm";
import {
    ORGANIZATION_STATUS,
    ORGANIZATION_MEMBER_STATUS,
} from "../../../shared/constants/enumConstants.js";

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
        .orderBy(desc(organizations.updatedAt))
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
export const enrichOrganizationsWithMemberInfo = async (
    orgList: any[],
    currentUserId?: string,
) => {
    return Promise.all(
        orgList.map(async (org) => {
            const countRes = await db
                .select({ countVal: count() })
                .from(organizationMembers)
                .where(
                    and(
                        eq(organizationMembers.organizationId, org.id),
                        isNull(organizationMembers.deletedAt),
                    ),
                );
            const memberCountVal = countRes[0]?.countVal ?? 0;

            let roleName = "Member";
            if (currentUserId) {
                if (org.ownerUserId === currentUserId) {
                    roleName = "Owner";
                } else {
                    const memberWithRole = await db
                        .select({ roleName: roles.name })
                        .from(organizationMembers)
                        .innerJoin(
                            roles,
                            eq(organizationMembers.roleId, roles.id),
                        )
                        .where(
                            and(
                                eq(organizationMembers.organizationId, org.id),
                                eq(organizationMembers.memberId, currentUserId),
                                isNull(organizationMembers.deletedAt),
                            ),
                        )
                        .limit(1);

                    if (
                        memberWithRole.length > 0 &&
                        memberWithRole[0]?.roleName
                    ) {
                        roleName = memberWithRole[0].roleName;
                    }
                }
            }

            return {
                ...org,
                memberCount: Number(memberCountVal || 0),
                role: roleName,
                userRole: roleName,
            };
        }),
    );
};

export const findAllOrganizations = async (
    page: number,
    limit: number,
    ownerUserId?: string,
    search?: string,
) => {
    const offset = (page - 1) * limit;
    const filters = [];
    if (search) {
        filters.push(ilike(organizations.name, `%${search}%`));
    }

    let results = [];
    if (ownerUserId) {
        results = await db
            .selectDistinct({
                id: organizations.id,
                name: organizations.name,
                slug: organizations.slug,
                logoUrl: organizations.logoUrl,
                ownerUserId: organizations.ownerUserId,
                websiteUrl: organizations.websiteUrl,
                description: organizations.description,
                status: organizations.status,
                createdAt: organizations.createdAt,
                updatedAt: organizations.updatedAt,
            })
            .from(organizations)
            .leftJoin(
                organizationMembers,
                and(
                    eq(organizations.id, organizationMembers.organizationId),
                    isNull(organizationMembers.deletedAt),
                ),
            )
            .where(
                and(
                    or(
                        eq(organizations.ownerUserId, ownerUserId),
                        eq(organizationMembers.memberId, ownerUserId),
                    ),
                    ...filters,
                ),
            )
            .orderBy(desc(organizations.updatedAt))
            .limit(limit)
            .offset(offset);
    } else {
        const query = db.select().from(organizations);
        const dynamicQuery =
            filters.length > 0 ? query.where(and(...filters)) : query;
        results = await dynamicQuery
            .orderBy(desc(organizations.updatedAt))
            .limit(limit)
            .offset(offset);
    }

    return enrichOrganizationsWithMemberInfo(results, ownerUserId);
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
    if (search) {
        filters.push(ilike(organizations.name, `%${search}%`));
    }

    if (ownerUserId) {
        const [result] = await db
            .select({ value: count() })
            .from(organizations)
            .leftJoin(
                organizationMembers,
                and(
                    eq(organizations.id, organizationMembers.organizationId),
                    isNull(organizationMembers.deletedAt),
                ),
            )
            .where(
                and(
                    or(
                        eq(organizations.ownerUserId, ownerUserId),
                        eq(organizationMembers.memberId, ownerUserId),
                    ),
                    ...filters,
                ),
            );
        return Number(result?.value ?? 0);
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
        status?: "active" | "inactive" | "archived";
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

/**
 * Executes a transaction to create an organization, its default Owner role, and its initial Owner member atomically.
 */
export const createOrganizationWithRoleAndMemberTx = async (
    data: {
        name: string;
        slug: string;
        logoUrl?: string;
        websiteUrl?: string;
        description?: string;
        status?: "active" | "inactive" | "archived";
    },
    ownerId: string,
) => {
    return db.transaction(async (tx) => {
        const [org] = await tx
            .insert(organizations)
            .values({
                name: data.name,
                slug: data.slug,
                logoUrl: data.logoUrl ?? null,
                ownerUserId: ownerId,
                websiteUrl: data.websiteUrl ?? null,
                description: data.description ?? null,
                status: data.status ?? ORGANIZATION_STATUS.ACTIVE,
            })
            .returning();

        if (!org) {
            throw new Error("Failed to create organization in transaction");
        }

        const [ownerRole] = await tx
            .insert(roles)
            .values({
                name: "Owner",
                organizationId: org.id,
                description: "Organization Owner",
                isActive: true,
            })
            .returning();

        if (!ownerRole) {
            throw new Error("Failed to create owner role in transaction");
        }

        await tx.insert(organizationMembers).values({
            organizationId: org.id,
            memberId: ownerId,
            roleId: ownerRole.id,
            status: ORGANIZATION_MEMBER_STATUS.ACTIVE,
        });

        return org;
    });
};

/**
 * Executes a transaction to delete an organization and all its members and roles atomically.
 */
export const deleteOrganizationCascadeTx = async (id: string) => {
    return db.transaction(async (tx) => {
        await tx
            .delete(organizationMembers)
            .where(eq(organizationMembers.organizationId, id));

        await tx.delete(roles).where(eq(roles.organizationId, id));

        const [deleted] = await tx
            .delete(organizations)
            .where(eq(organizations.id, id))
            .returning();

        return deleted ?? null;
    });
};
