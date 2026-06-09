import { Request, Response, NextFunction } from "express";
import { getAllPermissions } from "../application/permission.use-cases.js";

/**
 * Handles fetching all permissions with pagination and optional search.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleGetAllPermissions = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);
        const search = (req.query["search"] as string) ?? undefined;

        const result = await getAllPermissions(page, limit, search);
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};
