import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createOrganization,
    fetchOrganizations,
    updateOrganization,
} from "../api/organization.api";

export const useOrganizationsQuery = () => {
    return useQuery({
        queryKey: ["organizations"],
        queryFn: fetchOrganizations,
    });
};

export const useOrganizationMutation = () => {
    return useMutation({
        mutationFn: createOrganization,
    });
};

export const useUpdateOrganization = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: Parameters<typeof updateOrganization>[1];
        }) => updateOrganization(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
        },
    });
};
