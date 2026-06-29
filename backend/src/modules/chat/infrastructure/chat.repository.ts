import { db } from "../../../infrastructure/database/client.js";
import {
    organizations,
    projects,
    phases,
    sprints,
    workitems,
} from "../../../infrastructure/database/schema/index.js";
import { eq, inArray } from "drizzle-orm";

export const getDeepOrganizationContext = async (organizationId: string) => {
    const orgResult = await db
        .select({
            id: organizations.id,
            name: organizations.name,
            description: organizations.description,
        })
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);

    if (orgResult.length === 0) {
        return null;
    }

    const org = orgResult[0];
    const orgProjects = await db
        .select({
            id: projects.id,
            title: projects.title,
            status: projects.status,
            startDate: projects.startDate,
            endDate: projects.endDate,
        })
        .from(projects)
        .where(eq(projects.organizationId, organizationId));

    const projectIds = orgProjects.map((p) => p.id);

    const orgPhases =
        projectIds.length > 0
            ? await db
                  .select({
                      id: phases.id,
                      projectId: phases.projectId,
                      name: phases.name,
                      status: phases.status,
                  })
                  .from(phases)
                  .where(inArray(phases.projectId, projectIds))
            : [];

    const phaseIds = orgPhases.map((p) => p.id);

    const orgSprints =
        phaseIds.length > 0
            ? await db
                  .select({
                      id: sprints.id,
                      phaseId: sprints.phaseId,
                      title: sprints.title,
                      status: sprints.status,
                  })
                  .from(sprints)
                  .where(inArray(sprints.phaseId, phaseIds))
            : [];

    const sprintIds = orgSprints.map((s) => s.id);

    const orgWorkitems =
        sprintIds.length > 0
            ? await db
                  .select({
                      id: workitems.id,
                      sprintId: workitems.sprintId,
                      title: workitems.title,
                      status: workitems.status,
                      type: workitems.workitemType,
                      originalEstimation: workitems.originalEstimation,
                      completed: workitems.completed,
                  })
                  .from(workitems)
                  .where(inArray(workitems.sprintId, sprintIds))
            : [];

    const aggregatedProjects = orgProjects.map((project) => {
        const projectPhases = orgPhases.filter(
            (p) => p.projectId === project.id,
        );
        const aggregatedPhases = projectPhases.map((phase) => {
            const phaseSprints = orgSprints.filter(
                (s) => s.phaseId === phase.id,
            );
            const aggregatedSprints = phaseSprints.map((sprint) => {
                const sprintWorkitems = orgWorkitems.filter(
                    (w) => w.sprintId === sprint.id,
                );
                return { ...sprint, workitems: sprintWorkitems };
            });
            return { ...phase, sprints: aggregatedSprints };
        });
        return { ...project, phases: aggregatedPhases };
    });

    return {
        organization: org,
        projects: aggregatedProjects,
    };
};
