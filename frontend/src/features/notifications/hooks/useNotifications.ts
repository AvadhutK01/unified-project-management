import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
} from "../api/notification.api";

export const useNotificationsQuery = (limit = 10) => {
    return useInfiniteQuery({
        queryKey: ["notifications"],
        queryFn: ({ pageParam = 1 }) => getNotifications(pageParam, limit),
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.page < lastPage.pagination.totalPages) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });
};

export const useMarkAsReadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export const useMarkAllAsReadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};
