import { api } from "@/lib/axios";
import type {
    ProjectOverviewResponse,
    SprintPerformanceResponse,
    PhaseOverviewResponse,
    MemberActivityResponse,
} from "../types/reports.types";

export const fetchProjectOverview = async ({
    startDate,
    endDate,
}: {
    startDate: string;
    endDate: string;
}): Promise<ProjectOverviewResponse> => {
    const { data } = await api.get<ProjectOverviewResponse>(
        "/reports/project-overview",
        {
            params: { startDate, endDate },
        },
    );
    return data;
};

export const fetchSprintPerformance = async ({
    startDate,
    endDate,
}: {
    startDate: string;
    endDate: string;
}): Promise<SprintPerformanceResponse> => {
    const { data } = await api.get<SprintPerformanceResponse>(
        "/reports/sprint-performance",
        {
            params: { startDate, endDate },
        },
    );
    return data;
};

export const fetchPhaseOverview = async ({
    startDate,
    endDate,
}: {
    startDate: string;
    endDate: string;
}): Promise<PhaseOverviewResponse> => {
    const { data } = await api.get<PhaseOverviewResponse>(
        "/reports/phase-overview",
        {
            params: { startDate, endDate },
        },
    );
    return data;
};

export const fetchMemberActivity = async ({
    startDate,
    endDate,
}: {
    startDate: string;
    endDate: string;
}): Promise<MemberActivityResponse> => {
    const { data } = await api.get<MemberActivityResponse>(
        "/reports/member-activity",
        {
            params: { startDate, endDate },
        },
    );
    return data;
};
