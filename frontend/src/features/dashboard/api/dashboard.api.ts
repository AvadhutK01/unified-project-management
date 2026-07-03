import { api } from "@/lib/axios";
import type {
    DashboardResponse,
    DashboardSummaryResponse,
} from "../types/dashboard.types";

export const fetchDashboardData = async () => {
    const { data } = await api.get<DashboardResponse>(
        "/dashboards/organizations",
    );
    return data.data;
};

export const fetchDashboardSummary = async () => {
    const { data } = await api.get<DashboardSummaryResponse>(
        "/dashboards/organizations/summary",
    );
    return data.summary;
};
