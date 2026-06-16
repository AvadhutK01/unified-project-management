import { db } from "../../../infrastructure/database/client.js";
import {
    organizationInvitations,
    roles,
    users,
    organizations,
} from "../../../infrastructure/database/schema/index.js";
import { eq, and, count } from "drizzle-orm";

/**
 * Creates a new organization invitation.
 * @param data Invitation input data.
 * @returns The newly created invitation record.
 */
export const createInvitation = async (data: {
    organizationId: string;
    email: string;
    memberId: string;
    roleId: string;
    invitedBy: string;
}) => {
    const [invitation] = await db
        .insert(organizationInvitations)
        .values({
            organizationId: data.organizationId,
            email: data.email,
            memberId: data.memberId,
            roleId: data.roleId,
            invitedBy: data.invitedBy,
            status: "pending",
        })
        .returning();
    return invitation;
};

/**
 * Finds an invitation by its primary key.
 * @param id The invitation UUID.
 * @returns The invitation record or null.
 */
export const findInvitationById = async (id: string) => {
    const results = await db
        .select()
        .from(organizationInvitations)
        .where(eq(organizationInvitations.id, id))
        .limit(1);
    return results[0] ?? null;
};

/**
 * Finds an invitation by organization ID and email.
 * @param organizationId The organization UUID.
 * @param email The target email address.
 * @returns The invitation record or null.
 */
export const findInvitationByOrgEmail = async (
    organizationId: string,
    email: string,
) => {
    const results = await db
        .select()
        .from(organizationInvitations)
        .where(
            and(
                eq(organizationInvitations.organizationId, organizationId),
                eq(organizationInvitations.email, email),
            ),
        )
        .limit(1);
    return results[0] ?? null;
};

/**
 * Updates an invitation status.
 * @param id The invitation UUID.
 * @param status The new status.
 * @returns The updated invitation record.
 */
export const updateInvitationStatus = async (id: string, status: string) => {
    const [updated] = await db
        .update(organizationInvitations)
        .set({ status, updatedAt: new Date() })
        .where(eq(organizationInvitations.id, id))
        .returning();
    return updated;
};

/**
 * Retrieves pending invitations for a specific user.
 * @param memberId The user UUID.
 * @param page The page number.
 * @param limit The limit number.
 * @returns Array of pending invitation records.
 */
export const findInvitationsForUser = async (
    memberId: string,
    page: number,
    limit: number,
) => {
    const offset = (page - 1) * limit;
    return db
        .select({
            id: organizationInvitations.id,
            organizationId: organizationInvitations.organizationId,
            organizationName: organizations.name,
            email: organizationInvitations.email,
            memberId: organizationInvitations.memberId,
            roleId: organizationInvitations.roleId,
            roleName: roles.name,
            status: organizationInvitations.status,
            invitedBy: organizationInvitations.invitedBy,
            invitedByName: users.username,
            createdAt: organizationInvitations.createdAt,
            updatedAt: organizationInvitations.updatedAt,
        })
        .from(organizationInvitations)
        .innerJoin(roles, eq(organizationInvitations.roleId, roles.id))
        .innerJoin(
            organizations,
            eq(organizationInvitations.organizationId, organizations.id),
        )
        .leftJoin(users, eq(organizationInvitations.invitedBy, users.id))
        .where(
            and(
                eq(organizationInvitations.memberId, memberId),
                eq(organizationInvitations.status, "pending"),
            ),
        )
        .limit(limit)
        .offset(offset);
};

/**
 * Counts total pending invitations for a specific user.
 * @param memberId The user UUID.
 * @returns The total count.
 */
export const countInvitationsForUser = async (memberId: string) => {
    const [result] = await db
        .select({ value: count() })
        .from(organizationInvitations)
        .where(
            and(
                eq(organizationInvitations.memberId, memberId),
                eq(organizationInvitations.status, "pending"),
            ),
        );
    return Number(result?.value ?? 0);
};

/**
 * Updates an invitation's status and roleId (specifically for re-invites).
 * @param id The invitation UUID.
 * @param roleId The new role UUID.
 * @param status The new status.
 * @returns The updated invitation record.
 */
export const updateInvitationRoleAndStatus = async (
    id: string,
    roleId: string,
    status: string,
    invitedBy?: string,
) => {
    const updates: any = { status, roleId, updatedAt: new Date() };
    if (invitedBy) {
        updates.invitedBy = invitedBy;
    }
    const [updated] = await db
        .update(organizationInvitations)
        .set(updates)
        .where(eq(organizationInvitations.id, id))
        .returning();
    return updated;
};
