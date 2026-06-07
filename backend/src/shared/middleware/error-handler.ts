import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { AppError } from "../errors/app-error.js";
import { logger } from "../../config/logger.js";

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    if (err instanceof multer.MulterError) {
        let message = err.message;
        if (err.code === "LIMIT_FILE_SIZE") {
            message = "File is too large. Maximum size allowed is 5MB.";
        }
        logger.warn({ err }, `Multer error: ${message}`);
        res.status(400).json({
            status: "error",
            message,
        });
        return;
    }

    if (err instanceof AppError && err.isOperational) {
        logger.warn({ err }, `Operational error: ${err.message}`);
        res.status(err.statusCode).json({
            status: "error",
            message: err.message,
        });
        return;
    }

    logger.error({ err }, "Unhandled application error");
    res.status(500).json({
        status: "error",
        message: "Something went wrong",
    });
};
