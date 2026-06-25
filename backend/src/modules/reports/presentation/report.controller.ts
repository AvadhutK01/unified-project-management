import { Request, Response, NextFunction } from "express";
import {
    generateProjectOverviewReport,
    generateSprintPerformanceReport,
    generateWorkitemAnalyticsReport,
    generateMemberActivityReport,
    generateResourceAllocationReport,
} from "../application/report.use-cases.js";

export const getProjectOverviewHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const orgId = req.orgId as string;
        const { startDate, endDate } = req.query as {
            startDate: string;
            endDate: string;
        };
        const result = await generateProjectOverviewReport(
            orgId,
            startDate,
            endDate,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const getSprintPerformanceHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const orgId = req.orgId as string;
        const { startDate, endDate } = req.query as {
            startDate: string;
            endDate: string;
        };
        const result = await generateSprintPerformanceReport(
            orgId,
            startDate,
            endDate,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const getWorkitemAnalyticsHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const orgId = req.orgId as string;
        const { startDate, endDate } = req.query as {
            startDate: string;
            endDate: string;
        };
        const result = await generateWorkitemAnalyticsReport(
            orgId,
            startDate,
            endDate,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const getMemberActivityHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const orgId = req.orgId as string;
        const { startDate, endDate } = req.query as {
            startDate: string;
            endDate: string;
        };
        const result = await generateMemberActivityReport(
            orgId,
            startDate,
            endDate,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const getResourceAllocationHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const orgId = req.orgId as string;
        const { startDate, endDate } = req.query as {
            startDate: string;
            endDate: string;
        };
        const result = await generateResourceAllocationReport(
            orgId,
            startDate,
            endDate,
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};
