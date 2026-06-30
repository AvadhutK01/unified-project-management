import { eq, inArray, desc, and, isNull } from "drizzle-orm";
import { db } from "../../../infrastructure/database/client.js";
import { organizations } from "../../../infrastructure/database/schema/organization.js";
import { projects } from "../../../infrastructure/database/schema/project.js";
import { phases } from "../../../infrastructure/database/schema/phase.js";
import { sprints } from "../../../infrastructure/database/schema/sprint.js";
import { workitems } from "../../../infrastructure/database/schema/workitem.js";
import { organizationMembers } from "../../../infrastructure/database/schema/organization-member.js";
import { projectMembers } from "../../../infrastructure/database/schema/project-member.js";

export const getOrganizationDashboardMetrics = async (
    organizationId: string,
    userId: string,
) => {
    const orgResult = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);

    if (orgResult.length === 0) {
        return null;
    }
    const org = orgResult[0]!;

    const orgMembers = await db
        .select()
        .from(organizationMembers)
        .where(eq(organizationMembers.organizationId, organizationId));

    const orgProjects = await db
        .select()
        .from(projects)
        .where(
            and(
                eq(projects.organizationId, organizationId),
                isNull(projects.deletedAt),
            ),
        );

    const completedProjectsCount = orgProjects.filter(
        (p) => p.status === "completed",
    ).length;
    const activeProjectsCount = orgProjects.filter(
        (p) => p.status === "started",
    ).length;

    const projectList = [];
    for (const project of orgProjects) {
        const projectPhases = await db
            .select()
            .from(phases)
            .where(eq(phases.projectId, project.id));

        let totalItems = projectPhases.length;
        let completedItems = projectPhases.filter(
            (p) => p.status === "completed",
        ).length;

        const phaseIds = projectPhases.map((p) => p.id);
        if (phaseIds.length > 0) {
            const projectSprints = await db
                .select()
                .from(sprints)
                .where(inArray(sprints.phaseId, phaseIds));

            totalItems += projectSprints.length;
            completedItems += projectSprints.filter(
                (s) => s.status === "closed",
            ).length;

            const sprintIds = projectSprints.map((s) => s.id);
            if (sprintIds.length > 0) {
                const projectWorkItems = await db
                    .select()
                    .from(workitems)
                    .where(inArray(workitems.sprintId, sprintIds));

                totalItems += projectWorkItems.length;
                completedItems += projectWorkItems.filter(
                    (w) => w.status === "closed" || w.status === "resolved",
                ).length;
            }
        }

        const completionPercent =
            totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

        projectList.push({
            projectName: project.title,
            completionPercent: Math.round(completionPercent * 100) / 100,
        });
    }

    const orgMember = orgMembers.find((m) => m.memberId === userId);
    let recentWorkItems: any[] = [];
    if (orgMember) {
        const userProjectMembers = await db
            .select()
            .from(projectMembers)
            .where(eq(projectMembers.organizationMemberId, orgMember.id));

        const userProjectMemberIds = userProjectMembers.map((pm) => pm.id);
        if (userProjectMemberIds.length > 0) {
            recentWorkItems = await db
                .select()
                .from(workitems)
                .where(inArray(workitems.assignedTo, userProjectMemberIds))
                .orderBy(desc(workitems.createdAt))
                .limit(5);
        }
    }

    return {
        title: org.name,
        slug: org.slug,
        logoUrl: org.logoUrl,
        websiteUrl: org.websiteUrl,
        description: org.description,
        totalMembersCount: orgMembers.length,
        totalProjectsCount: orgProjects.length,
        completedProjectsCount,
        activeProjectsCount,
        projects: projectList,
        recentWorkItems,
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
