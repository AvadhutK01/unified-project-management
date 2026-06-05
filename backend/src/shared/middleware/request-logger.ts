import { Request, Response, NextFunction } from "express";
import { logger } from "../../config/logger.js";

/**
 * HTTP request logging middleware.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 */
export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        const level =
            res.statusCode >= 500
                ? "error"
                : res.statusCode >= 400
                  ? "warn"
                  : "info";

        logger[level](
            {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                durationMs: duration,
            },
            `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
        );
    });

    next();
};
