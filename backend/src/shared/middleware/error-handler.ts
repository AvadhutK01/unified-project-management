import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { logger } from "../../config/logger.js";

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
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
