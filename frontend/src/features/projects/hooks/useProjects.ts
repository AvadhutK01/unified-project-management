import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createProject,
    updateProject,
    deleteProject,
    fetchProjects,
    fetchProjectById,
} from "../api/projects.api";

export const useCreateProjectMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
};

export const useUpdateProjectMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProject,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({
                queryKey: ["project", variables.id],
            });
        },
    });
};

export const useDeleteProjectMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
};

export const useProjectByIdQuery = (id: string | undefined) => {
    return useQuery({
        queryKey: ["project", id],
        queryFn: () => fetchProjectById(id!),
        enabled: !!id,
    });
};

export const useProjectsQuery = (page = 1, search = "") => {
    return useQuery({
        queryKey: ["projects", page, search],
        queryFn: () => fetchProjects({ page, search }),
    });
};
