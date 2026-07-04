import { eq, inArray, desc, and, isNull } from "drizzle-orm";
import { db } from "../../../infrastructure/database/client.js";
import { organizations } from "../../../infrastructure/database/schema/organization.js";
import { projects } from "../../../infrastructure/database/schema/project.js";
import { phases } from "../../../infrastructure/database/schema/phase.js";
import { sprints } from "../../../infrastructure/database/schema/sprint.js";
import { workitems } from "../../../infrastructure/database/schema/workitem.js";
import { organizationMembers } from "../../../infrastructure/database/schema/organization-member.js";
import { projectMembers } from "../../../infrastructure/database/schema/project-member.js";
import { users } from "../../../infrastructure/database/schema/user.js";

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
    const project = projectResult[0]!;

    const teamMembers = await db
        .select({
            id: users.id,
            name: users.username,
        })
        .from(projectMembers)
        .innerJoin(
            organizationMembers,
            eq(projectMembers.organizationMemberId, organizationMembers.id),
        )
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .where(eq(projectMembers.projectId, projectId));

    const projectPhases = await db
        .select()
        .from(phases)
        .where(and(eq(phases.projectId, projectId), isNull(phases.deletedAt)));

    const completedPhasesCount = projectPhases.filter(
        (p) => p.status === "completed",
    ).length;
    const activePhasesCount = projectPhases.filter(
        (p) => p.status === "started",
    ).length;

    const phaseList = [];
    for (const phase of projectPhases) {
        const phaseSprints = await db
            .select()
            .from(sprints)
            .where(eq(sprints.phaseId, phase.id));

        let totalItems = phaseSprints.length;
        let completedItems = phaseSprints.filter(
            (s) => s.status === "closed",
        ).length;

        const sprintIds = phaseSprints.map((s) => s.id);
        if (sprintIds.length > 0) {
            const phaseWorkItems = await db
                .select()
                .from(workitems)
                .where(inArray(workitems.sprintId, sprintIds));

            totalItems += phaseWorkItems.length;
            completedItems += phaseWorkItems.filter(
                (w) => w.status === "closed" || w.status === "resolved",
            ).length;
        }

        const completionPercent =
            totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

        phaseList.push({
            phaseName: phase.name,
            completionPercent: Math.round(completionPercent * 100) / 100,
        });
    }

    return {
        title: project.title,
        description: project.description,
        logoUrl: project.logoUrl,
        clientName: project.clientName,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        totalMembersCount: teamMembers.length,
        teamMembers,
        totalPhasesCount: projectPhases.length,
        completedPhasesCount,
        activePhasesCount,
        phases: phaseList,
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

    const phase = phaseResult[0]!;

    const phaseSprints = await db
        .select()
        .from(sprints)
        .where(and(eq(sprints.phaseId, phaseId), isNull(sprints.deletedAt)));

    const completedSprintsCount = phaseSprints.filter(
        (s) => s.status === "closed",
    ).length;
    const activeSprintsCount = phaseSprints.filter(
        (s) => s.status === "active",
    ).length;

    const sprintList = [];
    for (const sprint of phaseSprints) {
        const sprintWorkItems = await db
            .select()
            .from(workitems)
            .where(eq(workitems.sprintId, sprint.id));

        const totalItems = sprintWorkItems.length;
        const completedItems = sprintWorkItems.filter(
            (w) => w.status === "closed" || w.status === "resolved",
        ).length;

        const completionPercent =
            totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

        sprintList.push({
            sprintName: sprint.title,
            completionPercent: Math.round(completionPercent * 100) / 100,
        });
    }

    return {
        title: phase.name,
        description: phase.description,
        status: phase.status,
        startDate: phase.startDate,
        endDate: phase.endDate,
        type: phase.type,
        totalSprintsCount: phaseSprints.length,
        completedSprintsCount,
        activeSprintsCount,
        sprints: sprintList,
    };
};
