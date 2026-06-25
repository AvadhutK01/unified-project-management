import { db } from "../../../infrastructure/database/client.js";
import {
    projects,
    phases,
    sprints,
    workitems,
    organizationMembers,
    projectMembers,
    workitemActivityLogs,
} from "../../../infrastructure/database/schema/index.js";
import { eq, and, gte, lte, isNull, inArray } from "drizzle-orm";

const getOrgProjectIds = async (orgId: string) => {
    const orgProjects = await db
        .select({ id: projects.id })
        .from(projects)
        .where(
            and(eq(projects.organizationId, orgId), isNull(projects.deletedAt)),
        );
    return orgProjects.map((p) => p.id);
};

const getOrgPhaseIds = async (orgProjectIds: string[]) => {
    if (orgProjectIds.length === 0) return [];
    const orgPhases = await db
        .select({ id: phases.id })
        .from(phases)
        .where(
            and(
                inArray(phases.projectId, orgProjectIds),
                isNull(phases.deletedAt),
            ),
        );
    return orgPhases.map((p) => p.id);
};

const getOrgSprintIds = async (orgPhaseIds: string[]) => {
    if (orgPhaseIds.length === 0) return [];
    const orgSprints = await db
        .select({ id: sprints.id })
        .from(sprints)
        .where(
            and(
                inArray(sprints.phaseId, orgPhaseIds),
                isNull(sprints.deletedAt),
            ),
        );
    return orgSprints.map((s) => s.id);
};

export const getProjectOverview = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    const allProjects = await db
        .select()
        .from(projects)
        .where(
            and(
                eq(projects.organizationId, orgId),
                isNull(projects.deletedAt),
                gte(projects.createdAt, new Date(startDate)),
                lte(projects.createdAt, new Date(endDate)),
            ),
        );

    const projectIds = allProjects.map((p) => p.id);
    let allPhases: any[] = [];
    if (projectIds.length > 0) {
        allPhases = await db
            .select()
            .from(phases)
            .where(
                and(
                    inArray(phases.projectId, projectIds),
                    isNull(phases.deletedAt),
                ),
            );
    }

    return {
        totalProjects: allProjects.length,
        projects: allProjects.map((p) => {
            const projectPhases = allPhases.filter(
                (ph) => ph.projectId === p.id,
            );
            return {
                id: p.id,
                title: p.title,
                status: p.status,
                createdAt: p.createdAt,
                phaseCount: projectPhases.length,
            };
        }),
    };
};

export const getSprintPerformance = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    const pIds = await getOrgProjectIds(orgId);
    const phIds = await getOrgPhaseIds(pIds);

    let allSprints: any[] = [];
    if (phIds.length > 0) {
        allSprints = await db
            .select()
            .from(sprints)
            .where(
                and(
                    inArray(sprints.phaseId, phIds),
                    isNull(sprints.deletedAt),
                    gte(sprints.createdAt, new Date(startDate)),
                    lte(sprints.createdAt, new Date(endDate)),
                ),
            );
    }

    const sprintIds = allSprints.map((s) => s.id);
    let allWorkitems: any[] = [];

    if (sprintIds.length > 0) {
        allWorkitems = await db
            .select()
            .from(workitems)
            .where(
                and(
                    inArray(workitems.sprintId, sprintIds),
                    isNull(workitems.deletedAt),
                ),
            );
    }

    return {
        totalSprints: allSprints.length,
        velocity: allWorkitems.filter(
            (w) => w.status === "resolved" || w.status === "closed",
        ).length,
        sprints: allSprints.map((s) => {
            const sprintWorkitems = allWorkitems.filter(
                (w) => w.sprintId === s.id,
            );
            return {
                id: s.id,
                title: s.title,
                status: s.status,
                totalWorkitems: sprintWorkitems.length,
                completedWorkitems: sprintWorkitems.filter(
                    (w) => w.status === "resolved" || w.status === "closed",
                ).length,
                pendingWorkitems: sprintWorkitems.filter(
                    (w) => w.status !== "resolved" && w.status !== "closed",
                ).length,
            };
        }),
    };
};

export const getWorkitemAnalytics = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    const pIds = await getOrgProjectIds(orgId);
    const phIds = await getOrgPhaseIds(pIds);
    const sIds = await getOrgSprintIds(phIds);

    let allWorkitems: any[] = [];
    if (sIds.length > 0) {
        allWorkitems = await db
            .select()
            .from(workitems)
            .where(
                and(
                    inArray(workitems.sprintId, sIds),
                    isNull(workitems.deletedAt),
                    gte(workitems.createdAt, new Date(startDate)),
                    lte(workitems.createdAt, new Date(endDate)),
                ),
            );
    }

    const byType = allWorkitems.reduce((acc: any, w) => {
        acc[w.workitemType] = (acc[w.workitemType] || 0) + 1;
        return acc;
    }, {});

    const byStatus = allWorkitems.reduce((acc: any, w) => {
        acc[w.status] = (acc[w.status] || 0) + 1;
        return acc;
    }, {});

    return {
        totalWorkitems: allWorkitems.length,
        completedWorkitems:
            (byStatus["resolved"] || 0) + (byStatus["closed"] || 0),
        byType,
        byStatus,
    };
};

export const getMemberActivity = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    const members = await db
        .select()
        .from(organizationMembers)
        .where(
            and(
                eq(organizationMembers.organizationId, orgId),
                isNull(organizationMembers.deletedAt),
                gte(organizationMembers.createdAt, new Date(startDate)),
                lte(organizationMembers.createdAt, new Date(endDate)),
            ),
        );

    const userIds = members.map((m) => m.memberId);

    let workitemLogs: any[] = [];
    if (userIds.length > 0) {
        workitemLogs = await db
            .select()
            .from(workitemActivityLogs)
            .where(
                and(
                    inArray(workitemActivityLogs.userId, userIds),
                    gte(workitemActivityLogs.createdAt, new Date(startDate)),
                    lte(workitemActivityLogs.createdAt, new Date(endDate)),
                ),
            );
    }

    return {
        totalMembersJoined: members.length,
        members: members.map((m) => {
            const logs = workitemLogs.filter((l) => l.userId === m.memberId);
            return {
                organizationMemberId: m.id,
                userId: m.memberId,
                roleId: m.roleId,
                totalActivityLogs: logs.length,
            };
        }),
    };
};

export const getResourceAllocation = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    const activeProjects = await db
        .select()
        .from(projects)
        .where(
            and(
                eq(projects.organizationId, orgId),
                isNull(projects.deletedAt),
                gte(projects.createdAt, new Date(startDate)),
                lte(projects.createdAt, new Date(endDate)),
            ),
        );

    const pIds = activeProjects.map((p) => p.id);
    let pMembers: any[] = [];

    if (pIds.length > 0) {
        pMembers = await db
            .select()
            .from(projectMembers)
            .where(
                and(
                    inArray(projectMembers.projectId, pIds),
                    isNull(projectMembers.deletedAt),
                ),
            );
    }

    const allocation = pMembers.reduce((acc: any, pm) => {
        acc[pm.organizationMemberId] = (acc[pm.organizationMemberId] || 0) + 1;
        return acc;
    }, {});

    return {
        projectsTracked: activeProjects.length,
        allocation: Object.keys(allocation).map((memberId) => ({
            organizationMemberId: memberId,
            assignedProjectsCount: allocation[memberId],
        })),
    };
};
