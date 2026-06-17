import { Request, Response, NextFunction } from "express";
import {
    createProject,
    getProjectById,
    getAllProjects,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    getProjectMembers,
} from "../application/project.use-cases.js";
import { uploadToS3 } from "../../../shared/utils/s3.js";

export const handleCreateProject = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        let logoUrl = req.body.logoUrl;
        if (req.file) {
            logoUrl = await uploadToS3(req.file);
        }
        const result = await createProject({
            ...req.body,
            logoUrl,
            organizationId: req.orgId as string,
        });
        return res.status(201).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const handleGetProjectById = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await getProjectById(
            req.params["id"] as string,
            req.orgId as string,
            req.user?.id as string,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const handleGetAllProjects = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const page = Number(req.query["page"] ?? 1);
        const limit = Number(req.query["limit"] ?? 10);
        const search = (req.query["search"] as string) ?? undefined;

        const result = await getAllProjects(
            req.orgId as string,
            page,
            limit,
            search,
            req.user?.id,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const handleUpdateProject = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        let logoUrl = req.body.logoUrl;
        if (req.file) {
            logoUrl = await uploadToS3(req.file);
        }
        const result = await updateProject(
            req.params["id"] as string,
            req.orgId as string,
            {
                ...req.body,
                ...(logoUrl !== undefined && { logoUrl }),
            },
            req.user?.id as string,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const handleDeleteProject = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await deleteProject(
            req.params["id"] as string,
            req.orgId as string,
            req.user?.id as string,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const handleAddProjectMember = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await addProjectMember(
            req.params["id"] as string,
            req.orgId as string,
            req.body.orgMemberId,
            req.user?.id as string,
        );
        return res.status(201).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const handleRemoveProjectMember = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await removeProjectMember(
            req.params["id"] as string,
            req.orgId as string,
            req.params["orgMemberId"] as string,
            req.user?.id as string,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const handleGetProjectMembers = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await getProjectMembers(
            req.params["id"] as string,
            req.orgId as string,
            req.user?.id as string,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};
