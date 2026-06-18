import { Request, Response, NextFunction } from "express";
import {
    createPhase,
    getPhaseById,
    getAllPhases,
    updatePhase,
    deletePhase,
} from "../application/phase.use-cases.js";

/**
 * Handles creation of a new phase.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 * @returns JSON response with the created phase.
 */
export const handleCreatePhase = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await createPhase({
            ...req.body,
            organizationId: req.orgId as string,
            userId: req.user?.id as string,
        });
        return res.status(201).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles retrieval of a single phase by ID.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 * @returns JSON response with phase details.
 */
export const handleGetPhaseById = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await getPhaseById(
            req.params["id"] as string,
            req.orgId as string,
            req.user?.id as string,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles retrieval of all phases for a project.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 * @returns JSON response with paginated phase list.
 */
export const handleGetAllPhases = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const projectId = req.query["projectId"] as string;
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);
        const search = (req.query["search"] as string) ?? undefined;

        const result = await getAllPhases(
            projectId,
            req.orgId as string,
            req.user?.id as string,
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
 * Handles updating a phase.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 * @returns JSON response with the updated phase.
 */
export const handleUpdatePhase = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await updatePhase(
            req.params["id"] as string,
            req.orgId as string,
            req.user?.id as string,
            req.body,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles soft-deletion of a phase.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 * @returns JSON response indicating success.
 */
export const handleDeletePhase = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await deletePhase(
            req.params["id"] as string,
            req.orgId as string,
            req.user?.id as string,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};
