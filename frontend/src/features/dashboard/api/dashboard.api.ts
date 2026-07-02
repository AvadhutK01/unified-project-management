import { api } from "@/lib/axios";
import type { DashboardResponse } from "../types/dashboard.types";

export const fetchDashboardData = async () => {
    const { data } = await api.get<DashboardResponse>(
        "/dashboards/organizations",
    );
    return data.data;
};
