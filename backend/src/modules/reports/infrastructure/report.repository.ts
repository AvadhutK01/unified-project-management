import { db } from "../../../infrastructure/database/client.js";
import {
    projects,
    phases,
    sprints,
    workitems,
    organizationMembers,
    projectMembers,
    users,
} from "../../../infrastructure/database/schema/index.js";
import type { GroupData } from "../../../types/reports.js";
import { eq, and, gte, lte, isNull, inArray } from "drizzle-orm";

/**
 * Helper to retrieve all active project UUIDs belonging to an organization.
 * @param orgId UUID of the organization.
 * @returns Array of project UUIDs.
 */
const getOrgProjectIds = async (orgId: string) => {
    const orgProjects = await db
        .select({ id: projects.id })
        .from(projects)
        .where(
            and(eq(projects.organizationId, orgId), isNull(projects.deletedAt)),
        );
    return orgProjects.map((p) => p.id);
};

/**
 * Helper to retrieve all active phase UUIDs for a list of project UUIDs.
 * @param orgProjectIds Array of project UUIDs.
 * @returns Array of phase UUIDs.
 */
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
    let allPhases: Array<typeof phases.$inferSelect> = [];
    let allProjectMembers: Array<typeof projectMembers.$inferSelect> = [];
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

    let allSprints: Array<typeof sprints.$inferSelect> = [];
    let allProjects: Array<{ id: string; title: string }> = [];
    let allPhases: Array<{ id: string; name: string; projectId: string }> = [];

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
    let allWorkitems: Array<typeof workitems.$inferSelect> = [];

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
    memberId?: string,
) => {
    const orgMembersQuery = db
        .select({
            id: organizationMembers.id,
            userId: organizationMembers.memberId,
        })
        .from(organizationMembers)
        .where(
            and(
                eq(organizationMembers.organizationId, orgId),
                isNull(organizationMembers.deletedAt),
                memberId ? eq(organizationMembers.id, memberId) : undefined,
            ),
        );
    const orgMembersList = await orgMembersQuery;

    if (orgMembersList.length === 0) return [];

    const orgMemberIds = orgMembersList.map((m) => m.id);
    const userIds = orgMembersList.map((m) => m.userId);

    const usersList = await db
        .select({
            id: users.id,
            username: users.username,
        })
        .from(users)
        .where(inArray(users.id, userIds));

    const userMap = new Map(usersList.map((u) => [u.id, u.username]));
    const orgMemberToNameMap = new Map(
        orgMembersList.map((m) => [m.id, userMap.get(m.userId) || "Unknown"]),
    );

    const projMembersList = await db
        .select({
            id: projectMembers.id,
            organizationMemberId: projectMembers.organizationMemberId,
            projectId: projectMembers.projectId,
        })
        .from(projectMembers)
        .where(
            and(
                inArray(projectMembers.organizationMemberId, orgMemberIds),
                isNull(projectMembers.deletedAt),
            ),
        );

    const projMemberIds = projMembersList.map((m) => m.id);
    const projMemberToOrgMember = new Map(
        projMembersList.map((m) => [m.id, m.organizationMemberId]),
    );

    let workitemsList: Array<{
        id: string;
        sprintId: string;
        assignedTo: string | null;
        status: string;
        completed: number | null;
    }> = [];
    if (projMemberIds.length > 0) {
        workitemsList = await db
            .select({
                id: workitems.id,
                sprintId: workitems.sprintId,
                assignedTo: workitems.assignedTo,
                status: workitems.status,
                completed: workitems.completed,
            })
            .from(workitems)
            .where(
                and(
                    inArray(workitems.assignedTo, projMemberIds),
                    isNull(workitems.deletedAt),
                    gte(workitems.createdAt, new Date(startDate)),
                    lte(workitems.createdAt, new Date(endDate)),
                ),
            );
    }

    const projectIds = [...new Set(projMembersList.map((m) => m.projectId))];

    let projectsList: Array<{ id: string; title: string }> = [];
    if (projectIds.length > 0) {
        projectsList = await db
            .select({ id: projects.id, title: projects.title })
            .from(projects)
            .where(inArray(projects.id, projectIds));
    }

    let phasesList: Array<{ id: string; name: string; projectId: string }> = [];
    if (projectIds.length > 0) {
        phasesList = await db
            .select({
                id: phases.id,
                name: phases.name,
                projectId: phases.projectId,
            })
            .from(phases)
            .where(
                and(
                    inArray(phases.projectId, projectIds),
                    isNull(phases.deletedAt),
                ),
            );
    }

    const phaseIds = [...new Set(phasesList.map((p) => p.id))];
    let sprintsList: Array<{
        id: string;
        title: string;
        phaseId: string;
        startDate: string | null;
        endDate: string | null;
    }> = [];
    if (phaseIds.length > 0) {
        sprintsList = await db
            .select({
                id: sprints.id,
                title: sprints.title,
                phaseId: sprints.phaseId,
                startDate: sprints.startDate,
                endDate: sprints.endDate,
            })
            .from(sprints)
            .where(
                and(
                    inArray(sprints.phaseId, phaseIds),
                    isNull(sprints.deletedAt),
                ),
            );
    }

    const sprintMap = new Map(sprintsList.map((s) => [s.id, s]));
    const phaseMap = new Map(phasesList.map((p) => [p.id, p]));
    const projectMap = new Map(projectsList.map((p) => [p.id, p]));

    const grouped = new Map<string, GroupData>();

    const filterStart = new Date(startDate).getTime();
    const filterEnd = new Date(endDate).getTime();

    for (const pm of projMembersList) {
        const orgMemberId = pm.organizationMemberId;
        const projectId = pm.projectId;
        const memberName = orgMemberToNameMap.get(orgMemberId) || "Unknown";
        const project = projectMap.get(projectId);
        if (!project) continue;

        const projectPhases = phasesList.filter(
            (ph) => ph.projectId === projectId,
        );
        for (const phase of projectPhases) {
            const phaseSprints = sprintsList.filter(
                (s) => s.phaseId === phase.id,
            );
            for (const sprint of phaseSprints) {
                const sStart = sprint.startDate
                    ? new Date(sprint.startDate).getTime()
                    : null;
                const sEnd = sprint.endDate
                    ? new Date(sprint.endDate).getTime()
                    : null;

                let inRange = false;
                if (sStart && sEnd) {
                    if (sStart >= filterStart && sEnd <= filterEnd)
                        inRange = true;
                } else {
                    inRange = true;
                }

                if (inRange) {
                    const groupKey = `${orgMemberId}_${sprint.id}`;
                    if (!grouped.has(groupKey)) {
                        grouped.set(groupKey, {
                            memberName,
                            projectName: project.title,
                            phaseName: phase.name,
                            sprintName: sprint.title,
                            totalWorkitems: 0,
                            statusCounts: {
                                new: 0,
                                active: 0,
                                resolved: 0,
                                closed: 0,
                                removed: 0,
                                onhold: 0,
                            },
                            totalWorkedTime: 0,
                        });
                    }
                }
            }
        }
    }

    for (const w of workitemsList) {
        if (!w.assignedTo) continue;
        const orgMemberId = projMemberToOrgMember.get(w.assignedTo);
        if (!orgMemberId) continue;

        const sprint = sprintMap.get(w.sprintId);
        if (!sprint) continue;
        const phase = phaseMap.get(sprint.phaseId);
        if (!phase) continue;
        const project = projectMap.get(phase.projectId);
        if (!project) continue;

        const groupKey = `${orgMemberId}_${w.sprintId}`;

        if (!grouped.has(groupKey)) {
            grouped.set(groupKey, {
                memberName: orgMemberToNameMap.get(orgMemberId) || "Unknown",
                projectName: project.title,
                phaseName: phase.name,
                sprintName: sprint.title,
                totalWorkitems: 0,
                statusCounts: {
                    new: 0,
                    active: 0,
                    resolved: 0,
                    closed: 0,
                    removed: 0,
                    onhold: 0,
                },
                totalWorkedTime: 0,
            });
        }

        const data = grouped.get(groupKey)!;
        data.totalWorkitems++;
        if (data.statusCounts[w.status as string] !== undefined) {
            data.statusCounts[w.status as string]!++;
        }
        if (w.completed) {
            data.totalWorkedTime += w.completed;
        }
    }

    const allGroupedValues = Array.from(grouped.values());
    const memberNamesWithRows = new Set(
        allGroupedValues.map((g) => g.memberName),
    );

    for (const member of orgMembersList) {
        const name = orgMemberToNameMap.get(member.id) || "Unknown";
        if (!memberNamesWithRows.has(name)) {
            allGroupedValues.push({
                memberName: name,
                projectName: "-",
                phaseName: "-",
                sprintName: "-",
                totalWorkitems: 0,
                statusCounts: {
                    new: 0,
                    active: 0,
                    resolved: 0,
                    closed: 0,
                    removed: 0,
                    onhold: 0,
                },
                totalWorkedTime: 0,
            });
        }
    }

    return allGroupedValues;
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
    let activePhases: Array<typeof phases.$inferSelect> = [];
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
    let allSprints: Array<typeof sprints.$inferSelect> = [];
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
