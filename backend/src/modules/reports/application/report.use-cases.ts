import {
    getProjectOverview,
    getSprintPerformance,
    getWorkitemAnalytics,
    getMemberActivity,
    getResourceAllocation,
} from "../infrastructure/report.repository.js";
import { findOrganizationById } from "../../organizations/infrastructure/organization.repository.js";
import { notFoundError } from "../../../shared/errors/app-error.js";

const ensureOrganizationExists = async (orgId: string) => {
    const org = await findOrganizationById(orgId);
    if (!org) {
        throw notFoundError("Organization not found");
    }
};

export const generateProjectOverviewReport = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    await ensureOrganizationExists(orgId);
    return await getProjectOverview(orgId, startDate, endDate);
};

export const generateSprintPerformanceReport = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    await ensureOrganizationExists(orgId);
    return await getSprintPerformance(orgId, startDate, endDate);
};

export const generateWorkitemAnalyticsReport = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    await ensureOrganizationExists(orgId);
    return await getWorkitemAnalytics(orgId, startDate, endDate);
};

export const generateMemberActivityReport = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    await ensureOrganizationExists(orgId);
    return await getMemberActivity(orgId, startDate, endDate);
};

export const generateResourceAllocationReport = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    await ensureOrganizationExists(orgId);
    return await getResourceAllocation(orgId, startDate, endDate);
};
