import {
    getProjectOverview,
    getSprintPerformance,
    getMemberActivity,
    getPhaseOverview,
} from "../infrastructure/report.repository.js";

export const generateProjectOverviewReport = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    return await getProjectOverview(orgId, startDate, endDate);
};

export const generateSprintPerformanceReport = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    return await getSprintPerformance(orgId, startDate, endDate);
};

export const generateMemberActivityReport = async (
    orgId: string,
    startDate: string,
    endDate: string,
    memberId?: string,
) => {
    return await getMemberActivity(orgId, startDate, endDate, memberId);
};

export const generatePhaseOverviewReport = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    return await getPhaseOverview(orgId, startDate, endDate);
};
