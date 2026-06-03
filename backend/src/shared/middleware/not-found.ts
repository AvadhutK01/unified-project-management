import { Request, Response, NextFunction } from "express";
import { notFoundError } from "../errors/app-error.js";

export const notFound = (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    next(
        notFoundError(
            `Cannot find ${req.method} ${req.originalUrl} on this server`,
        ),
    );
};
