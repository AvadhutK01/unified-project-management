import { Request, Response, NextFunction } from "express";
import {
    createSprintDiscussion,
    updateSprintDiscussion,
    getSprintDiscussions,
    deleteSprintDiscussion,
} from "../application/sprint-discussion.use-cases.js";

/**
 * Handles adding a discussion comment to a sprint.
 */
export const handleCreateDiscussion = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const sprintId = req.params["sprintId"] as string;
        const userId = req.user?.id as string;
        const orgId = req.orgId as string;
        const { comment, taggedMemberIds } = req.body;

        const result = await createSprintDiscussion(
            sprintId,
            userId,
            orgId,
            comment,
            taggedMemberIds,
        );

        return res.status(201).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles updating a discussion comment.
 */
export const handleUpdateDiscussion = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const discussionId = req.params["discussionId"] as string;
        const userId = req.user?.id as string;
        const orgId = req.orgId as string;
        const { comment, taggedMemberIds } = req.body;

        const result = await updateSprintDiscussion(
            discussionId,
            userId,
            orgId,
            comment,
            taggedMemberIds,
        );

        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles fetching paginated discussion comments for a sprint.
 */
export const handleGetDiscussions = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const sprintId = req.params["sprintId"] as string;
        const orgId = req.orgId as string;
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);

        const result = await getSprintDiscussions(sprintId, orgId, page, limit);

        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles soft deleting a discussion comment.
 */
export const handleDeleteDiscussion = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const discussionId = req.params["discussionId"] as string;
        const userId = req.user?.id as string;
        const orgId = req.orgId as string;

        const result = await deleteSprintDiscussion(
            discussionId,
            userId,
            orgId,
        );

        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};
