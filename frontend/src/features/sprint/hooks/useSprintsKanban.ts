import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSprints } from "../api/sprint.api";
import { SPRINT_STATUSES } from "../constants/sprint.constants";
import type { SprintItem, SprintStatus } from "../types/sprint.types";

type StatusMap<T> = Record<SprintStatus, T>;

const INITIAL_LIMIT = 10;

function useSprintsByStatusQuery(
    phaseId: string | undefined,
    status: SprintStatus,
) {
    return useInfiniteQuery({
        queryKey: ["sprints-kanban", phaseId, status],
        queryFn: ({ pageParam = 1 }) =>
            fetchSprints({
                phaseId: phaseId!,
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
        enabled: !!phaseId,
    });
}

interface UseSprintsKanbanResult {
    itemsByStatus: StatusMap<SprintItem[]>;
    loading: StatusMap<boolean>;
    hasMore: StatusMap<boolean>;
    loadMore: (status: SprintStatus) => void;
}

export const useSprintsKanban = (
    phaseId: string | undefined,
): UseSprintsKanbanResult => {
    const newQuery = useSprintsByStatusQuery(phaseId, "new");
    const activeQuery = useSprintsByStatusQuery(phaseId, "active");
    const closedQuery = useSprintsByStatusQuery(phaseId, "closed");
    const removedQuery = useSprintsByStatusQuery(phaseId, "removed");
    const onholdQuery = useSprintsByStatusQuery(phaseId, "onhold");

    const queries: Record<SprintStatus, typeof newQuery> = {
        new: newQuery,
        active: activeQuery,
        closed: closedQuery,
        removed: removedQuery,
        onhold: onholdQuery,
    };

    const itemsByStatus = useMemo(() => {
        const map = {} as StatusMap<SprintItem[]>;
        for (const st of SPRINT_STATUSES) {
            map[st] =
                queries[st].data?.pages.flatMap((p) => p?.data?.data ?? []) ??
                [];
        }
        return map;
    }, [
        newQuery.data,
        activeQuery.data,
        closedQuery.data,
        removedQuery.data,
        onholdQuery.data,
    ]);

    const loading = useMemo(() => {
        const map = {} as StatusMap<boolean>;
        for (const st of SPRINT_STATUSES) {
            map[st] = queries[st].isFetching;
        }
        return map;
    }, [
        newQuery.isFetching,
        activeQuery.isFetching,
        closedQuery.isFetching,
        removedQuery.isFetching,
        onholdQuery.isFetching,
    ]);

    const hasMore = useMemo(() => {
        const map = {} as StatusMap<boolean>;
        for (const st of SPRINT_STATUSES) {
            map[st] = !!queries[st].hasNextPage;
        }
        return map;
    }, [
        newQuery.hasNextPage,
        activeQuery.hasNextPage,
        closedQuery.hasNextPage,
        removedQuery.hasNextPage,
        onholdQuery.hasNextPage,
    ]);

    const loadMore = (status: SprintStatus) => {
        queries[status].fetchNextPage();
    };

    return {
        itemsByStatus,
        loading,
        hasMore,
        loadMore,
    };
};
