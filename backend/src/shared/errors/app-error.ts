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

/**
 * Creates a generic operational AppError instance.
 * @param message Error message text.
 * @param statusCode HTTP status code (default 500).
 * @param isOperational Flag indicating operational error status.
 * @returns AppError instance.
 */
export const createError = (
    message: string,
    statusCode = 500,
    isOperational = true,
): AppError => {
    return new AppError(message, statusCode, isOperational);
};

/**
 * Helper to construct a 400 Bad Request AppError.
 * @param message Error message text.
 * @returns AppError with status code 400.
 */
export const badRequestError = (message = "Bad Request"): AppError => {
    return createError(message, 400);
};

/**
 * Helper to construct a 401 Unauthorized AppError.
 * @param message Error message text.
 * @returns AppError with status code 401.
 */
export const unauthorizedError = (message = "Unauthorized"): AppError => {
    return createError(message, 401);
};

/**
 * Helper to construct a 403 Forbidden AppError.
 * @param message Error message text.
 * @returns AppError with status code 403.
 */
export const forbiddenError = (message = "Forbidden"): AppError => {
    return createError(message, 403);
};

/**
 * Helper to construct a 404 Not Found AppError.
 * @param message Error message text.
 * @returns AppError with status code 404.
 */
export const notFoundError = (message = "Not Found"): AppError => {
    return createError(message, 404);
};

/**
 * Helper to construct a 500 Internal Server Error AppError.
 * @param message Error message text.
 * @returns AppError with status code 500.
 */
export const internalServerError = (
    message = "Internal Server Error",
): AppError => {
    return createError(message, 500);
};
