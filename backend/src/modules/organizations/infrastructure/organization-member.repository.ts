import { db } from "../../../infrastructure/database/client.js";
import {
    organizationMembers,
    organizationInvitations,
    users,
    roles,
    projectMembers,
} from "../../../infrastructure/database/schema/index.js";
import {
    eq,
    and,
    count,
    or,
    isNull,
    ilike,
    desc,
    notInArray,
    SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

/**
 * Creates a new organization member record.
 * @param data Member input data.
 * @returns The newly created member record.
 */
export const createMember = async (data: {
    organizationId: string;
    memberId: string;
    roleId: string;
    status?: "active" | "inactive" | "onleave" | "suspended";
}) => {
    const [member] = await db
        .insert(organizationMembers)
        .values({
            organizationId: data.organizationId,
            memberId: data.memberId,
            roleId: data.roleId,
            status: data.status ?? "active",
        })
        .returning();
    return member;
};

/**
 * Finds a member by organization ID and member ID.
 * @param organizationId The organization UUID.
 * @param memberId The user UUID.
 * @returns The member record or null.
 */
export const findMemberByOrgAndUserId = async (
    organizationId: string,
    memberId: string,
) => {
    const results = await db
        .select()
        .from(organizationMembers)
        .where(
            and(
                eq(organizationMembers.organizationId, organizationId),
                eq(organizationMembers.memberId, memberId),
                isNull(organizationMembers.deletedAt),
            ),
        )
        .limit(1);
    return results[0] ?? null;
};

/**
 * Retrieves organization members who have joined (accepted).
 * @param organizationId The organization UUID.
 * @param page The page number.
 * @param limit The limit number.
 * @returns Array of joined members.
 */
export const findOrganizationMembers = async (
    organizationId: string,
    page: number,
    limit: number,
    search?: string,
    excludeUserIds?: string[],
) => {
    const offset = (page - 1) * limit;
    const filters: SQL[] = [];
    if (search) {
        filters.push(
            or(
                ilike(users.username, `%${search}%`),
                ilike(users.email, `%${search}%`),
            ) as SQL,
        );
    }
    if (excludeUserIds && excludeUserIds.length > 0) {
        filters.push(notInArray(users.id, excludeUserIds));
    }
    return db
        .select({
            id: organizationMembers.id,
            organizationId: organizationMembers.organizationId,
            memberId: organizationMembers.memberId,
            roleId: organizationMembers.roleId,
            status: organizationMembers.status,
            username: users.username,
            email: users.email,
            roleName: roles.name,
            createdAt: organizationMembers.createdAt,
            updatedAt: organizationMembers.updatedAt,
        })
        .from(organizationMembers)
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .innerJoin(roles, eq(organizationMembers.roleId, roles.id))
        .where(
            and(
                eq(organizationMembers.organizationId, organizationId),
                isNull(organizationMembers.deletedAt),
                ...filters,
            ),
        )
        .orderBy(desc(organizationMembers.updatedAt))
        .limit(limit)
        .offset(offset);
};

/**
 * Counts total joined members in an organization.
 * @param organizationId The organization UUID.
 * @returns The total count.
 */
export const countOrganizationMembers = async (
    organizationId: string,
    search?: string,
    excludeUserIds?: string[],
) => {
    const filters: SQL[] = [];
    if (search) {
        filters.push(
            or(
                ilike(users.username, `%${search}%`),
                ilike(users.email, `%${search}%`),
            ) as SQL,
        );
    }
    if (excludeUserIds && excludeUserIds.length > 0) {
        filters.push(notInArray(users.id, excludeUserIds));
    }
    const [result] = await db
        .select({ value: count() })
        .from(organizationMembers)
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .where(
            and(
                eq(organizationMembers.organizationId, organizationId),
                isNull(organizationMembers.deletedAt),
                ...filters,
            ),
        );
    return Number(result?.value ?? 0);
};

/**
 * Retrieves invited members (pending or rejected invitations) for an organization.
 * @param organizationId The organization UUID.
 * @param page The page number.
 * @param limit The limit number.
 * @returns Array of invited members.
 */
export const findOrganizationInvitations = async (
    organizationId: string,
    page: number,
    limit: number,
    search?: string,
) => {
    const offset = (page - 1) * limit;
    const inviter = alias(users, "inviter");
    const filters = [];
    if (search) {
        filters.push(
            or(
                ilike(organizationInvitations.email, `%${search}%`),
                ilike(users.username, `%${search}%`),
            ),
        );
    }
    return db
        .select({
            id: organizationInvitations.id,
            organizationId: organizationInvitations.organizationId,
            memberId: organizationInvitations.memberId,
            roleId: organizationInvitations.roleId,
            status: organizationInvitations.status,
            email: organizationInvitations.email,
            username: users.username,
            roleName: roles.name,
            invitedByName: inviter.username,
            invitedByUserId: inviter.id,
            createdAt: organizationInvitations.createdAt,
            updatedAt: organizationInvitations.updatedAt,
        })
        .from(organizationInvitations)
        .innerJoin(users, eq(organizationInvitations.memberId, users.id))
        .innerJoin(roles, eq(organizationInvitations.roleId, roles.id))
        .leftJoin(inviter, eq(organizationInvitations.invitedBy, inviter.id))
        .where(
            and(
                eq(organizationInvitations.organizationId, organizationId),
                or(
                    eq(organizationInvitations.status, "pending"),
                    eq(organizationInvitations.status, "rejected"),
                    eq(organizationInvitations.status, "revoked"),
                ),
                ...filters,
            ),
        )
        .orderBy(desc(organizationInvitations.updatedAt))
        .limit(limit)
        .offset(offset);
};

/**
 * Counts total invited members (pending or rejected) in an organization.
 * @param organizationId The organization UUID.
 * @returns The total count.
 */
export const countOrganizationInvitations = async (
    organizationId: string,
    search?: string,
) => {
    const filters = [];
    if (search) {
        filters.push(
            or(
                ilike(organizationInvitations.email, `%${search}%`),
                ilike(users.username, `%${search}%`),
            ),
        );
    }
    const [result] = await db
        .select({ value: count() })
        .from(organizationInvitations)
        .innerJoin(users, eq(organizationInvitations.memberId, users.id))
        .where(
            and(
                eq(organizationInvitations.organizationId, organizationId),
                or(
                    eq(organizationInvitations.status, "pending"),
                    eq(organizationInvitations.status, "rejected"),
                    eq(organizationInvitations.status, "revoked"),
                ),
                ...filters,
            ),
        );
    return Number(result?.value ?? 0);
};

/**
 * Finds a member record by its primary key with user and role details.
 * @param id The member UUID.
 * @returns The member record with details or null.
 */
export const findMemberById = async (id: string) => {
    const results = await db
        .select({
            id: organizationMembers.id,
            organizationId: organizationMembers.organizationId,
            memberId: organizationMembers.memberId,
            roleId: organizationMembers.roleId,
            status: organizationMembers.status,
            username: users.username,
            email: users.email,
            phoneNumber: users.phoneNumber,
            roleName: roles.name,
            createdAt: organizationMembers.createdAt,
            updatedAt: organizationMembers.updatedAt,
        })
        .from(organizationMembers)
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .innerJoin(roles, eq(organizationMembers.roleId, roles.id))
        .where(
            and(
                eq(organizationMembers.id, id),
                isNull(organizationMembers.deletedAt),
            ),
        )
        .limit(1);
    return results[0] ?? null;
};

/**
 * Updates an organization member's role and/or status.
 * @param id The member UUID.
 * @param data The fields to update (roleId and/or status).
 * @returns The updated member record.
 */
export const updateMemberDetails = async (
    id: string,
    data: {
        roleId?: string;
        status?: "active" | "inactive" | "onleave" | "suspended";
    },
) => {
    const [updated] = await db
        .update(organizationMembers)
        .set({ ...data, updatedAt: new Date() })
        .where(
            and(
                eq(organizationMembers.id, id),
                isNull(organizationMembers.deletedAt),
            ),
        )
        .returning();
    return updated;
};

/**
 * Soft deletes an organization member by setting the deletedAt timestamp.
 * @param id The member UUID.
 * @returns The deleted member record.
 */
export const softDeleteMember = async (id: string) => {
    const [deleted] = await db
        .update(organizationMembers)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(
            and(
                eq(organizationMembers.id, id),
                isNull(organizationMembers.deletedAt),
            ),
        )
        .returning();
    return deleted;
};

/**
 * Retrieves project members with pagination and optional search filter.
 * @param projectId The project UUID.
 * @param page The page number.
 * @param limit The limit number.
 * @param search Optional search term.
 * @returns Array of project members with user and org member information.
 */
export const findProjectMembersPaginated = async (
    projectId: string,
    page: number,
    limit: number,
    search?: string,
) => {
    const offset = (page - 1) * limit;
    const filters = [];
    if (search) {
        filters.push(
            or(
                ilike(users.username, `%${search}%`),
                ilike(users.email, `%${search}%`),
            ),
        );
    }
    return db
        .select({
            memberId: organizationMembers.id,
            userId: users.id,
            name: users.username,
            email: users.email,
            status: organizationMembers.status,
        })
        .from(projectMembers)
        .innerJoin(
            organizationMembers,
            eq(projectMembers.organizationMemberId, organizationMembers.id),
        )
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .where(
            and(
                eq(projectMembers.projectId, projectId),
                isNull(projectMembers.deletedAt),
                isNull(organizationMembers.deletedAt),
                ...filters,
            ),
        )
        .orderBy(desc(organizationMembers.updatedAt))
        .limit(limit)
        .offset(offset);
};

/**
 * Counts total members in a project matching optional search criteria.
 * @param projectId The project UUID.
 * @param search Optional search term.
 * @returns The total count.
 */
export const countProjectMembersPaginated = async (
    projectId: string,
    search?: string,
) => {
    const filters = [];
    if (search) {
        filters.push(
            or(
                ilike(users.username, `%${search}%`),
                ilike(users.email, `%${search}%`),
            ),
        );
    }
    const [result] = await db
        .select({ value: count() })
        .from(projectMembers)
        .innerJoin(
            organizationMembers,
            eq(projectMembers.organizationMemberId, organizationMembers.id),
        )
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .where(
            and(
                eq(projectMembers.projectId, projectId),
                isNull(projectMembers.deletedAt),
                isNull(organizationMembers.deletedAt),
                ...filters,
            ),
        );
    return Number(result?.value ?? 0);
};

export const deleteMembersByOrganizationId = async (organizationId: string) => {
    return db
        .delete(organizationMembers)
        .where(eq(organizationMembers.organizationId, organizationId));
};
