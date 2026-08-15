import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { createError } from "../errors/app-error.js";

/**
 * Higher-order Express middleware factory that validates incoming HTTP request body, query, and params using a Zod schema.
 * @param schema Zod validation schema object.
 * @returns Express middleware handler function.
 */
export const validateRequest = (schema: AnyZodObject) => {
    return async (
        req: Request,
        _res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            req.body = parsed.body;
            req.query = parsed.query;
            req.params = parsed.params;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const message = error.errors
                    .map((err) => `${err.path.join(".")}: ${err.message}`)
                    .join(", ");
                next(createError(message, 400));
            } else {
                next(error);
            }
        }
    };
};
