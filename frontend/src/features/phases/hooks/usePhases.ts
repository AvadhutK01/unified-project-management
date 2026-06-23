import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createPhase,
    updatePhase,
    deletePhase,
    fetchPhases,
    fetchPhaseById,
} from "../api/phases.api";

export const usePhasesQuery = (
    projectId: string | undefined,
    search = "",
    page = 1,
) => {
    return useQuery({
        queryKey: ["phases", projectId, search, page],
        queryFn: () => fetchPhases({ projectId: projectId!, search, page }),
        enabled: !!projectId,
    });
};

export const usePhaseByIdQuery = (phaseId: string | undefined) => {
    return useQuery({
        queryKey: ["phase", phaseId],
        queryFn: () => fetchPhaseById(phaseId!),
        enabled: !!phaseId,
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
