import { Request, Response, NextFunction } from "express";
import {
    createSprint,
    getSprintById,
    getAllSprints,
    updateSprint,
    updateSprintStatus,
    deleteSprint,
    getSprintActivities,
} from "../application/sprint.use-cases.js";

/**
 * Handles creation of a new sprint.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 * @returns JSON response with the created sprint.
 */
export const handleCreateSprint = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await createSprint({
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
 * Handles retrieval of a single sprint by ID.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 * @returns JSON response with sprint details.
 */
export const handleGetSprintById = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await getSprintById(
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
 * Handles retrieval of all sprints for a phase.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 * @returns JSON response with paginated sprint list.
 */
export const handleGetAllSprints = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const phaseId = req.query["phaseId"] as string;
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);
        const search = (req.query["search"] as string) ?? undefined;
        const status = (req.query["status"] as string) ?? undefined;

        const result = await getAllSprints(
            phaseId,
            req.orgId as string,
            req.user?.id as string,
            page,
            limit,
            search,
            status,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles updating a sprint.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 * @returns JSON response with the updated sprint.
 */
export const handleUpdateSprint = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await updateSprint(
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
 * Handles updating sprint status.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 * @returns JSON response with the updated sprint.
 */
export const handleUpdateSprintStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await updateSprintStatus(
            req.params["id"] as string,
            req.orgId as string,
            req.user?.id as string,
            req.body.status,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles soft-deletion of a sprint.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 * @returns JSON response indicating success.
 */
export const handleDeleteSprint = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await deleteSprint(
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
 * Handles retrieval of activity logs for a sprint.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 * @returns JSON response with paginated activity logs.
 */
export const handleGetSprintActivities = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const sprintId = req.params["id"] as string;
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);

        const result = await getSprintActivities(
            sprintId,
            req.orgId as string,
            req.user?.id as string,
            page,
            limit,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};
