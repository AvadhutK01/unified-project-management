import { useQuery } from "@tanstack/react-query";
import {
    fetchProjectOverview,
    fetchSprintPerformance,
    fetchPhaseOverview,
    fetchMemberActivity,
} from "../api/reports.api";

export const useProjectOverviewQuery = ({
    startDate,
    endDate,
}: {
    startDate: string;
    endDate: string;
}) => {
    return useQuery({
        queryKey: ["reports", "project-overview", startDate, endDate],
        queryFn: () => fetchProjectOverview({ startDate, endDate }),
        enabled: !!startDate && !!endDate,
    });
};

export const useSprintPerformanceQuery = ({
    startDate,
    endDate,
}: {
    startDate: string;
    endDate: string;
}) => {
    return useQuery({
        queryKey: ["reports", "sprint-performance", startDate, endDate],
        queryFn: () => fetchSprintPerformance({ startDate, endDate }),
        enabled: !!startDate && !!endDate,
    });
};

export const usePhaseOverviewQuery = ({
    startDate,
    endDate,
}: {
    startDate: string;
    endDate: string;
}) => {
    return useQuery({
        queryKey: ["reports", "phase-overview", startDate, endDate],
        queryFn: () => fetchPhaseOverview({ startDate, endDate }),
        enabled: !!startDate && !!endDate,
    });
};

export const useMemberActivityQuery = ({
    startDate,
    endDate,
}: {
    startDate: string;
    endDate: string;
}) => {
    return useQuery({
        queryKey: ["reports", "member-activity", startDate, endDate],
        queryFn: () => fetchMemberActivity({ startDate, endDate }),
        enabled: !!startDate && !!endDate,
    });
};
