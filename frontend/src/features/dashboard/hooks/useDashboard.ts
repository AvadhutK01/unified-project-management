import { useMutation, useQuery } from "@tanstack/react-query";
import {
    fetchDashboardData,
    fetchDashboardSummary,
} from "../api/dashboard.api";

export const useDashboardQuery = () => {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: fetchDashboardData,
    });
};

export const useDashboardSummaryMutation = () => {
    return useMutation({
        mutationFn: fetchDashboardSummary,
    });
};
