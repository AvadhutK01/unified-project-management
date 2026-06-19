import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createPhase,
    updatePhase,
    deletePhase,
    fetchPhases,
} from "../api/phases.api";

export const usePhasesQuery = (projectId: string | undefined, search = "") => {
    return useQuery({
        queryKey: ["phases", projectId, search],
        queryFn: () => fetchPhases({ projectId: projectId!, search }),
        enabled: !!projectId,
    });
};

export const useCreatePhaseMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPhase,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["phases"] });
        },
    });
};

export const useDeletePhaseMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePhase,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["phases"] });
        },
    });
};

export const useUpdatePhaseMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updatePhase,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["phases"] });
            queryClient.invalidateQueries({
                queryKey: ["phase", String(variables.id)],
            });
        },
    });
};
