import { db } from "../../../infrastructure/database/client.js";
import {
    organizationInvitations,
    organizationMembers,
    roles,
    users,
    organizations,
} from "../../../infrastructure/database/schema/index.js";
import { eq, and, count, desc } from "drizzle-orm";
import {
    ORGANIZATION_INVITATION_STATUS,
    ORGANIZATION_MEMBER_STATUS,
} from "../../../shared/constants/enumConstants.js";

type InvitationStatus =
    (typeof ORGANIZATION_INVITATION_STATUS)[keyof typeof ORGANIZATION_INVITATION_STATUS];

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
            status: ORGANIZATION_INVITATION_STATUS.PENDING,
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
export const updateInvitationStatus = async (
    id: string,
    status: InvitationStatus,
) => {
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
                eq(
                    organizationInvitations.status,
                    ORGANIZATION_INVITATION_STATUS.PENDING,
                ),
            ),
        )
        .orderBy(desc(organizationInvitations.updatedAt))
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
                eq(
                    organizationInvitations.status,
                    ORGANIZATION_INVITATION_STATUS.PENDING,
                ),
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
    status: InvitationStatus,
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

/**
 * Accepts an invitation and inserts the new organization member in a single DB transaction.
 */
export const acceptInvitationTx = async (
    invitationId: string,
    organizationId: string,
    memberId: string,
    roleId: string,
) => {
    return db.transaction(async (tx) => {
        const [updatedInvitation] = await tx
            .update(organizationInvitations)
            .set({
                status: ORGANIZATION_INVITATION_STATUS.ACCEPTED,
                updatedAt: new Date(),
            })
            .where(eq(organizationInvitations.id, invitationId))
            .returning();

        await tx.insert(organizationMembers).values({
            organizationId,
            memberId,
            roleId,
            status: ORGANIZATION_MEMBER_STATUS.ACTIVE,
        });

        return updatedInvitation;
    });
};
