export class AppError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number = 500,
        public readonly isOperational: boolean = true,
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export const createError = (
    message: string,
    statusCode = 500,
    isOperational = true,
): AppError => {
    return new AppError(message, statusCode, isOperational);
};

export const badRequestError = (message = "Bad Request"): AppError => {
    return createError(message, 400);
};

export const unauthorizedError = (message = "Unauthorized"): AppError => {
    return createError(message, 401);
};

export const forbiddenError = (message = "Forbidden"): AppError => {
    return createError(message, 403);
};

export const notFoundError = (message = "Not Found"): AppError => {
    return createError(message, 404);
};

export const internalServerError = (
    message = "Internal Server Error",
): AppError => {
    return createError(message, 500);
};
