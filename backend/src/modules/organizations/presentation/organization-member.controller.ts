import { Request, Response, NextFunction } from "express";
import {
    inviteMembers,
    getInvitationsForUser,
    updateInvitationStatus,
    getOrganizationMembersList,
    reInviteMember,
    getMemberDetails,
    editMemberDetails,
    removeMember,
    revokeInvitation,
} from "../application/organization-member.use-cases.js";
import { getMemberRoleData } from "../../../shared/utils/role-data.js";

/**
 * Handles inviting members to an organization.
 * @param req Express request object containing organizationId header and body.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleInviteMembers = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await inviteMembers(
            req.orgId as string,
            req.user?.id as string,
            req.body.invitations,
        );
        return res.status(201).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles fetching invitations for the authenticated user.
 * @param req Express request object containing user payload and pagination query parameters.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleGetInvitations = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);
        const result = await getInvitationsForUser(
            req.user?.id as string,
            page,
            limit,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles updating the status of an invitation.
 * @param req Express request object containing invitation ID param and body.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleUpdateInvitationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await updateInvitationStatus(
            req.params["id"] as string,
            req.user?.id as string,
            req.body.status,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles fetching list of organization members (joined or invited).
 * @param req Express request object containing organization ID and query parameters.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleGetOrganizationMembers = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);
        const type = req.query["type"] as "invited" | "joined";
        const search = req.query["search"] as string | undefined;
        const result = await getOrganizationMembersList(
            req.orgId as string,
            type,
            page,
            limit,
            search,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles re-inviting a rejected member.
 * @param req Express request object containing organization ID, email, and role ID.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleReInviteMember = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await reInviteMember(
            req.orgId as string,
            req.user?.id as string,
            req.body.email,
            req.body.roleId,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles fetching details of a member in the organization.
 * @param req Express request object containing member ID param.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleGetMemberDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await getMemberDetails(req.params["id"] as string);
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles editing organization member's role and/or status.
 * @param req Express request object containing member ID param and body.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleEditMemberDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await editMemberDetails(
            req.params["id"] as string,
            req.body,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles soft-deleting an organization member.
 * @param req Express request object containing member ID param.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleDeleteMember = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await removeMember(req.params["id"] as string);
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles revoking a pending invitation.
 * @param req Express request object containing invitation ID param.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleRevokeInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await revokeInvitation(req.params["id"] as string);
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles fetching the current user's role and permissions inside an organization.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleGetMyMemberRole = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const roleData = await getMemberRoleData(
            req.orgId as string,
            req.user?.id as string,
        );
        return res.status(200).json({ status: "success", data: roleData });
    } catch (error) {
        next(error);
    }
};
