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
    let token: string | undefined = undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
    } else if (req.query && typeof req.query["token"] === "string") {
        token = req.query["token"] as string;
    }

    if (!token) {
        next(unauthorizedError("No token provided"));
        return;
    }
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
