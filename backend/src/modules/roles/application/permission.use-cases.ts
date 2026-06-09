import {
    findAllPermissions,
    countAllPermissions,
} from "../infrastructure/permission.repository.js";

/**
 * Retrieves all permissions with pagination and optional search filter.
 * @param page The page number.
 * @param limit The limit number.
 * @param search Optional search keyword.
 * @returns An object containing the data and pagination details.
 */
export const getAllPermissions = async (
    page: number = 1,
    limit: number = 10,
    search?: string,
) => {
    const [data, total] = await Promise.all([
        findAllPermissions(page, limit, search),
        countAllPermissions(search),
    ]);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
