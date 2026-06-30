import {
    getOrganizationDashboardMetrics as getOrgDashboardRepo,
    getProjectDashboardMetrics as getProjDashboardRepo,
    getPhaseDashboardMetrics as getPhaseDashboardRepo,
} from "../infrastructure/dashboard.repository.js";
import { notFoundError } from "../../../shared/errors/app-error.js";
import { generateDashboardSummary } from "../../../shared/services/ai.service.js";

/**
 * Retrieves organization dashboard metrics.
 * @param organizationId The organization UUID.
 * @param userId The user UUID.
 * @throws AppError if organization is not found.
 * @returns The dashboard metrics.
 */
export const getOrganizationDashboard = async (
    organizationId: string,
    userId: string,
) => {
    const data = await getOrgDashboardRepo(organizationId, userId);
    if (!data) {
        throw notFoundError("Organization not found");
    }
    return data;
};

/**
 * Retrieves project dashboard metrics.
 * @param projectId The project UUID.
 * @throws AppError if project is not found.
 * @returns The dashboard metrics.
 */
export const getProjectDashboard = async (projectId: string) => {
    const data = await getProjDashboardRepo(projectId);
    if (!data) {
        throw notFoundError("Project not found");
    }
    return data;
};

/**
 * Retrieves phase dashboard metrics.
 * @param phaseId The phase UUID.
 * @throws AppError if phase is not found.
 * @returns The dashboard metrics.
 */
export const getPhaseDashboard = async (phaseId: string) => {
    const data = await getPhaseDashboardRepo(phaseId);
    if (!data) {
        throw notFoundError("Phase not found");
    }
    return data;
};

/**
 * Generates an AI summary for the organization dashboard metrics.
 * @param organizationId The organization UUID.
 * @param userId The user UUID.
 * @throws AppError if organization is not found.
 * @returns The AI summary string.
 */
export const getOrganizationDashboardSummary = async (
    organizationId: string,
    userId: string,
) => {
    const data = await getOrganizationDashboard(organizationId, userId);
    return await generateDashboardSummary("Organization", data);
};

/**
 * Generates an AI summary for the project dashboard metrics.
 * @param projectId The project UUID.
 * @throws AppError if project is not found.
 * @returns The AI summary string.
 */
export const getProjectDashboardSummary = async (projectId: string) => {
    const data = await getProjectDashboard(projectId);
    return await generateDashboardSummary("Project", data);
};

/**
 * Generates an AI summary for the phase dashboard metrics.
 * @param phaseId The phase UUID.
 * @throws AppError if phase is not found.
 * @returns The AI summary string.
 */
export const getPhaseDashboardSummary = async (phaseId: string) => {
    const data = await getPhaseDashboard(phaseId);
    return await generateDashboardSummary("Phase", data);
};
