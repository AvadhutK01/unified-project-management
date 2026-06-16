import { Request, Response, NextFunction } from "express";
import { badRequestError } from "../errors/app-error.js";

/**
 * Middleware that requires the presence of `org_id` in headers.
 * Validates that it is a valid UUID format.
 * Attaches the value to `req.orgId`.
 */
export const requireOrgId = (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    const orgId = req.headers.org_id || req.headers["org_id"];

    if (!orgId) {
        next(
            badRequestError("Organization ID (org_id) is required in headers"),
        );
        return;
    }

    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (typeof orgId !== "string" || !uuidRegex.test(orgId)) {
        next(badRequestError("Invalid Organization ID format"));
        return;
    }

    req.orgId = orgId;
    next();
};
