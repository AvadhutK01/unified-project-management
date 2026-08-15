import { db } from "../../../infrastructure/database/client.js";
import { phases } from "../../../infrastructure/database/schema/index.js";
import { eq, and, ilike, isNull, count, SQL, desc } from "drizzle-orm";
import { PHASE_STATUS } from "../../../shared/constants/enumConstants.js";

/**
 * Creates a new phase in the database.
 * @param data Phase input data.
 * @returns The newly created phase record.
 */
export const createPhase = async (data: {
    projectId: string;
    name: string;
    description?: string;
    type?: string;
    status?: "notstarted" | "started" | "onhold" | "completed";
    startDate?: string;
    endDate?: string;
}) => {
    const [phase] = await db
        .insert(phases)
        .values({
            projectId: data.projectId,
            name: data.name,
            description: data.description ?? null,
            type: data.type ?? null,
            status: data.status ?? PHASE_STATUS.NOT_STARTED,
            startDate: data.startDate ?? null,
            endDate: data.endDate ?? null,
        })
        .returning();
    return phase;
};

/**
 * Finds a phase by its ID.
 * @param id The phase UUID.
 * @returns The phase record or null.
 */
export const findPhaseById = async (id: string) => {
    const results = await db
        .select()
        .from(phases)
        .where(and(eq(phases.id, id), isNull(phases.deletedAt)))
        .limit(1);
    return results[0] ?? null;
};

/**
 * Retrieves all phases for a project with pagination.
 * @param projectId The project UUID.
 * @param page Page number.
 * @param limit Items per page.
 * @param search Optional search term.
 * @returns Array of phase records.
 */
export const findAllPhases = async (
    projectId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
) => {
    const filters: SQL[] = [
        eq(phases.projectId, projectId),
        isNull(phases.deletedAt),
    ];

    if (search) {
        filters.push(ilike(phases.name, `%${search}%`) as SQL);
    }

    return db
        .select()
        .from(phases)
        .where(and(...filters))
        .orderBy(desc(phases.updatedAt))
        .limit(limit)
        .offset((page - 1) * limit);
};

/**
 * Counts phases for a project with optional search.
 * @param projectId The project UUID.
 * @param search Optional search keyword.
 * @returns Total count.
 */
export const countAllPhases = async (projectId: string, search?: string) => {
    const filters: SQL[] = [
        eq(phases.projectId, projectId),
        isNull(phases.deletedAt),
    ];

    if (search) {
        filters.push(ilike(phases.name, `%${search}%`) as SQL);
    }

    const results = await db
        .select({ count: count() })
        .from(phases)
        .where(and(...filters));
    return results[0]?.count ?? 0;
};

/**
 * Updates a phase record.
 * @param id The phase UUID.
 * @param data Partial fields to update.
 * @returns The updated phase record.
 */
export const updatePhase = async (
    id: string,
    data: {
        name?: string;
        description?: string | null;
        type?: string | null;
        status?: "notstarted" | "started" | "onhold" | "completed";
        startDate?: string | null;
        endDate?: string | null;
    },
) => {
    const updates: {
        updatedAt: Date;
        name?: string;
        description?: string | null;
        type?: string | null;
        status?: "notstarted" | "started" | "onhold" | "completed";
        startDate?: string | null;
        endDate?: string | null;
    } = { updatedAt: new Date() };
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.type !== undefined) updates.type = data.type;
    if (data.status !== undefined) updates.status = data.status;
    if (data.startDate !== undefined) updates.startDate = data.startDate;
    if (data.endDate !== undefined) updates.endDate = data.endDate;

    const [updated] = await db
        .update(phases)
        .set(updates)
        .where(and(eq(phases.id, id), isNull(phases.deletedAt)))
        .returning();
    return updated ?? null;
};

/**
 * Soft-deletes a phase.
 * @param id The phase UUID.
 * @returns The deleted phase record.
 */
export const softDeletePhase = async (id: string) => {
    const [deleted] = await db
        .update(phases)
        .set({ deletedAt: new Date() })
        .where(and(eq(phases.id, id), isNull(phases.deletedAt)))
        .returning();
    return deleted ?? null;
};
