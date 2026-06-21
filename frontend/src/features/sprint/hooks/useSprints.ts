import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createSprint,
    fetchSprints,
    updateSprint,
    fetchSprintById,
    deleteSprint,
    fetchSprintActivities,
    fetchSprintDiscussions,
    createSprintDiscussion,
    deleteSprintDiscussion,
    fetchSprintMedia,
    uploadSprintMedia,
    deleteSprintMedia,
} from "../api/sprint.api";

export const useSprintsQuery = (phaseId: string | undefined) => {
    return useQuery({
        queryKey: ["sprints", phaseId],
        queryFn: () => fetchSprints({ phaseId: phaseId! }),
        enabled: !!phaseId,
    });
};

export const useUpdateSprintMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateSprint,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["sprints"] });
            queryClient.invalidateQueries({
                queryKey: ["sprint", variables.id],
            });
            queryClient.invalidateQueries({
                queryKey: ["sprint-activities", variables.id],
            });
        },
    });
};

export const useCreateSprintMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createSprint,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sprints"] });
        },
    });
};

export const useSprintQuery = (sprintId: string | undefined) => {
    return useQuery({
        queryKey: ["sprint", sprintId],
        queryFn: () => fetchSprintById(sprintId!),
        enabled: !!sprintId,
    });
};

export const useDeleteSprintMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSprint,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sprints"] });
        },
    });
};

export const useSprintActivitiesQuery = (
    sprintId: string | undefined,
    page = 1,
    limit = 50,
) => {
    return useQuery({
        queryKey: ["sprint-activities", sprintId, page, limit],
        queryFn: () => fetchSprintActivities(sprintId!, page, limit),
        enabled: !!sprintId,
    });
};

export const useSprintDiscussionsQuery = (
    sprintId: string | undefined,
    page = 1,
    limit = 50,
) => {
    return useQuery({
        queryKey: ["sprint-discussions", sprintId, page, limit],
        queryFn: () => fetchSprintDiscussions(sprintId!, page, limit),
        enabled: !!sprintId,
    });
};

export const useCreateSprintDiscussionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createSprintDiscussion,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["sprint-discussions", variables.sprintId],
            });
            queryClient.invalidateQueries({
                queryKey: ["sprint-activities", variables.sprintId],
            });
        },
    });
};

export const useDeleteSprintDiscussionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSprintDiscussion,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["sprint-discussions", variables.sprintId],
            });
            queryClient.invalidateQueries({
                queryKey: ["sprint-activities", variables.sprintId],
            });
        },
    });
};

export const useSprintMediaQuery = (
    sprintId: string | undefined,
    page = 1,
    limit = 50,
) => {
    return useQuery({
        queryKey: ["sprint-media", sprintId, page, limit],
        queryFn: () => fetchSprintMedia(sprintId!, page, limit),
        enabled: !!sprintId,
    });
};

export const useUploadSprintMediaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: uploadSprintMedia,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["sprint-media", variables.sprintId],
            });
            queryClient.invalidateQueries({
                queryKey: ["sprint-activities", variables.sprintId],
            });
        },
    });
};

export const useDeleteSprintMediaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSprintMedia,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["sprint-media", variables.sprintId],
            });
            queryClient.invalidateQueries({
                queryKey: ["sprint-activities", variables.sprintId],
            });
        },
    });
};
