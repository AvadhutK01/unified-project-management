import { db } from "../../../infrastructure/database/client.js";
import {
    sprintMedia,
    organizationMembers,
    users,
} from "../../../infrastructure/database/schema/index.js";
import { eq, and, isNull, ilike, count, SQL } from "drizzle-orm";

/**
 * Creates a new sprint media attachment record.
 */
export const createSprintMedia = async (data: {
    sprintId: string;
    memberId: string;
    name: string;
    url: string;
    fileType: string;
    fileSize: number;
}) => {
    const [media] = await db
        .insert(sprintMedia)
        .values({
            sprintId: data.sprintId,
            memberId: data.memberId,
            name: data.name,
            url: data.url,
            fileType: data.fileType,
            fileSize: data.fileSize,
        })
        .returning();
    return media;
};

/**
 * Finds a sprint media record by ID.
 */
export const findSprintMediaById = async (id: string) => {
    const results = await db
        .select()
        .from(sprintMedia)
        .where(and(eq(sprintMedia.id, id), isNull(sprintMedia.deletedAt)))
        .limit(1);
    return results[0] ?? null;
};

/**
 * Retrieves sprint media attachments paginated and optionally filtered by search name.
 */
export const findSprintMediaPaginated = async (
    sprintId: string,
    page: number,
    limit: number,
    search?: string,
) => {
    const offset = (page - 1) * limit;
    const filters: SQL[] = [
        eq(sprintMedia.sprintId, sprintId),
        isNull(sprintMedia.deletedAt),
    ];
    if (search) {
        filters.push(ilike(sprintMedia.name, `%${search}%`));
    }

    return db
        .select({
            id: sprintMedia.id,
            sprintId: sprintMedia.sprintId,
            memberId: sprintMedia.memberId,
            name: sprintMedia.name,
            url: sprintMedia.url,
            fileType: sprintMedia.fileType,
            fileSize: sprintMedia.fileSize,
            createdAt: sprintMedia.createdAt,
            updatedAt: sprintMedia.updatedAt,
            uploaderName: users.username,
            uploaderEmail: users.email,
        })
        .from(sprintMedia)
        .innerJoin(
            organizationMembers,
            eq(sprintMedia.memberId, organizationMembers.id),
        )
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .where(and(...filters))
        .limit(limit)
        .offset(offset);
};

/**
 * Counts total sprint media attachments matching optional search name.
 */
export const countSprintMedia = async (sprintId: string, search?: string) => {
    const filters: SQL[] = [
        eq(sprintMedia.sprintId, sprintId),
        isNull(sprintMedia.deletedAt),
    ];
    if (search) {
        filters.push(ilike(sprintMedia.name, `%${search}%`));
    }

    const [result] = await db
        .select({ value: count() })
        .from(sprintMedia)
        .where(and(...filters));
    return Number(result?.value ?? 0);
};

/**
 * Soft deletes a sprint media record.
 */
export const softDeleteSprintMedia = async (id: string) => {
    const [deleted] = await db
        .update(sprintMedia)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(sprintMedia.id, id), isNull(sprintMedia.deletedAt)))
        .returning();
    return deleted ?? null;
};
