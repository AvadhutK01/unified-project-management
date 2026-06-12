import { api } from "@/lib/axios";

/**
 * Fetch all permissions for all roles.
 *
 * @returns The API response containing the list of permissions for all roles.
 */
export const fetchRolePermissions = async () => {
    const { data } = await api.get("/roles/permissions/all");
    return data;
};

/**
 * Create a new role.
 *
 * @param payload The role details.
 * @returns The API response containing the created role.
 */
export const createRole = async (payload: {
    name: string;
    description?: string;
    permissionIds: string[];
}) => {
    const { data } = await api.post("/roles", payload);
    return data;
};

/**
 * Fetch all roles for the current organization.
 *
 * @returns The API response containing the list of roles for the current organization.
 */
export const fetchRoles = async () => {
    const { data } = await api.get("/roles");
    return data;
};

/**
 * Fetch a role by its ID.
 *
 * @param roleId The ID of the role to fetch.
 * @returns The API response containing the role details.
 */
export const fetchRoleById = async (roleId: string) => {
    const { data } = await api.get(`/roles/${roleId}`);
    return data;
};

/**
 * Update a role by its ID.
 *
 * @param roleId    The ID of the role to update.
 * @param payload   The updated role details.
 * @returns     The API response containing the updated role.
 */
export const updateRole = async (
    roleId: string,
    payload: {
        name: string;
        description?: string;
        permissionIds: string[];
    },
) => {
    const { data } = await api.put(`/roles/${roleId}`, payload);
    return data;
};
