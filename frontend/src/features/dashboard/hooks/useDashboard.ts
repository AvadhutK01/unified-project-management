import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "../api/dashboard.api";

export const useDashboardQuery = () => {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: fetchDashboardData,
    });
};
