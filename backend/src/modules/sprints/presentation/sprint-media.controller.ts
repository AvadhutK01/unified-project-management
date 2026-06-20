import { Request, Response, NextFunction } from "express";
import {
    uploadSprintMedia,
    getSprintMediaList,
    deleteSprintMedia,
} from "../application/sprint-media.use-cases.js";

/**
 * Handles uploading a sprint media attachment file.
 */
export const handleUploadMedia = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const sprintId = req.params["sprintId"] as string;
        const userId = req.user?.id as string;
        const orgId = req.orgId as string;
        const file = req.file;

        const result = await uploadSprintMedia(sprintId, userId, orgId, file);

        return res.status(201).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles fetching paginated media files for a sprint.
 */
export const handleGetMediaList = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const sprintId = req.params["sprintId"] as string;
        const orgId = req.orgId as string;
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);
        const search = req.query["search"] as string | undefined;

        const result = await getSprintMediaList(
            sprintId,
            orgId,
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
 * Handles soft deleting a sprint media attachment file.
 */
export const handleDeleteMedia = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const mediaId = req.params["mediaId"] as string;
        const userId = req.user?.id as string;
        const orgId = req.orgId as string;

        const result = await deleteSprintMedia(mediaId, userId, orgId);

        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};
