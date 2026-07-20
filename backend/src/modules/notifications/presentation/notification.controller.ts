import { Request, Response, NextFunction } from "express";
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
} from "../application/notification.use-cases.js";

export const handleGetNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const orgId = req.orgId;
        if (!orgId) {
            res.status(400).json({ message: "Organization ID is required" });
            return;
        }
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 10);
        const result = await getUserNotifications(userId, orgId, page, limit);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const handleMarkAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { id } = req.params as { id: string };
        const result = await markAsRead(id, userId);
        res.status(200).json({ data: result });
    } catch (error) {
        next(error);
    }
};

export const handleMarkAllAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const orgId = req.orgId;
        if (!orgId) {
            res.status(400).json({ message: "Organization ID is required" });
            return;
        }
        const result = await markAllAsRead(userId, orgId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
