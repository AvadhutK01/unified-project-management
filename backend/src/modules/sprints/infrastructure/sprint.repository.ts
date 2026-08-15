import { db } from "../../../infrastructure/database/client.js";
import {
    sprints,
    phases,
    projects,
    organizations,
    workitems,
} from "../../../infrastructure/database/schema/index.js";
import { eq, and, ilike, isNull, count, SQL, desc } from "drizzle-orm";
import {
    SPRINT_STATUS,
    WORKITEM_STATUS,
} from "../../../shared/constants/enumConstants.js";

/**
 * Creates a new sprint in the database.
 * @param data Sprint input data.
 * @returns The newly created sprint record.
 */
export const createSprint = async (data: {
    title: string;
    description?: string;
    phaseId: string;
    startDate?: string;
    endDate?: string;
    sequence?: number;
    acceptanceCriteria?: string;
    status?: "new" | "active" | "onhold" | "removed" | "closed";
}) => {
    const [sprint] = await db
        .insert(sprints)
        .values({
            title: data.title,
            description: data.description ?? null,
            phaseId: data.phaseId,
            startDate: data.startDate ?? null,
            endDate: data.endDate ?? null,
            sequence: data.sequence ?? null,
            acceptanceCriteria: data.acceptanceCriteria ?? null,
            status: data.status ?? SPRINT_STATUS.NEW,
        })
        .returning();
    return sprint;
};

/**
 * Finds a sprint by its ID.
 * @param id The sprint UUID.
 * @returns The sprint record or null.
 */
export const findSprintById = async (id: string) => {
    const results = await db
        .select({
            sprint: sprints,
            phaseName: phases.name,
            projectName: projects.title,
            organizationName: organizations.name,
        })
        .from(sprints)
        .innerJoin(phases, eq(sprints.phaseId, phases.id))
        .innerJoin(projects, eq(phases.projectId, projects.id))
        .innerJoin(organizations, eq(projects.organizationId, organizations.id))
        .where(and(eq(sprints.id, id), isNull(sprints.deletedAt)))
        .limit(1);

    if (results.length === 0) return null;

    const row = results[0]!;

    const sprintWorkItems = await db
        .select()
        .from(workitems)
        .where(and(eq(workitems.sprintId, id), isNull(workitems.deletedAt)));

    const workitemsByStatus = {
        [WORKITEM_STATUS.NEW]: 0,
        [WORKITEM_STATUS.ACTIVE]: 0,
        [WORKITEM_STATUS.RESOLVED]: 0,
        [WORKITEM_STATUS.CLOSED]: 0,
        [WORKITEM_STATUS.REMOVED]: 0,
        [WORKITEM_STATUS.ON_HOLD]: 0,
    };

    sprintWorkItems.forEach((wi) => {
        if (wi.status in workitemsByStatus) {
            workitemsByStatus[wi.status as keyof typeof workitemsByStatus]++;
        }
    });

    return {
        ...row.sprint,
        metrics: {
            totalWorkItems: sprintWorkItems.length,
            workitemsByStatus,
        },
    };
};

/**
 * Retrieves all sprints for a phase with pagination.
 * @param phaseId The phase UUID.
 * @param page Page number.
 * @param limit Items per page.
 * @param search Optional search term.
 * @returns Array of sprint records.
 */
export const findAllSprints = async (
    phaseId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
) => {
    const filters: SQL[] = [
        eq(sprints.phaseId, phaseId),
        isNull(sprints.deletedAt),
    ];

    if (search) {
        filters.push(ilike(sprints.title, `%${search}%`) as SQL);
    }
    if (status) {
        filters.push(
            eq(
                sprints.status,
                status as "new" | "active" | "onhold" | "removed" | "closed",
            ),
        );
    }

    return db
        .select()
        .from(sprints)
        .where(and(...filters))
        .orderBy(desc(sprints.updatedAt))
        .limit(limit)
        .offset((page - 1) * limit);
};

/**
 * Counts sprints for a phase with optional search.
 * @param phaseId The phase UUID.
 * @param search Optional search keyword.
 * @returns Total count.
 */
export const countAllSprints = async (
    phaseId: string,
    search?: string,
    status?: string,
) => {
    const filters: SQL[] = [
        eq(sprints.phaseId, phaseId),
        isNull(sprints.deletedAt),
    ];

    if (search) {
        filters.push(ilike(sprints.title, `%${search}%`) as SQL);
    }
    if (status) {
        filters.push(
            eq(
                sprints.status,
                status as "new" | "active" | "onhold" | "removed" | "closed",
            ),
        );
    }

    const results = await db
        .select({ count: count() })
        .from(sprints)
        .where(and(...filters));
    return results[0]?.count ?? 0;
};

/**
 * Updates a sprint record.
 * @param id The sprint UUID.
 * @param data Partial fields to update.
 * @returns The updated sprint record.
 */
export const updateSprint = async (
    id: string,
    data: {
        title?: string;
        description?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        sequence?: number | null;
        acceptanceCriteria?: string | null;
        status?: "new" | "active" | "onhold" | "removed" | "closed";
    },
) => {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.startDate !== undefined) updates.startDate = data.startDate;
    if (data.endDate !== undefined) updates.endDate = data.endDate;
    if (data.sequence !== undefined) updates.sequence = data.sequence;
    if (data.acceptanceCriteria !== undefined)
        updates.acceptanceCriteria = data.acceptanceCriteria;
    if (data.status !== undefined) updates.status = data.status;

    const [updated] = await db
        .update(sprints)
        .set(updates)
        .where(and(eq(sprints.id, id), isNull(sprints.deletedAt)))
        .returning();
    return updated ?? null;
};

/**
 * Updates status of a sprint.
 * @param id The sprint UUID.
 * @param status The new status.
 * @returns The updated sprint record.
 */
export const updateSprintStatus = async (
    id: string,
    status: "new" | "active" | "onhold" | "removed" | "closed",
) => {
    const [updated] = await db
        .update(sprints)
        .set({ status, updatedAt: new Date() })
        .where(and(eq(sprints.id, id), isNull(sprints.deletedAt)))
        .returning();
    return updated ?? null;
};

/**
 * Soft-deletes a sprint.
 * @param id The sprint UUID.
 * @returns The deleted sprint record.
 */
export const softDeleteSprint = async (id: string) => {
    const [deleted] = await db
        .update(sprints)
        .set({ deletedAt: new Date() })
        .where(and(eq(sprints.id, id), isNull(sprints.deletedAt)))
        .returning();
    return deleted ?? null;
};
