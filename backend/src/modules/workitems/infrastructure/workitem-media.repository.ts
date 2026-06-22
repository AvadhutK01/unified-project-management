import { db } from "../../../infrastructure/database/client.js";
import {
    workitemMedia,
    organizationMembers,
    users,
} from "../../../infrastructure/database/schema/index.js";
import { eq, and, isNull, count, ilike, SQL, desc } from "drizzle-orm";

export const createWorkitemMedia = async (data: {
    workitemId: string;
    memberId: string;
    name: string;
    url: string;
    fileType?: string | null;
    fileSize?: number | null;
}) => {
    const [media] = await db
        .insert(workitemMedia)
        .values({
            workitemId: data.workitemId,
            memberId: data.memberId,
            name: data.name,
            url: data.url,
            fileType: data.fileType ?? null,
            fileSize: data.fileSize ?? null,
        })
        .returning();
    return media;
};

export const findWorkitemMediaById = async (id: string) => {
    const results = await db
        .select()
        .from(workitemMedia)
        .where(and(eq(workitemMedia.id, id), isNull(workitemMedia.deletedAt)))
        .limit(1);
    return results[0] ?? null;
};

export const findWorkitemMediaPaginated = async (
    workitemId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
) => {
    const filters: SQL[] = [
        eq(workitemMedia.workitemId, workitemId),
        isNull(workitemMedia.deletedAt),
    ];

    if (search) {
        filters.push(ilike(workitemMedia.name, `%${search}%`) as SQL);
    }

    return db
        .select({
            id: workitemMedia.id,
            workitemId: workitemMedia.workitemId,
            memberId: workitemMedia.memberId,
            name: workitemMedia.name,
            url: workitemMedia.url,
            fileType: workitemMedia.fileType,
            fileSize: workitemMedia.fileSize,
            createdAt: workitemMedia.createdAt,
            updatedAt: workitemMedia.updatedAt,
            deletedAt: workitemMedia.deletedAt,
            uploaderName: users.username,
            uploaderEmail: users.email,
        })
        .from(workitemMedia)
        .innerJoin(
            organizationMembers,
            eq(workitemMedia.memberId, organizationMembers.id),
        )
        .innerJoin(users, eq(organizationMembers.memberId, users.id))
        .where(and(...filters))
        .orderBy(desc(workitemMedia.updatedAt))
        .limit(limit)
        .offset((page - 1) * limit);
};

export const countWorkitemMedia = async (
    workitemId: string,
    search?: string,
) => {
    const filters: SQL[] = [
        eq(workitemMedia.workitemId, workitemId),
        isNull(workitemMedia.deletedAt),
    ];

    if (search) {
        filters.push(ilike(workitemMedia.name, `%${search}%`) as SQL);
    }

    const results = await db
        .select({ count: count() })
        .from(workitemMedia)
        .where(and(...filters));
    return results[0]?.count ?? 0;
};

export const softDeleteWorkitemMedia = async (id: string) => {
    const [deleted] = await db
        .update(workitemMedia)
        .set({ deletedAt: new Date() })
        .where(and(eq(workitemMedia.id, id), isNull(workitemMedia.deletedAt)))
        .returning();
    return deleted ?? null;
};
