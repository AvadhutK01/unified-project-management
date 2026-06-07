import { Request, Response, NextFunction } from "express";
import {
    createOrganization,
    getOrganizationById,
    getMyOrganizations,
    getAllOrganizations,
    updateOrganization,
    deleteOrganization,
} from "../application/organization.use-cases.js";
import {
    unauthorizedError,
    badRequestError,
} from "../../../shared/errors/app-error.js";
import { uploadToS3 } from "../../../shared/utils/s3.js";

/**
 * Handles organization creation for the authenticated user.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleCreateOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        if (!req.user) {
            return next(unauthorizedError());
        }
        let logoUrl = req.body.logoUrl;
        if (req.file) {
            logoUrl = await uploadToS3(req.file);
        }
        const result = await createOrganization(
            { ...req.body, logoUrl },
            req.user.id,
        );
        return res.status(201).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles fetching a single organization by ID.
 * @param req Express request object containing id param.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleGetOrganizationById = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await getOrganizationById(req.params["id"] as string);
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles fetching all organizations owned by the authenticated user.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleGetMyOrganizations = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        if (!req.user) {
            return next(unauthorizedError());
        }
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);
        const search = req.query["search"] as string | undefined;
        const result = await getMyOrganizations(
            req.user.id,
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
 * Handles fetching all organizations.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleGetAllOrganizations = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        if (!req.user) {
            return next(unauthorizedError());
        }
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);
        const search = req.query["search"] as string | undefined;
        const result = await getAllOrganizations(
            page,
            limit,
            req.user.id,
            search,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles updating an organization. Only the owner can update.
 * @param req Express request object containing id param and update body.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleUpdateOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        if (!req.user) {
            return next(unauthorizedError());
        }
        if (Object.keys(req.body).length === 0 && !req.file) {
            return next(
                badRequestError(
                    "At least one field or logo file must be provided",
                ),
            );
        }
        let logoUrl = req.body.logoUrl;
        if (req.file) {
            logoUrl = await uploadToS3(req.file);
        }
        const updateData = { ...req.body };
        if (logoUrl !== undefined) {
            updateData.logoUrl = logoUrl;
        }
        const result = await updateOrganization(
            req.params["id"] as string,
            updateData,
            req.user.id,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles deleting an organization. Only the owner can delete.
 * @param req Express request object containing id param.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleDeleteOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        if (!req.user) {
            return next(unauthorizedError());
        }
        const result = await deleteOrganization(
            req.params["id"] as string,
            req.user.id,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};
