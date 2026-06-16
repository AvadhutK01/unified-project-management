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
export const getAllPermissions = async (search?: string) => {
    return findAllPermissions(search);
};
