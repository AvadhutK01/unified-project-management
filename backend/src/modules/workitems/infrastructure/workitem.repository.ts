import { db } from "../../../infrastructure/database/client.js";
import {
    workitems,
    sprints,
    phases,
    projects,
    organizations,
} from "../../../infrastructure/database/schema/index.js";
import { eq, and, ilike, isNull, count, SQL } from "drizzle-orm";

export const createWorkitem = async (data: {
    sprintId: string;
    assignedTo?: string | null;
    title: string;
    description?: string | null;
    status?: "new" | "active" | "resolved" | "closed" | "removed" | "onhold";
    priority?: number;
    acceptanceCriteria?: string | null;
    workitemType: "task" | "bug";
}) => {
    const [workitem] = await db
        .insert(workitems)
        .values({
            sprintId: data.sprintId,
            assignedTo: data.assignedTo ?? null,
            title: data.title,
            description: data.description ?? null,
            status: data.status ?? "new",
            priority: data.priority ?? 2,
            acceptanceCriteria: data.acceptanceCriteria ?? null,
            workitemType: data.workitemType,
        })
        .returning();
    return workitem;
};

export const findWorkitemById = async (id: string) => {
    const results = await db
        .select({
            workitem: workitems,
            sprintName: sprints.title,
            phaseName: phases.name,
            projectName: projects.title,
            organizationName: organizations.name,
        })
        .from(workitems)
        .innerJoin(sprints, eq(workitems.sprintId, sprints.id))
        .innerJoin(phases, eq(sprints.phaseId, phases.id))
        .innerJoin(projects, eq(phases.projectId, projects.id))
        .innerJoin(organizations, eq(projects.organizationId, organizations.id))
        .where(and(eq(workitems.id, id), isNull(workitems.deletedAt)))
        .limit(1);

    if (results.length === 0) return null;

    const row = results[0]!;
    return {
        ...row.workitem,
        sprintName: row.sprintName,
        phaseName: row.phaseName,
        projectName: row.projectName,
        organizationName: row.organizationName,
    };
};

export const findAllWorkitems = async (
    sprintId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
) => {
    const filters: SQL[] = [
        eq(workitems.sprintId, sprintId),
        isNull(workitems.deletedAt),
    ];

    if (search) {
        filters.push(ilike(workitems.title, `%${search}%`) as SQL);
    }

    return db
        .select()
        .from(workitems)
        .where(and(...filters))
        .limit(limit)
        .offset((page - 1) * limit);
};

export const countAllWorkitems = async (sprintId: string, search?: string) => {
    const filters: SQL[] = [
        eq(workitems.sprintId, sprintId),
        isNull(workitems.deletedAt),
    ];

    if (search) {
        filters.push(ilike(workitems.title, `%${search}%`) as SQL);
    }

    const results = await db
        .select({ count: count() })
        .from(workitems)
        .where(and(...filters));
    return results[0]?.count ?? 0;
};

export const updateWorkitem = async (
    id: string,
    data: {
        title?: string;
        description?: string | null;
        assignedTo?: string | null;
        status?:
            | "new"
            | "active"
            | "resolved"
            | "closed"
            | "removed"
            | "onhold";
        priority?: number;
        acceptanceCriteria?: string | null;
        workitemType?: "task" | "bug";
    },
) => {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.assignedTo !== undefined) updates.assignedTo = data.assignedTo;
    if (data.status !== undefined) updates.status = data.status;
    if (data.priority !== undefined) updates.priority = data.priority;
    if (data.acceptanceCriteria !== undefined)
        updates.acceptanceCriteria = data.acceptanceCriteria;
    if (data.workitemType !== undefined)
        updates.workitemType = data.workitemType;

    const [updated] = await db
        .update(workitems)
        .set(updates)
        .where(and(eq(workitems.id, id), isNull(workitems.deletedAt)))
        .returning();
    return updated ?? null;
};

export const updateWorkitemStatus = async (
    id: string,
    status: "new" | "active" | "resolved" | "closed" | "removed" | "onhold",
) => {
    const [updated] = await db
        .update(workitems)
        .set({ status, updatedAt: new Date() })
        .where(and(eq(workitems.id, id), isNull(workitems.deletedAt)))
        .returning();
    return updated ?? null;
};

export const softDeleteWorkitem = async (id: string) => {
    const [deleted] = await db
        .update(workitems)
        .set({ deletedAt: new Date() })
        .where(and(eq(workitems.id, id), isNull(workitems.deletedAt)))
        .returning();
    return deleted ?? null;
};
