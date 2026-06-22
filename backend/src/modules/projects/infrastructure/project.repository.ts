import { db } from "../../../infrastructure/database/client.js";
import {
    projects,
    projectMembers,
    organizationMembers,
} from "../../../infrastructure/database/schema/index.js";
import { eq, and, or, ilike, isNull, count, SQL, desc } from "drizzle-orm";

/**
 * Creates a new project in the database.
 * @param data Project input data.
 * @returns The newly created project record.
 */
export const createProject = async (data: {
    organizationId: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    clientName?: string;
    logoUrl?: string;
    status?: "notstarted" | "started" | "onhold" | "completed";
}) => {
    const [project] = await db
        .insert(projects)
        .values({
            organizationId: data.organizationId,
            title: data.title,
            description: data.description ?? null,
            startDate: data.startDate ?? null,
            endDate: data.endDate ?? null,
            clientName: data.clientName ?? null,
            logoUrl: data.logoUrl ?? null,
            status: data.status ?? "notstarted",
        })
        .returning();
    return project;
};

/**
 * Finds an active project by its title within an organization.
 * @param title The project title.
 * @param organizationId The organization UUID.
 * @returns The project record or null.
 */
export const findProjectByTitle = async (
    title: string,
    organizationId: string,
) => {
    const results = await db
        .select()
        .from(projects)
        .where(
            and(
                eq(projects.title, title),
                eq(projects.organizationId, organizationId),
                isNull(projects.deletedAt),
            ),
        )
        .limit(1);
    return results[0] ?? null;
};

/**
 * Finds a project by its primary key within an organization.
 * @param id The project UUID.
 * @param organizationId The organization UUID.
 * @returns The project record or null.
 */
export const findProjectById = async (id: string, organizationId: string) => {
    const results = await db
        .select()
        .from(projects)
        .where(
            and(
                eq(projects.id, id),
                eq(projects.organizationId, organizationId),
                isNull(projects.deletedAt),
            ),
        )
        .limit(1);
    return results[0] ?? null;
};

export const findAllProjects = async (
    organizationId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    userId?: string,
) => {
    const filters: SQL[] = [
        eq(projects.organizationId, organizationId),
        isNull(projects.deletedAt),
    ];

    if (search) {
        filters.push(
            or(
                ilike(projects.title, `%${search}%`),
                ilike(projects.clientName, `%${search}%`),
            ) as SQL,
        );
    }

    if (userId) {
        return db
            .select({
                id: projects.id,
                organizationId: projects.organizationId,
                title: projects.title,
                description: projects.description,
                startDate: projects.startDate,
                endDate: projects.endDate,
                clientName: projects.clientName,
                logoUrl: projects.logoUrl,
                status: projects.status,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
                deletedAt: projects.deletedAt,
            })
            .from(projects)
            .innerJoin(
                projectMembers,
                eq(projects.id, projectMembers.projectId),
            )
            .innerJoin(
                organizationMembers,
                eq(projectMembers.organizationMemberId, organizationMembers.id),
            )
            .where(
                and(
                    ...filters,
                    eq(organizationMembers.memberId, userId),
                    isNull(projectMembers.deletedAt),
                    isNull(organizationMembers.deletedAt),
                ),
            )
            .orderBy(desc(projects.updatedAt))
            .limit(limit)
            .offset((page - 1) * limit);
    }

    return db
        .select()
        .from(projects)
        .where(and(...filters))
        .orderBy(desc(projects.updatedAt))
        .limit(limit)
        .offset((page - 1) * limit);
};

/**
 * Counts active projects for an organization with optional search.
 * @param organizationId The organization UUID.
 * @param search Optional search keyword.
 * @param userId Optional user ID to restrict count to user's projects.
 * @returns Total count.
 */
export const countAllProjects = async (
    organizationId: string,
    search?: string,
    userId?: string,
) => {
    const filters: SQL[] = [
        eq(projects.organizationId, organizationId),
        isNull(projects.deletedAt),
    ];

    if (search) {
        filters.push(
            or(
                ilike(projects.title, `%${search}%`),
                ilike(projects.clientName, `%${search}%`),
            ) as SQL,
        );
    }

    if (userId) {
        const results = await db
            .select({ count: count() })
            .from(projects)
            .innerJoin(
                projectMembers,
                eq(projects.id, projectMembers.projectId),
            )
            .innerJoin(
                organizationMembers,
                eq(projectMembers.organizationMemberId, organizationMembers.id),
            )
            .where(
                and(
                    ...filters,
                    eq(organizationMembers.memberId, userId),
                    isNull(projectMembers.deletedAt),
                    isNull(organizationMembers.deletedAt),
                ),
            );
        return results[0]?.count ?? 0;
    }

    const results = await db
        .select({ count: count() })
        .from(projects)
        .where(and(...filters));
    return results[0]?.count ?? 0;
};

/**
 * Updates a project record.
 * @param id The project UUID.
 * @param organizationId The organization UUID.
 * @param data Partial fields to update.
 * @returns The updated project record.
 */
export const updateProject = async (
    id: string,
    organizationId: string,
    data: {
        title?: string;
        description?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        clientName?: string | null;
        logoUrl?: string | null;
        status?: "notstarted" | "started" | "onhold" | "completed";
    },
) => {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.startDate !== undefined) updates.startDate = data.startDate;
    if (data.endDate !== undefined) updates.endDate = data.endDate;
    if (data.clientName !== undefined) updates.clientName = data.clientName;
    if (data.logoUrl !== undefined) updates.logoUrl = data.logoUrl;
    if (data.status !== undefined) updates.status = data.status;

    const [updated] = await db
        .update(projects)
        .set(updates)
        .where(
            and(
                eq(projects.id, id),
                eq(projects.organizationId, organizationId),
                isNull(projects.deletedAt),
            ),
        )
        .returning();
    return updated ?? null;
};

/**
 * Soft-deletes a project by setting deletedAt.
 * @param id The project UUID.
 * @param organizationId The organization UUID.
 * @returns The deleted project record.
 */
export const softDeleteProject = async (id: string, organizationId: string) => {
    const [deleted] = await db
        .update(projects)
        .set({ deletedAt: new Date() })
        .where(
            and(
                eq(projects.id, id),
                eq(projects.organizationId, organizationId),
                isNull(projects.deletedAt),
            ),
        )
        .returning();
    return deleted ?? null;
};

/**
 * Finds a project member mapping including soft deleted records.
 * @param projectId The project UUID.
 * @param organizationMemberId The organization member UUID.
 * @returns The project member record or null.
 */
export const findProjectMemberWithDeleted = async (
    projectId: string,
    organizationMemberId: string,
) => {
    const results = await db
        .select()
        .from(projectMembers)
        .where(
            and(
                eq(projectMembers.projectId, projectId),
                eq(projectMembers.organizationMemberId, organizationMemberId),
            ),
        )
        .limit(1);
    return results[0] ?? null;
};

/**
 * Adds an organization member to a project.
 * @param projectId The project UUID.
 * @param organizationMemberId The organization member UUID.
 * @returns The newly created project member record.
 */
export const addProjectMember = async (
    projectId: string,
    organizationMemberId: string,
) => {
    const existing = await findProjectMemberWithDeleted(
        projectId,
        organizationMemberId,
    );
    if (existing) {
        const [member] = await db
            .update(projectMembers)
            .set({ deletedAt: null, updatedAt: new Date() })
            .where(eq(projectMembers.id, existing.id))
            .returning();
        return member;
    }
    const [member] = await db
        .insert(projectMembers)
        .values({ projectId, organizationMemberId })
        .returning();
    return member;
};

/**
 * Finds an active project member mapping.
 * @param projectId The project UUID.
 * @param organizationMemberId The organization member UUID.
 * @returns The project member record or null.
 */
export const findProjectMember = async (
    projectId: string,
    organizationMemberId: string,
) => {
    const results = await db
        .select()
        .from(projectMembers)
        .where(
            and(
                eq(projectMembers.projectId, projectId),
                eq(projectMembers.organizationMemberId, organizationMemberId),
                isNull(projectMembers.deletedAt),
            ),
        )
        .limit(1);
    return results[0] ?? null;
};

/**
 * Retrieves all active members for a project.
 * @param projectId The project UUID.
 * @returns Array of project member records.
 */
export const findMembersByProjectId = async (projectId: string) => {
    return db
        .select()
        .from(projectMembers)
        .where(
            and(
                eq(projectMembers.projectId, projectId),
                isNull(projectMembers.deletedAt),
            ),
        );
};

/**
 * Soft-deletes a project member mapping.
 * @param projectId The project UUID.
 * @param organizationMemberId The organization member UUID.
 * @returns The removed member record or null.
 */
export const removeProjectMember = async (
    projectId: string,
    organizationMemberId: string,
) => {
    const [removed] = await db
        .update(projectMembers)
        .set({ deletedAt: new Date() })
        .where(
            and(
                eq(projectMembers.projectId, projectId),
                eq(projectMembers.organizationMemberId, organizationMemberId),
                isNull(projectMembers.deletedAt),
            ),
        )
        .returning();
    return removed ?? null;
};
