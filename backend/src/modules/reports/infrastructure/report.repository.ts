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
                gte(projects.startDate, startDate),
                lte(projects.endDate, endDate),
            ),
        );

    const projectIds = allProjects.map((p) => p.id);
    let allPhases: any[] = [];
    let allProjectMembers: any[] = [];
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
        allProjectMembers = await db
            .select()
            .from(projectMembers)
            .where(
                and(
                    inArray(projectMembers.projectId, projectIds),
                    isNull(projectMembers.deletedAt),
                ),
            );
    }

    return allProjects.map((p) => {
        const projectPhases = allPhases.filter((ph) => ph.projectId === p.id);
        const projectMembersList = allProjectMembers.filter(
            (pm) => pm.projectId === p.id,
        );
        return {
            id: p.id,
            title: p.title,
            status: p.status,
            startDate: p.startDate,
            endDate: p.endDate,
            createdAt: p.createdAt,
            phaseCount: projectPhases.length,
            memberCount: projectMembersList.length,
        };
    });
};

export const getSprintPerformance = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    const pIds = await getOrgProjectIds(orgId);
    const phIds = await getOrgPhaseIds(pIds);

    let allSprints: any[] = [];
    let allProjects: any[] = [];
    let allPhases: any[] = [];

    if (pIds.length > 0) {
        allProjects = await db
            .select({ id: projects.id, title: projects.title })
            .from(projects)
            .where(and(inArray(projects.id, pIds), isNull(projects.deletedAt)));
    }

    if (phIds.length > 0) {
        allPhases = await db
            .select({
                id: phases.id,
                name: phases.name,
                projectId: phases.projectId,
            })
            .from(phases)
            .where(and(inArray(phases.id, phIds), isNull(phases.deletedAt)));

        allSprints = await db
            .select()
            .from(sprints)
            .where(
                and(
                    inArray(sprints.phaseId, phIds),
                    isNull(sprints.deletedAt),
                    gte(sprints.startDate, startDate),
                    lte(sprints.endDate, endDate),
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

    return allSprints.map((s) => {
        const sprintWorkitems = allWorkitems.filter((w) => w.sprintId === s.id);
        const phase = allPhases.find((ph) => ph.id === s.phaseId);
        const project = phase
            ? allProjects.find((p) => p.id === phase.projectId)
            : undefined;

        return {
            id: s.id,
            title: s.title,
            status: s.status,
            startDate: s.startDate,
            endDate: s.endDate,
            createdAt: s.createdAt,
            phaseName: phase?.name,
            projectName: project?.title,
            totalWorkitems: sprintWorkitems.length,
            statusCounts: {
                new: sprintWorkitems.filter((w) => w.status === "new").length,
                active: sprintWorkitems.filter((w) => w.status === "active")
                    .length,
                resolved: sprintWorkitems.filter((w) => w.status === "resolved")
                    .length,
                closed: sprintWorkitems.filter((w) => w.status === "closed")
                    .length,
                removed: sprintWorkitems.filter((w) => w.status === "removed")
                    .length,
                onhold: sprintWorkitems.filter((w) => w.status === "onhold")
                    .length,
            },
        };
    });
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

export const getPhaseOverview = async (
    orgId: string,
    startDate: string,
    endDate: string,
) => {
    const activeProjects = await db
        .select({ id: projects.id, title: projects.title })
        .from(projects)
        .where(
            and(eq(projects.organizationId, orgId), isNull(projects.deletedAt)),
        );

    const projectIds = activeProjects.map((p) => p.id);
    let activePhases: any[] = [];
    if (projectIds.length > 0) {
        activePhases = await db
            .select()
            .from(phases)
            .where(
                and(
                    inArray(phases.projectId, projectIds),
                    isNull(phases.deletedAt),
                    gte(phases.startDate, startDate),
                    lte(phases.endDate, endDate),
                ),
            );
    }

    const phaseIds = activePhases.map((ph) => ph.id);
    let allSprints: any[] = [];
    if (phaseIds.length > 0) {
        allSprints = await db
            .select()
            .from(sprints)
            .where(
                and(
                    inArray(sprints.phaseId, phaseIds),
                    isNull(sprints.deletedAt),
                ),
            );
    }

    return activePhases.map((ph) => {
        const phaseSprints = allSprints.filter((s) => s.phaseId === ph.id);
        const project = activeProjects.find((p) => p.id === ph.projectId);
        return {
            id: ph.id,
            projectId: ph.projectId,
            projectName: project?.title,
            name: ph.name,
            status: ph.status,
            type: ph.type,
            startDate: ph.startDate,
            endDate: ph.endDate,
            createdAt: ph.createdAt,
            sprintCount: phaseSprints.length,
        };
    });
};
