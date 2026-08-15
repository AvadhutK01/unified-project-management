import { Request, Response, NextFunction } from "express";
import {
    createWorkitem,
    getWorkitemById,
    getAllWorkitems,
    updateWorkitem,
    updateWorkitemStatus,
    deleteWorkitem,
    getWorkitemActivities,
} from "../application/workitem.use-cases.js";
import {
    createWorkitemDiscussion,
    updateWorkitemDiscussion,
    getWorkitemDiscussions,
    deleteWorkitemDiscussion,
} from "../application/workitem-discussion.use-cases.js";
import {
    uploadWorkitemMedia,
    getWorkitemMediaList,
    deleteWorkitemMedia,
} from "../application/workitem-media.use-cases.js";

export const handleCreateWorkitem = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const organizationId = req.orgId as string;
        const userId = req.user?.id as string;
        const workitem = await createWorkitem({
            ...req.body,
            organizationId,
            userId,
        });
        return res.status(201).json({ status: "success", data: workitem });
    } catch (error) {
        next(error);
    }
};

export const handleGetWorkitemById = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const id = req.params["id"] as string;
        const organizationId = req.orgId as string;
        const userId = req.user?.id as string;
        const workitem = await getWorkitemById(id, organizationId, userId);
        return res.status(200).json({ status: "success", data: workitem });
    } catch (error) {
        next(error);
    }
};

export const handleGetAllWorkitems = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const organizationId = req.orgId as string;
        const userId = req.user?.id as string;
        const sprintId = req.query["sprintId"] as string;
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);
        const search = (req.query["search"] as string) ?? undefined;
        const status = (req.query["status"] as string) ?? undefined;

        const result = await getAllWorkitems(
            sprintId,
            organizationId,
            userId,
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

export const handleUpdateWorkitem = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const id = req.params["id"] as string;
        const organizationId = req.orgId as string;
        const userId = req.user?.id as string;
        const workitem = await updateWorkitem(
            id,
            organizationId,
            userId,
            req.body,
        );
        return res.status(200).json({ status: "success", data: workitem });
    } catch (error) {
        next(error);
    }
};

export const handleUpdateWorkitemStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const id = req.params["id"] as string;
        const organizationId = req.orgId as string;
        const userId = req.user?.id as string;
        const { status } = req.body;
        const workitem = await updateWorkitemStatus(
            id,
            organizationId,
            userId,
            status,
        );
        return res.status(200).json({ status: "success", data: workitem });
    } catch (error) {
        next(error);
    }
};

export const handleDeleteWorkitem = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const id = req.params["id"] as string;
        const organizationId = req.orgId as string;
        const userId = req.user?.id as string;
        await deleteWorkitem(id, organizationId, userId);
        return res.status(200).json({ status: "success" });
    } catch (error) {
        next(error);
    }
};

export const handleCreateWorkitemDiscussion = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const id = req.params["id"] as string;
        const { comment, taggedMemberIds } = req.body;
        const orgId = req.orgId as string;
        const userId = req.user?.id as string;

        const discussion = await createWorkitemDiscussion(
            id,
            userId,
            orgId,
            comment,
            taggedMemberIds,
        );
        return res.status(201).json({ status: "success", data: discussion });
    } catch (error) {
        next(error);
    }
};

export const handleUpdateWorkitemDiscussion = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const discussionId = req.params["discussionId"] as string;
        const { comment, taggedMemberIds } = req.body;
        const orgId = req.orgId as string;
        const userId = req.user?.id as string;

        const discussion = await updateWorkitemDiscussion(
            discussionId,
            userId,
            orgId,
            comment,
            taggedMemberIds,
        );
        return res.status(200).json({ status: "success", data: discussion });
    } catch (error) {
        next(error);
    }
};

export const handleGetWorkitemDiscussions = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const id = req.params["id"] as string;
        const orgId = req.orgId as string;
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);

        const result = await getWorkitemDiscussions(id, orgId, page, limit);
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const handleDeleteWorkitemDiscussion = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const discussionId = req.params["discussionId"] as string;
        const orgId = req.orgId as string;
        const userId = req.user?.id as string;

        await deleteWorkitemDiscussion(discussionId, userId, orgId);
        return res.status(200).json({ status: "success" });
    } catch (error) {
        next(error);
    }
};

export const handleGetWorkitemActivities = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const id = req.params["id"] as string;
        const organizationId = req.orgId as string;
        const userId = req.user?.id as string;
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);

        const result = await getWorkitemActivities(
            id,
            organizationId,
            userId,
            page,
            limit,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const handleUploadWorkitemMedia = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const id = req.params["id"] as string;
        const orgId = req.orgId as string;
        const userId = req.user?.id as string;
        const file = req.file;

        const media = await uploadWorkitemMedia(id, userId, orgId, file);
        return res.status(201).json({ status: "success", data: media });
    } catch (error) {
        next(error);
    }
};

export const handleGetWorkitemMediaList = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const id = req.params["id"] as string;
        const orgId = req.orgId as string;
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);
        const search = (req.query["search"] as string) ?? undefined;

        const result = await getWorkitemMediaList(
            id,
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

export const handleDeleteWorkitemMedia = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const mediaId = req.params["mediaId"] as string;
        const orgId = req.orgId as string;
        const userId = req.user?.id as string;

        await deleteWorkitemMedia(mediaId, userId, orgId);
        return res.status(200).json({ status: "success" });
    } catch (error) {
        next(error);
    }
};
