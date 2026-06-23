import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchWorkItems, mapWorkItem } from "../api/workitem.api";
import { WORK_ITEM_STATUSES } from "../constants/workitem.constants";
import type { WorkItem, WorkItemStatus } from "../types/workitem.types";

type StatusMap<T> = Record<WorkItemStatus, T>;

const INITIAL_LIMIT = 10;

function useWorkItemsByStatusQuery(
    sprintId: string | undefined,
    status: WorkItemStatus,
) {
    return useInfiniteQuery({
        queryKey: ["work-items-kanban", sprintId, status],
        queryFn: ({ pageParam = 1 }) =>
            fetchWorkItems({
                sprintId: sprintId!,
                page: pageParam,
                limit: INITIAL_LIMIT,
                status,
            }),
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.data?.pagination;
            if (!pagination || pagination.page >= pagination.totalPages) {
                return undefined;
            }
            return pagination.page + 1;
        },
        initialPageParam: 1,
        enabled: !!sprintId,
    });
}

interface UseWorkItemsKanbanResult {
    itemsByStatus: StatusMap<WorkItem[]>;
    loading: StatusMap<boolean>;
    hasMore: StatusMap<boolean>;
    loadMore: (status: WorkItemStatus) => void;
}

export const useWorkItemsKanban = (
    sprintId: string | undefined,
): UseWorkItemsKanbanResult => {
    const newQuery = useWorkItemsByStatusQuery(sprintId, "new");
    const activeQuery = useWorkItemsByStatusQuery(sprintId, "active");
    const resolvedQuery = useWorkItemsByStatusQuery(sprintId, "resolved");
    const closedQuery = useWorkItemsByStatusQuery(sprintId, "closed");
    const removedQuery = useWorkItemsByStatusQuery(sprintId, "removed");
    const onholdQuery = useWorkItemsByStatusQuery(sprintId, "onhold");

    const queries: Record<WorkItemStatus, typeof newQuery> = {
        new: newQuery,
        active: activeQuery,
        resolved: resolvedQuery,
        closed: closedQuery,
        removed: removedQuery,
        onhold: onholdQuery,
    };

    const itemsByStatus = useMemo(() => {
        const map = {} as StatusMap<WorkItem[]>;
        for (const st of WORK_ITEM_STATUSES) {
            const raw =
                queries[st].data?.pages.flatMap((p) => p?.data?.data ?? []) ??
                [];
            map[st] = raw.map(mapWorkItem);
        }
        return map;
    }, [
        newQuery.data,
        activeQuery.data,
        resolvedQuery.data,
        closedQuery.data,
        removedQuery.data,
        onholdQuery.data,
    ]);

    const loading = useMemo(() => {
        const map = {} as StatusMap<boolean>;
        for (const st of WORK_ITEM_STATUSES) {
            map[st] = queries[st].isFetching;
        }
        return map;
    }, [
        newQuery.isFetching,
        activeQuery.isFetching,
        resolvedQuery.isFetching,
        closedQuery.isFetching,
        removedQuery.isFetching,
        onholdQuery.isFetching,
    ]);

    const hasMore = useMemo(() => {
        const map = {} as StatusMap<boolean>;
        for (const st of WORK_ITEM_STATUSES) {
            map[st] = !!queries[st].hasNextPage;
        }
        return map;
    }, [
        newQuery.hasNextPage,
        activeQuery.hasNextPage,
        resolvedQuery.hasNextPage,
        closedQuery.hasNextPage,
        removedQuery.hasNextPage,
        onholdQuery.hasNextPage,
    ]);

    const loadMore = (status: WorkItemStatus) => {
        queries[status].fetchNextPage();
    };

    return {
        itemsByStatus,
        loading,
        hasMore,
        loadMore,
    };
};
