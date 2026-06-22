import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createWorkItem,
    fetchWorkItems,
    updateWorkItem,
    fetchWorkItemById,
    deleteWorkItem,
    updateWorkItemStatus,
    fetchWorkItemDiscussions,
    createWorkItemDiscussion,
    deleteWorkItemDiscussion,
    fetchWorkItemActivities,
    fetchWorkItemMedia,
    uploadWorkItemMedia,
    deleteWorkItemMedia,
} from "../api/workitem.api";

export const useWorkItemsQuery = (sprintId: string | undefined) => {
    return useQuery({
        queryKey: ["work-items", sprintId],
        queryFn: () => fetchWorkItems({ sprintId: sprintId! }),
        enabled: !!sprintId,
    });
};

export const useUpdateWorkItemMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateWorkItem,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["work-items"] });
            queryClient.invalidateQueries({
                queryKey: ["work-item", variables.id],
            });
        },
    });
};

export const useCreateWorkItemMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createWorkItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["work-items"] });
        },
    });
};

export const useWorkItemQuery = (workItemId: string | undefined) => {
    return useQuery({
        queryKey: ["work-item", workItemId],
        queryFn: () => fetchWorkItemById(workItemId!),
        enabled: !!workItemId,
    });
};

export const useDeleteWorkItemMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWorkItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["work-items"] });
        },
    });
};

export const useUpdateWorkItemStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateWorkItemStatus,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["work-items"] });
            queryClient.invalidateQueries({
                queryKey: ["work-item", variables.id],
            });
        },
    });
};

export const useWorkItemDiscussionsQuery = (workItemId: string | undefined) => {
    return useQuery({
        queryKey: ["work-item-discussions", workItemId],
        queryFn: () => fetchWorkItemDiscussions(workItemId!),
        enabled: !!workItemId,
    });
};

export const useCreateWorkItemDiscussionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createWorkItemDiscussion,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["work-item-discussions", variables.id],
            });
        },
    });
};

export const useDeleteWorkItemDiscussionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWorkItemDiscussion,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["work-item-discussions", variables.id],
            });
        },
    });
};

export const useWorkItemActivitiesQuery = (workItemId: string | undefined) => {
    return useQuery({
        queryKey: ["work-item-activities", workItemId],
        queryFn: () => fetchWorkItemActivities(workItemId!),
        enabled: !!workItemId,
    });
};

export const useWorkItemMediaQuery = (workItemId: string | undefined) => {
    return useQuery({
        queryKey: ["work-item-media", workItemId],
        queryFn: () => fetchWorkItemMedia(workItemId!),
        enabled: !!workItemId,
    });
};

export const useUploadWorkItemMediaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: uploadWorkItemMedia,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["work-item-media", variables.id],
            });
        },
    });
};

export const useDeleteWorkItemMediaMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWorkItemMedia,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["work-item-media", variables.id],
            });
        },
    });
};
