import {
    createInvitation,
    findInvitationById,
    findInvitationByOrgEmail,
    updateInvitationStatus as updateInvitationStatusRepo,
    findInvitationsForUser,
    countInvitationsForUser,
    updateInvitationRoleAndStatus,
    acceptInvitationTx,
} from "../infrastructure/organization-invitation.repository.js";
import {
    createMember,
    findMemberByOrgAndUserId,
    findOrganizationMembers,
    countOrganizationMembers,
    findOrganizationInvitations,
    countOrganizationInvitations,
    findMemberById,
    updateMemberDetails,
    softDeleteMember,
    findProjectMembersPaginated,
    countProjectMembersPaginated,
} from "../infrastructure/organization-member.repository.js";
import { findOrganizationById } from "../infrastructure/organization.repository.js";
import { findProjectById } from "../../projects/infrastructure/project.repository.js";
import {
    findUserByEmail,
    findUserById,
} from "../../users/infrastructure/user.repository.js";
import { findRoleByIdRaw } from "../../roles/infrastructure/role.repository.js";
import { sendOrgInviteEmail } from "../../../shared/utils/email.js";
import {
    badRequestError,
    notFoundError,
    unauthorizedError,
    forbiddenError,
    internalServerError,
} from "../../../shared/errors/app-error.js";
import {
    ORGANIZATION_INVITATION_STATUS,
    ORGANIZATION_MEMBER_STATUS,
} from "../../../shared/constants/enumConstants.js";

/**
 * Invites members to an organization.
 * @param organizationId The organization UUID.
 * @param requesterUserId The requester user UUID.
 * @param invitations List of email and roleId pairs.
 */
export const inviteMembers = async (
    organizationId: string,
    requesterUserId: string,
    invitations: { email: string; roleId: string }[],
) => {
    const results = [];

    for (const invite of invitations) {
        const invitedUser = await findUserByEmail(invite.email);

        if (!invitedUser) {
            throw badRequestError(
                `User with email ${invite.email} is not registered`,
            );
        }

        const role = await findRoleByIdRaw(invite.roleId);
        if (!role) {
            throw badRequestError(
                `Role with ID ${invite.roleId} does not exist`,
            );
        }

        const existingMember = await findMemberByOrgAndUserId(
            organizationId,
            invitedUser.id,
        );
        if (existingMember) {
            throw badRequestError(
                `User ${invite.email} is already a member of this organization`,
            );
        }

        const existingInvitation = await findInvitationByOrgEmail(
            organizationId,
            invite.email,
        );
        if (existingInvitation) {
            if (
                existingInvitation.status ===
                ORGANIZATION_INVITATION_STATUS.PENDING
            ) {
                throw badRequestError(
                    `Invitation is already pending for ${invite.email}`,
                );
            }
            if (
                existingInvitation.status ===
                ORGANIZATION_INVITATION_STATUS.REJECTED
            ) {
                throw badRequestError(
                    `Invitation for ${invite.email} was rejected. Please use re-invite API.`,
                );
            }
            if (
                existingInvitation.status ===
                ORGANIZATION_INVITATION_STATUS.ACCEPTED
            ) {
                throw badRequestError(
                    `Invitation is already accepted by ${invite.email}`,
                );
            }
        }

        const newInvitation = await createInvitation({
            organizationId,
            email: invite.email,
            memberId: invitedUser.id,
            roleId: invite.roleId,
            invitedBy: requesterUserId,
        });

        const [requesterUser, org] = await Promise.all([
            findUserById(requesterUserId),
            findOrganizationById(organizationId),
        ]);
        if (requesterUser && org) {
            sendOrgInviteEmail(
                invite.email,
                requesterUser.username,
                org.name,
                role.name,
            ).catch((err) =>
                console.error("Failed to send org invite email:", err),
            );
        }

        results.push(newInvitation);
    }

    return results;
};

/**
 * Gets pending invitations for a specific user.
 * @param userId The user UUID.
 * @param page The page number.
 * @param limit The limit number.
 */
export const getInvitationsForUser = async (
    userId: string,
    page: number = 1,
    limit: number = 10,
) => {
    const [data, total] = await Promise.all([
        findInvitationsForUser(userId, page, limit),
        countInvitationsForUser(userId),
    ]);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Updates status of an invitation (accept/reject).
 * @param invitationId The invitation UUID.
 * @param userId The user UUID.
 * @param status The target status.
 */
export const updateInvitationStatus = async (
    invitationId: string,
    userId: string,
    status: "accepted" | "rejected",
) => {
    const invitation = await findInvitationById(invitationId);
    if (!invitation) {
        throw notFoundError("Invitation not found");
    }

    if (invitation.memberId !== userId) {
        throw forbiddenError(
            "You are not authorized to update this invitation",
        );
    }

    if (invitation.status !== ORGANIZATION_INVITATION_STATUS.PENDING) {
        throw badRequestError("Invitation has already been processed");
    }

    if (status === ORGANIZATION_INVITATION_STATUS.ACCEPTED) {
        return acceptInvitationTx(
            invitationId,
            invitation.organizationId,
            invitation.memberId,
            invitation.roleId,
        );
    }

    return updateInvitationStatusRepo(invitationId, status);
};

/**
 * Retrieves members of an organization, filtered by type (joined vs invited).
 * @param organizationId The organization UUID.
 * @param type The type filter (joined vs invited).
 * @param page The page number.
 * @param limit The limit number.
 */
export const getOrganizationMembersList = async (
    organizationId: string,
    userId: string,
    type: "invited" | "joined",
    page: number = 1,
    limit: number = 10,
    search?: string,
    isForProject?: boolean,
) => {
    let excludeUserIds: string[] = [];

    if (isForProject) {
        const org = await findOrganizationById(organizationId);
        if (org) {
            excludeUserIds.push(org.ownerUserId);
        }
        if (userId && !excludeUserIds.includes(userId)) {
            excludeUserIds.push(userId);
        }
    }

    if (type === "joined") {
        const [data, total] = await Promise.all([
            findOrganizationMembers(
                organizationId,
                page,
                limit,
                search,
                excludeUserIds,
            ),
            countOrganizationMembers(organizationId, search, excludeUserIds),
        ]);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    } else {
        const [data, total] = await Promise.all([
            findOrganizationInvitations(organizationId, page, limit, search),
            countOrganizationInvitations(organizationId, search),
        ]);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};

/**
 * Re-invites a member whose invitation was previously rejected.
 * @param organizationId The organization UUID.
 * @param requesterUserId The requester user UUID.
 * @param email The target email address.
 * @param roleId The target role UUID.
 */
export const reInviteMember = async (
    organizationId: string,
    requesterUserId: string,
    email: string,
    roleId: string,
) => {
    const invitedUser = await findUserByEmail(email);

    if (!invitedUser) {
        throw badRequestError(`User with email ${email} is not registered`);
    }

    const role = await findRoleByIdRaw(roleId);
    if (!role) {
        throw badRequestError(`Role with ID ${roleId} does not exist`);
    }

    const existingMember = await findMemberByOrgAndUserId(
        organizationId,
        invitedUser.id,
    );
    if (existingMember) {
        throw badRequestError(
            `User ${email} is already a member of this organization`,
        );
    }

    const existingInvitation = await findInvitationByOrgEmail(
        organizationId,
        email,
    );
    if (
        !existingInvitation ||
        existingInvitation.status !== ORGANIZATION_INVITATION_STATUS.REJECTED
    ) {
        throw badRequestError(
            `Re-invite is only allowed for rejected invitations`,
        );
    }

    const updatedInvitation = await updateInvitationRoleAndStatus(
        existingInvitation.id,
        roleId,
        ORGANIZATION_INVITATION_STATUS.PENDING,
        requesterUserId,
    );

    const [requesterUser, org] = await Promise.all([
        findUserById(requesterUserId),
        findOrganizationById(organizationId),
    ]);
    if (requesterUser && org) {
        sendOrgInviteEmail(
            email,
            requesterUser.username,
            org.name,
            role.name,
        ).catch((err) =>
            console.error("Failed to send org re-invite email:", err),
        );
    }

    return updatedInvitation ?? null;
};

/**
 * Retrieves details of a member in the organization.
 * @param memberId The organization member UUID.
 * @returns The member details.
 */
export const getMemberDetails = async (memberId: string) => {
    const member = await findMemberById(memberId);
    if (!member) {
        throw notFoundError("Member not found");
    }
    return member;
};

/**
 * Edits an organization member's role and/or status.
 * @param memberId The organization member UUID.
 * @param data The fields to update (roleId and/or status).
 * @returns The updated member record.
 */
export const editMemberDetails = async (
    memberId: string,
    data: {
        roleId?: string;
        status?: "active" | "inactive" | "onleave";
    },
) => {
    const member = await findMemberById(memberId);
    if (!member) {
        throw notFoundError("Member not found");
    }

    if (data.roleId) {
        const role = await findRoleByIdRaw(data.roleId);
        if (!role) {
            throw badRequestError(`Role with ID ${data.roleId} does not exist`);
        }
    }

    return updateMemberDetails(memberId, data);
};

/**
 * Soft deletes a member in the organization.
 * @param memberId The organization member UUID.
 * @returns The deleted member record.
 */
export const removeMember = async (memberId: string) => {
    const member = await findMemberById(memberId);
    if (!member) {
        throw notFoundError("Member not found");
    }
    return softDeleteMember(memberId);
};

/**
 * Revokes a pending invitation.
 * @param invitationId The invitation UUID.
 * @returns The updated invitation record.
 */
export const revokeInvitation = async (invitationId: string) => {
    const invitation = await findInvitationById(invitationId);
    if (!invitation) {
        throw notFoundError("Invitation not found");
    }

    if (invitation.status !== ORGANIZATION_INVITATION_STATUS.PENDING) {
        throw badRequestError("Invitation is not in pending state");
    }

    return updateInvitationStatusRepo(
        invitationId,
        ORGANIZATION_INVITATION_STATUS.REVOKED,
    );
};

/**
 * Retrieves a paginated list of members for a specific project.
 * @param organizationId The organization UUID.
 * @param projectId The project UUID.
 * @param page The page number.
 * @param limit The limit number.
 * @param search Optional search term.
 * @returns Object containing member list and pagination metadata.
 */
export const getProjectMembersPaginated = async (
    organizationId: string,
    projectId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
) => {
    const project = await findProjectById(projectId, organizationId);
    if (!project) {
        throw notFoundError("Project not found");
    }

    const [data, total] = await Promise.all([
        findProjectMembersPaginated(projectId, page, limit, search),
        countProjectMembersPaginated(projectId, search),
    ]);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Toggles the current user's member status between active and onleave.
 * @param orgId The organization UUID.
 * @param userId The user UUID.
 */
export const toggleMyLeaveStatus = async (orgId: string, userId: string) => {
    const org = await findOrganizationById(orgId);
    if (!org) {
        throw notFoundError("Organization not found");
    }

    if (org.ownerUserId === userId) {
        throw badRequestError(
            "Organization owner cannot change their status to onleave",
        );
    }

    const member = await findMemberByOrgAndUserId(orgId, userId);
    if (!member) {
        throw notFoundError("Member not found in organization");
    }

    if (
        member.status !== ORGANIZATION_MEMBER_STATUS.ACTIVE &&
        member.status !== ORGANIZATION_MEMBER_STATUS.ON_LEAVE
    ) {
        throw badRequestError(
            "You cannot change your leave status because your current status is " +
                member.status,
        );
    }

    const newStatus =
        member.status === ORGANIZATION_MEMBER_STATUS.ACTIVE
            ? ORGANIZATION_MEMBER_STATUS.ON_LEAVE
            : ORGANIZATION_MEMBER_STATUS.ACTIVE;

    const updated = await updateMemberDetails(member.id, { status: newStatus });
    if (!updated) {
        throw internalServerError("Failed to update member status");
    }

    const { broadcastPresenceUpdate } = await import("./presence.service.js");
    const targetPresenceStatus =
        newStatus === ORGANIZATION_MEMBER_STATUS.ON_LEAVE
            ? "onleave"
            : "active";
    await broadcastPresenceUpdate(orgId, userId, targetPresenceStatus);
    await broadcastPresenceUpdate(orgId, member.id, targetPresenceStatus);

    return updated;
};
