import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createRole,
    fetchRoleById,
    fetchRolePermissions,
    fetchRoles,
    updateRole,
} from "../api/role.api";

export const useFetchRolePermissionsQuery = () => {
    return useQuery({
        queryKey: ["role_permissions"],
        queryFn: fetchRolePermissions,
    });
};

export const useCreateRoleMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });
};

export const useFetchRolesQuery = () => {
    return useQuery({
        queryKey: ["roles"],
        queryFn: fetchRoles,
    });
};

export const useFetchRoleByIdQuery = (roleId: string) => {
    return useQuery({
        queryKey: ["roles", roleId],
        queryFn: () => fetchRoleById(roleId),
    });
};

export const useUpdateRoleMutation = (roleId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: {
            name: string;
            description?: string;
            permissionIds: string[];
        }) => updateRole(roleId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });
};
