import { Request, Response, NextFunction } from "express";
import {
    getDirectChatHistoryUseCase,
    markDirectChatAsReadUseCase,
    uploadDirectChatAttachmentUseCase,
} from "../application/chat.use-cases.js";

/**
 * Express handler to fetch paginated direct chat history between the current user and a recipient member.
 */
export const handleGetDirectChatHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = (req as any).user!.id as string;
        const orgId = (req as any).orgId! as string;
        const recipientId = req.params.recipientId as string;
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 10);

        const result = await getDirectChatHistoryUseCase(
            orgId,
            userId,
            recipientId,
            page,
            limit,
        );

        res.status(200).json({
            status: "success",
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Express handler to mark direct messages sent by a specific member as read.
 */
export const handleMarkDirectChatRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = (req as any).user!.id as string;
        const orgId = (req as any).orgId! as string;
        const senderId = req.params.senderId as string;

        const result = await markDirectChatAsReadUseCase(
            orgId,
            userId,
            senderId,
        );

        res.status(200).json({
            status: "success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Express handler to upload an attachment file for direct 1-to-1 chat messaging.
 */
export const handleUploadDirectChatAttachment = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = (req as any).user!.id as string;
        const orgId = (req as any).orgId! as string;
        const file = req.file;

        const attachment = await uploadDirectChatAttachmentUseCase(
            orgId,
            userId,
            file!,
        );

        res.status(200).json({
            status: "success",
            data: attachment,
        });
    } catch (error) {
        next(error);
    }
};
