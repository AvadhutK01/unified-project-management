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
        const search = (req.query["search"] as string) ?? undefined;

        const result = await getAllPermissions(search);
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};
