import { db } from "../../../infrastructure/database/client.js";
import {
    sprintActivityLogs,
    users,
} from "../../../infrastructure/database/schema/index.js";
import { eq, desc, count, and } from "drizzle-orm";

/**
 * Creates a new sprint activity log entry.
 * @param data Activity log input data.
 * @returns The newly created activity log record.
 */
export const createActivityLog = async (data: {
    sprintId: string;
    userId: string;
    action: string;
    description: string;
}) => {
    const [log] = await db
        .insert(sprintActivityLogs)
        .values({
            sprintId: data.sprintId,
            userId: data.userId,
            action: data.action,
            description: data.description,
        })
        .returning();
    return log;
};

/**
 * Retrieves paginated activity logs for a specific sprint, including the user details who performed the action.
 * @param sprintId The sprint UUID.
 * @param page Page number.
 * @param limit Items per page.
 * @returns Array of activity logs with user info.
 */
export const findActivityLogsBySprintId = async (
    sprintId: string,
    page: number = 1,
    limit: number = 10,
) => {
    return db
        .select({
            id: sprintActivityLogs.id,
            sprintId: sprintActivityLogs.sprintId,
            action: sprintActivityLogs.action,
            description: sprintActivityLogs.description,
            createdAt: sprintActivityLogs.createdAt,
            user: {
                id: users.id,
                username: users.username,
                email: users.email,
            },
        })
        .from(sprintActivityLogs)
        .innerJoin(users, eq(sprintActivityLogs.userId, users.id))
        .where(eq(sprintActivityLogs.sprintId, sprintId))
        .orderBy(desc(sprintActivityLogs.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);
};

/**
 * Counts total activity logs for a specific sprint.
 * @param sprintId The sprint UUID.
 * @returns Total count.
 */
export const countActivityLogsBySprintId = async (sprintId: string) => {
    const results = await db
        .select({ count: count() })
        .from(sprintActivityLogs)
        .where(eq(sprintActivityLogs.sprintId, sprintId));
    return results[0]?.count ?? 0;
};
