import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { unauthorizedError } from "../errors/app-error.js";

/**
 * Middleware that verifies the Bearer JWT token on protected routes.
 * Attaches the decoded user payload to `req.user`.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next function.
 */
export const authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        next(unauthorizedError("No token provided"));
        return;
    }

    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
            id: string;
            email: string;
        };
        req.user = { id: decoded.id, email: decoded.email };
        next();
    } catch {
        next(unauthorizedError("Invalid or expired token"));
    }
};
