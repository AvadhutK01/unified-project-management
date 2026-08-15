import {
    createWorkitem as createWorkitemRepo,
    findWorkitemById,
    findAllWorkitems,
    countAllWorkitems,
    updateWorkitem as updateWorkitemRepo,
    updateWorkitemStatus as updateWorkitemStatusRepo,
    softDeleteWorkitem,
} from "../infrastructure/workitem.repository.js";
import {
    createActivityLog,
    findActivityLogsByWorkitemId,
    countActivityLogsByWorkitemId,
} from "../infrastructure/workitem-activity-log.repository.js";
import { findSprintById } from "../../sprints/infrastructure/sprint.repository.js";
import { findPhaseById } from "../../phases/infrastructure/phase.repository.js";
import {
    badRequestError,
    notFoundError,
    internalServerError,
} from "../../../shared/errors/app-error.js";
import { verifyProjectAccess } from "../../projects/application/project.use-cases.js";
import { findProjectById } from "../../projects/infrastructure/project.repository.js";
import { findOrganizationById } from "../../organizations/infrastructure/organization.repository.js";
import { validateWorkitemTransition } from "../../../shared/utils/status-transitions.js";
import {
    notifyTaskAssignment,
    notifyTaskUpdate,
    notifyTaskStatusUpdate,
    notifyTaskDeletion,
} from "../../notifications/application/notification.service.js";
import {
    WORKITEM_STATUS,
    WORKITEM_TYPE,
} from "../../../shared/constants/enumConstants.js";

/**
 * Generates a readable change log description string by comparing old and new workitem property values.
 * @param oldWorkitem The original workitem object before updates.
 * @param data The new property updates object.
 * @returns Human-readable description string summarizing all modified fields.
 */
const generateUpdateDescription = (
    oldWorkitem: NonNullable<Awaited<ReturnType<typeof findWorkitemById>>>,
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
        originalEstimation?: number | null;
        remaining?: number | null;
        completed?: number | null;
    },
): string => {
    const changes: string[] = [];
    if (data.title !== undefined && data.title !== oldWorkitem.title) {
        changes.push(
            `Updated title from '${oldWorkitem.title}' to '${data.title}'`,
        );
    }
    if (
        data.description !== undefined &&
        data.description !== oldWorkitem.description
    ) {
        const oldVal = oldWorkitem.description
            ? `'${oldWorkitem.description}'`
            : "empty";
        const newVal = data.description ? `'${data.description}'` : "empty";
        changes.push(`Updated description from ${oldVal} to ${newVal}`);
    }
    if (
        data.assignedTo !== undefined &&
        data.assignedTo !== oldWorkitem.assignedTo
    ) {
        changes.push(`Updated assignment`);
    }
    if (data.priority !== undefined && data.priority !== oldWorkitem.priority) {
        changes.push(
            `Updated priority from ${oldWorkitem.priority} to ${data.priority}`,
        );
    }
    if (
        data.acceptanceCriteria !== undefined &&
        data.acceptanceCriteria !== oldWorkitem.acceptanceCriteria
    ) {
        const oldVal = oldWorkitem.acceptanceCriteria
            ? `'${oldWorkitem.acceptanceCriteria}'`
            : "empty";
        const newVal = data.acceptanceCriteria
            ? `'${data.acceptanceCriteria}'`
            : "empty";
        changes.push(`Updated acceptance criteria from ${oldVal} to ${newVal}`);
    }
    if (data.status !== undefined && data.status !== oldWorkitem.status) {
        changes.push(
            `Updated status from '${oldWorkitem.status}' to '${data.status}'`,
        );
    }
    if (
        data.workitemType !== undefined &&
        data.workitemType !== oldWorkitem.workitemType
    ) {
        changes.push(
            `Updated type from '${oldWorkitem.workitemType}' to '${data.workitemType}'`,
        );
    }
    if (
        data.originalEstimation !== undefined &&
        data.originalEstimation !== oldWorkitem.originalEstimation
    ) {
        changes.push(
            `Updated original estimation from ${oldWorkitem.originalEstimation} to ${data.originalEstimation}`,
        );
    }
    if (
        data.remaining !== undefined &&
        data.remaining !== oldWorkitem.remaining
    ) {
        changes.push(
            `Updated remaining estimation from ${oldWorkitem.remaining} to ${data.remaining}`,
        );
    }
    if (
        data.completed !== undefined &&
        data.completed !== oldWorkitem.completed
    ) {
        changes.push(
            `Updated completed estimation from ${oldWorkitem.completed} to ${data.completed}`,
        );
    }
    return changes.length > 0 ? changes.join(". ") + "." : "No changes made.";
};

export const createWorkitem = async (data: {
    title: string;
    description?: string;
    sprintId: string;
    assignedTo?: string;
    status?: "new" | "active" | "resolved" | "closed" | "removed" | "onhold";
    priority?: number;
    acceptanceCriteria?: string;
    workitemType: "task" | "bug";
    originalEstimation?: number;
    remaining?: number;
    completed?: number;
    organizationId: string;
    userId: string;
}) => {
    if (
        data.workitemType === WORKITEM_TYPE.TASK &&
        data.status === WORKITEM_STATUS.RESOLVED
    ) {
        throw badRequestError(
            "Task workitems cannot have a 'resolved' status.",
        );
    }

    const sprint = await findSprintById(data.sprintId);
    if (!sprint) {
        throw notFoundError("Sprint not found");
    }

    const phase = await findPhaseById(sprint.phaseId);
    if (!phase) {
        throw notFoundError("Parent phase not found");
    }

    await verifyProjectAccess(
        phase.projectId,
        data.organizationId,
        data.userId,
    );

    const workitem = await createWorkitemRepo({
        title: data.title,
        sprintId: data.sprintId,
        ...(data.description !== undefined && {
            description: data.description,
        }),
        ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.acceptanceCriteria !== undefined && {
            acceptanceCriteria: data.acceptanceCriteria,
        }),
        ...(data.originalEstimation !== undefined && {
            originalEstimation: data.originalEstimation,
        }),
        ...(data.remaining !== undefined && { remaining: data.remaining }),
        ...(data.completed !== undefined && { completed: data.completed }),
        workitemType: data.workitemType,
    });

    if (!workitem) {
        throw internalServerError("Failed to create workitem");
    }

    await createActivityLog({
        workitemId: workitem.id,
        userId: data.userId,
        action: "created",
        description: "Workitem created",
    });

    await notifyTaskAssignment(workitem, data.userId);

    return workitem;
};

export const getWorkitemById = async (
    id: string,
    organizationId: string,
    userId: string,
) => {
    const workitem = await findWorkitemById(id);
    if (!workitem) {
        throw notFoundError("Workitem not found");
    }

    const sprint = await findSprintById(workitem.sprintId);
    if (!sprint) {
        throw notFoundError("Parent sprint not found");
    }

    const phase = await findPhaseById(sprint.phaseId);
    if (!phase) {
        throw notFoundError("Parent phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    const project = await findProjectById(phase.projectId, organizationId);
    const org = await findOrganizationById(organizationId);

    return {
        ...workitem,
        sprintTitle: sprint.title,
        phaseId: phase.id,
        phaseTitle: phase.name,
        projectId: phase.projectId,
        projectTitle: project?.title,
        organizationId: organizationId,
        organizationName: org?.name,
    };
};

export const getAllWorkitems = async (
    sprintId: string,
    organizationId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
) => {
    const sprint = await findSprintById(sprintId);
    if (!sprint) {
        throw notFoundError("Sprint not found");
    }

    const phase = await findPhaseById(sprint.phaseId);
    if (!phase) {
        throw notFoundError("Parent phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    const [data, total] = await Promise.all([
        findAllWorkitems(sprintId, page, limit, search, status),
        countAllWorkitems(sprintId, search, status),
    ]);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const updateWorkitem = async (
    id: string,
    organizationId: string,
    userId: string,
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
        originalEstimation?: number | null;
        remaining?: number | null;
        completed?: number | null;
    },
) => {
    const workitem = await findWorkitemById(id);
    if (!workitem) {
        throw notFoundError("Workitem not found");
    }

    const sprint = await findSprintById(workitem.sprintId);
    if (!sprint) {
        throw notFoundError("Parent sprint not found");
    }

    const phase = await findPhaseById(sprint.phaseId);
    if (!phase) {
        throw notFoundError("Parent phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    const resultingType = data.workitemType ?? workitem.workitemType;
    const resultingStatus = data.status ?? workitem.status;

    if (
        resultingType === WORKITEM_TYPE.TASK &&
        resultingStatus === WORKITEM_STATUS.RESOLVED
    ) {
        throw badRequestError(
            "Task workitems cannot have a 'resolved' status.",
        );
    }

    if (data.status && data.status !== workitem.status) {
        validateWorkitemTransition(workitem.status as string, data.status);
    }

    const description = generateUpdateDescription(workitem, data);

    const updated = await updateWorkitemRepo(id, data);
    if (!updated) {
        throw internalServerError("Failed to update workitem");
    }

    await createActivityLog({
        workitemId: id,
        userId,
        action: "updated",
        description,
    });

    if (
        data.assignedTo !== undefined &&
        data.assignedTo !== workitem.assignedTo
    ) {
        await notifyTaskAssignment(updated, userId);
    } else {
        await notifyTaskUpdate(updated, description, userId);
    }

    return updated;
};

export const updateWorkitemStatus = async (
    id: string,
    organizationId: string,
    userId: string,
    status: "new" | "active" | "resolved" | "closed" | "removed" | "onhold",
) => {
    const workitem = await findWorkitemById(id);
    if (!workitem) {
        throw notFoundError("Workitem not found");
    }

    if (
        workitem.workitemType === WORKITEM_TYPE.TASK &&
        status === WORKITEM_STATUS.RESOLVED
    ) {
        throw badRequestError(
            "Task workitems cannot have a 'resolved' status.",
        );
    }

    const sprint = await findSprintById(workitem.sprintId);
    if (!sprint) {
        throw notFoundError("Parent sprint not found");
    }

    const phase = await findPhaseById(sprint.phaseId);
    if (!phase) {
        throw notFoundError("Parent phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    if (status !== workitem.status) {
        validateWorkitemTransition(workitem.status as string, status);
    }

    const oldStatus = workitem.status;

    const updated = await updateWorkitemStatusRepo(id, status);
    if (!updated) {
        throw internalServerError("Failed to update workitem status");
    }

    await createActivityLog({
        workitemId: id,
        userId,
        action: "status_updated",
        description: `Status updated from '${oldStatus}' to '${status}'`,
    });

    await notifyTaskStatusUpdate(
        updated,
        oldStatus || WORKITEM_STATUS.NEW,
        status,
        userId,
    );

    return updated;
};

export const deleteWorkitem = async (
    id: string,
    organizationId: string,
    userId: string,
) => {
    const workitem = await findWorkitemById(id);
    if (!workitem) {
        throw notFoundError("Workitem not found");
    }

    const sprint = await findSprintById(workitem.sprintId);
    if (!sprint) {
        throw notFoundError("Parent sprint not found");
    }

    const phase = await findPhaseById(sprint.phaseId);
    if (!phase) {
        throw notFoundError("Parent phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    const deleted = await softDeleteWorkitem(id);
    if (!deleted) {
        throw internalServerError("Failed to delete workitem");
    }

    await createActivityLog({
        workitemId: id,
        userId,
        action: "deleted",
        description: "Workitem soft-deleted",
    });

    await notifyTaskDeletion(workitem, userId);

    return deleted;
};

export const getWorkitemActivities = async (
    workitemId: string,
    organizationId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
) => {
    const workitem = await findWorkitemById(workitemId);
    if (!workitem) {
        throw notFoundError("Workitem not found");
    }

    const sprint = await findSprintById(workitem.sprintId);
    if (!sprint) {
        throw notFoundError("Parent sprint not found");
    }

    const phase = await findPhaseById(sprint.phaseId);
    if (!phase) {
        throw notFoundError("Parent phase not found");
    }

    await verifyProjectAccess(phase.projectId, organizationId, userId);

    const [data, total] = await Promise.all([
        findActivityLogsByWorkitemId(workitemId, page, limit),
        countActivityLogsByWorkitemId(workitemId),
    ]);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
