import { Request, Response, NextFunction } from "express";
import {
    getOrganizationDashboard,
    getProjectDashboard,
    getPhaseDashboard,
    getOrganizationDashboardSummary,
    getProjectDashboardSummary,
    getPhaseDashboardSummary,
} from "../application/dashboard.use-cases.js";

export const handleGetOrganizationDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await getOrganizationDashboard(req.orgId!, req.user!.id);
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const handleGetProjectDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await getProjectDashboard(
            req.params["projectId"] as string,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const handleGetPhaseDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await getPhaseDashboard(req.params["phaseId"] as string);
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const handleGetOrganizationSummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await getOrganizationDashboardSummary(
            req.orgId!,
            req.user!.id,
        );
        return res.status(200).json({ status: "success", summary: result });
    } catch (error) {
        next(error);
    }
};

export const handleGetProjectSummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await getProjectDashboardSummary(
            req.params["projectId"] as string,
        );
        return res.status(200).json({ status: "success", summary: result });
    } catch (error) {
        next(error);
    }
};

export const handleGetPhaseSummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const result = await getPhaseDashboardSummary(
            req.params["phaseId"] as string,
        );
        return res.status(200).json({ status: "success", summary: result });
    } catch (error) {
        next(error);
    }
};
