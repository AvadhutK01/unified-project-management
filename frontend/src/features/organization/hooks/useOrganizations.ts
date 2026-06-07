import { useMutation, useQuery } from "@tanstack/react-query";
import {
    createOrganization,
    fetchOrganizations,
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
