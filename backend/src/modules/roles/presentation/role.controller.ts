import { Request, Response, NextFunction } from "express";
import {
    createRole,
    getRoleById,
    getAllRoles,
    updateRole,
    deleteRole,
} from "../application/role.use-cases.js";
import { unauthorizedError } from "../../../shared/errors/app-error.js";

/**
 * Handles role creation.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleCreateRole = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await createRole({
            ...req.body,
            organizationId: req.orgId as string,
        });
        return res.status(201).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles fetching a single role by ID with its permissions.
 * @param req Express request object containing id param.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleGetRoleById = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await getRoleById(
            req.params["id"] as string,
            req.orgId as string,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles fetching all roles with pagination and optional search.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleGetAllRoles = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);
        const search = (req.query["search"] as string) ?? undefined;

        const result = await getAllRoles(
            page,
            limit,
            search,
            req.orgId as string,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles role update with permission assignment.
 * @param req Express request object containing id param and body.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleUpdateRole = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await updateRole(
            req.params["id"] as string,
            req.body,
            req.orgId as string,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles role deletion.
 * @param req Express request object containing id param.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleDeleteRole = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await deleteRole(
            req.params["id"] as string,
            req.orgId as string,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};
