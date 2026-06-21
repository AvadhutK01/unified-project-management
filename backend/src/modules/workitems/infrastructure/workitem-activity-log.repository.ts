import { db } from "../../../infrastructure/database/client.js";
import {
    workitemActivityLogs,
    users,
} from "../../../infrastructure/database/schema/index.js";
import { eq, desc, count } from "drizzle-orm";

export const createActivityLog = async (data: {
    workitemId: string;
    userId: string;
    action: string;
    description: string;
}) => {
    const [log] = await db
        .insert(workitemActivityLogs)
        .values({
            workitemId: data.workitemId,
            userId: data.userId,
            action: data.action,
            description: data.description,
        })
        .returning();
    return log;
};

export const findActivityLogsByWorkitemId = async (
    workitemId: string,
    page: number = 1,
    limit: number = 10,
) => {
    return db
        .select({
            id: workitemActivityLogs.id,
            workitemId: workitemActivityLogs.workitemId,
            action: workitemActivityLogs.action,
            description: workitemActivityLogs.description,
            createdAt: workitemActivityLogs.createdAt,
            user: {
                id: users.id,
                username: users.username,
                email: users.email,
            },
        })
        .from(workitemActivityLogs)
        .innerJoin(users, eq(workitemActivityLogs.userId, users.id))
        .where(eq(workitemActivityLogs.workitemId, workitemId))
        .orderBy(desc(workitemActivityLogs.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);
};

export const countActivityLogsByWorkitemId = async (workitemId: string) => {
    const results = await db
        .select({ count: count() })
        .from(workitemActivityLogs)
        .where(eq(workitemActivityLogs.workitemId, workitemId));
    return results[0]?.count ?? 0;
};
