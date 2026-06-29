import { eq } from "drizzle-orm";
import { db } from "../../../infrastructure/database/client.js";
import { organizations } from "../../../infrastructure/database/schema/organization.js";
import { projects } from "../../../infrastructure/database/schema/project.js";
import { phases } from "../../../infrastructure/database/schema/phase.js";
import { sprints } from "../../../infrastructure/database/schema/sprint.js";
import { workitems } from "../../../infrastructure/database/schema/workitem.js";

/**
 * Retrieves the organization dashboard metrics.
 * @param organizationId The organization UUID.
 * @returns An object containing organization details and its metrics.
 */
export const getOrganizationDashboardMetrics = async (
    organizationId: string,
) => {
    const orgResult = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);

    if (orgResult.length === 0) {
        return null;
    }

    const orgProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.organizationId, organizationId));

    const projectsByStatus = {
        notstarted: 0,
        started: 0,
        onhold: 0,
        completed: 0,
    };

    orgProjects.forEach((proj) => {
        if (proj.status in projectsByStatus) {
            projectsByStatus[proj.status as keyof typeof projectsByStatus]++;
        }
    });

    return {
        organization: orgResult[0],
        metrics: {
            totalProjects: orgProjects.length,
            projectsByStatus,
        },
        recentProjects: orgProjects
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5),
    };
};

/**
 * Retrieves the project dashboard metrics.
 * @param projectId The project UUID.
 * @returns An object containing project details and its metrics.
 */
export const getProjectDashboardMetrics = async (projectId: string) => {
    const projectResult = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

    if (projectResult.length === 0) {
        return null;
    }

    const projectPhases = await db
        .select()
        .from(phases)
        .where(eq(phases.projectId, projectId));

    const phasesByStatus = {
        notstarted: 0,
        started: 0,
        onhold: 0,
        completed: 0,
    };

    projectPhases.forEach((phase) => {
        if (phase.status in phasesByStatus) {
            phasesByStatus[phase.status as keyof typeof phasesByStatus]++;
        }
    });

    // To get workitem metrics, we'd theoretically need to join sprints and workitems
    // But for a simpler DB query without massive joins, we can query them separately if needed,
    // or do a join. Since it's a dashboard, we will do a targeted query for workitems
    // belonging to this project via phases -> sprints.
    const phaseIds = projectPhases.map((p) => p.id);
    let allWorkitemsSummary = {
        total: 0,
        completed: 0,
        active: 0,
        completionPercentage: 0.0,
    };

    if (phaseIds.length > 0) {
        // Find sprints for these phases
    }

    // For proper typing without complex inArray (since it's not imported yet),
    // let's fetch all sprints and filter
    const allProjectSprints = await db.select().from(sprints);

    const relevantSprintIds = allProjectSprints
        .filter((s) => phaseIds.includes(s.phaseId))
        .map((s) => s.id);

    if (relevantSprintIds.length > 0) {
        const allProjectWorkitems = await db.select().from(workitems);

        const relevantWorkitems = allProjectWorkitems.filter((w) =>
            relevantSprintIds.includes(w.sprintId),
        );

        allWorkitemsSummary.total = relevantWorkitems.length;
        relevantWorkitems.forEach((wi) => {
            if (wi.status === "closed" || wi.status === "resolved") {
                allWorkitemsSummary.completed++;
            } else if (wi.status === "active" || wi.status === "new") {
                allWorkitemsSummary.active++;
            }
        });

        if (allWorkitemsSummary.total > 0) {
            allWorkitemsSummary.completionPercentage =
                (allWorkitemsSummary.completed / allWorkitemsSummary.total) *
                100;
        }
    }

    return {
        project: projectResult[0],
        metrics: {
            totalPhases: projectPhases.length,
            phasesByStatus,
            workitemsSummary: allWorkitemsSummary,
        },
        phasesOverview: projectPhases,
    };
};

/**
 * Retrieves the phase dashboard metrics.
 * @param phaseId The phase UUID.
 * @returns An object containing phase details and its metrics.
 */
export const getPhaseDashboardMetrics = async (phaseId: string) => {
    const phaseResult = await db
        .select()
        .from(phases)
        .where(eq(phases.id, phaseId))
        .limit(1);

    if (phaseResult.length === 0) {
        return null;
    }

    const phaseSprints = await db
        .select()
        .from(sprints)
        .where(eq(sprints.phaseId, phaseId));

    const sprintsByStatus = {
        new: 0,
        active: 0,
        onhold: 0,
        removed: 0,
        closed: 0,
    };

    const activeSprintsList: typeof phaseSprints = [];

    phaseSprints.forEach((sprint) => {
        if (sprint.status in sprintsByStatus) {
            sprintsByStatus[sprint.status as keyof typeof sprintsByStatus]++;
        }
        if (sprint.status === "active") {
            activeSprintsList.push(sprint);
        }
    });

    const sprintIds = phaseSprints.map((s) => s.id);
    const workitemsByStatus = {
        new: 0,
        active: 0,
        resolved: 0,
        closed: 0,
        removed: 0,
        onhold: 0,
    };

    const effortSummary = {
        totalOriginalEstimation: 0.0,
        totalCompleted: 0.0,
        totalRemaining: 0.0,
    };

    if (sprintIds.length > 0) {
        const allPhaseWorkitems = await db.select().from(workitems);
        const relevantWorkitems = allPhaseWorkitems.filter((w) =>
            sprintIds.includes(w.sprintId),
        );

        relevantWorkitems.forEach((wi) => {
            if (wi.status in workitemsByStatus) {
                workitemsByStatus[
                    wi.status as keyof typeof workitemsByStatus
                ]++;
            }
            effortSummary.totalOriginalEstimation += wi.originalEstimation || 0;
            effortSummary.totalCompleted += wi.completed || 0;
            effortSummary.totalRemaining += wi.remaining || 0;
        });
    }

    return {
        phase: phaseResult[0],
        metrics: {
            totalSprints: phaseSprints.length,
            sprintsByStatus,
            workitemsByStatus,
            effortSummary,
        },
        activeSprints: activeSprintsList,
    };
};
