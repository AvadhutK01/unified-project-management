import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
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

export const useSprintsQuery = (phaseId: string | undefined, page = 1) => {
    return useQuery({
        queryKey: ["sprints", phaseId, page],
        queryFn: () => fetchSprints({ phaseId: phaseId!, page }),
        enabled: !!phaseId,
    });
};

export const useUpdateSprintMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateSprint,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["sprints"] });
            queryClient.invalidateQueries({ queryKey: ["sprints-kanban"] });
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
            queryClient.invalidateQueries({ queryKey: ["sprints-kanban"] });
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
            queryClient.invalidateQueries({ queryKey: ["sprints-kanban"] });
        },
    });
};

export const useSprintActivitiesInfiniteQuery = (
    sprintId: string | undefined,
    limit = 50,
) => {
    return useInfiniteQuery({
        queryKey: ["sprint-activities", sprintId],
        queryFn: ({ pageParam }) =>
            fetchSprintActivities(sprintId!, pageParam, limit),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.data?.pagination;
            if (!pagination || pagination.page >= pagination.totalPages) {
                return undefined;
            }
            return pagination.page + 1;
        },
        enabled: !!sprintId,
    });
};

export const useSprintDiscussionsInfiniteQuery = (
    sprintId: string | undefined,
    limit = 50,
) => {
    return useInfiniteQuery({
        queryKey: ["sprint-discussions", sprintId],
        queryFn: ({ pageParam }) =>
            fetchSprintDiscussions(sprintId!, pageParam, limit),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.data?.pagination;
            if (!pagination || pagination.page >= pagination.totalPages) {
                return undefined;
            }
            return pagination.page + 1;
        },
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

export const useSprintMediaInfiniteQuery = (
    sprintId: string | undefined,
    limit = 50,
) => {
    return useInfiniteQuery({
        queryKey: ["sprint-media", sprintId],
        queryFn: ({ pageParam }) =>
            fetchSprintMedia(sprintId!, pageParam, limit),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.data?.pagination;
            if (!pagination || pagination.page >= pagination.totalPages) {
                return undefined;
            }
            return pagination.page + 1;
        },
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
