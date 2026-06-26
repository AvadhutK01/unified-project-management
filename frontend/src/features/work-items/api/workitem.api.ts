import { api } from "@/lib/axios";
import type {
    CreateWorkItemPayload,
    UpdateWorkItemPayload,
    WorkItem,
} from "../types/workitem.types";

export const mapWorkItem = (item: any): WorkItem => ({
    id: item.id,
    title: item.title,
    description: item.description || "",
    acceptanceCriteria: item.acceptanceCriteria || "",
    status: item.status,
    type: item.workitemType,
    originalEstimation: item.originalEstimation,
    remaining: item.remaining,
    completed: item.completed,
    assignedTo: item.assignedTo || null,
    assignedToName: item.assignedToName || null,
    assignedToEmail: item.assignedToEmail || null,
    projectId: item.projectId || null,
    phaseId: item.phaseId || null,
    projectTitle: item.projectTitle || null,
    phaseTitle: item.phaseTitle || null,
    sprintTitle: item.sprintTitle || null,
    organizationName: item.organizationName || null,
});

export const fetchWorkItems = async ({
    sprintId,
    page = 1,
    limit = 10,
    status,
}: {
    sprintId: string;
    page?: number;
    limit?: number;
    status?: string;
}) => {
    const params = new URLSearchParams({ sprintId });
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (status) params.set("status", status);
    const { data } = await api.get(`/workitems?${params.toString()}`);
    return data;
};

export const createWorkItem = async (payload: CreateWorkItemPayload) => {
    const backendPayload = {
        sprintId: payload.sprintId,
        title: payload.title,
        description: payload.description || undefined,
        acceptanceCriteria: payload.acceptanceCriteria || undefined,
        status: payload.status,
        workitemType: payload.type,
        assignedTo:
            payload.assignedTo && payload.assignedTo !== "none"
                ? payload.assignedTo
                : null,
        originalEstimation: payload.originalEstimation,
        remaining: payload.remaining,
        completed: payload.completed,
    };
    const { data } = await api.post("/workitems", backendPayload);
    return mapWorkItem(data.data);
};

export const updateWorkItem = async ({
    id,
    payload,
}: {
    id: string;
    payload: UpdateWorkItemPayload;
}) => {
    const backendPayload = {
        title: payload.title,
        description: payload.description || null,
        acceptanceCriteria: payload.acceptanceCriteria || null,
        status: payload.status,
        workitemType: payload.type,
        assignedTo:
            payload.assignedTo && payload.assignedTo !== "none"
                ? payload.assignedTo
                : null,
        originalEstimation: payload.originalEstimation,
        remaining: payload.remaining,
        completed: payload.completed,
    };
    const { data } = await api.put(`/workitems/${id}`, backendPayload);
    return mapWorkItem(data.data);
};

export const fetchWorkItemById = async (id: string) => {
    const { data } = await api.get(`/workitems/${id}`);
    return mapWorkItem(data.data);
};

export const deleteWorkItem = async (id: string) => {
    const { data } = await api.delete(`/workitems/${id}`);
    return data;
};

export const updateWorkItemStatus = async ({
    id,
    status,
}: {
    id: string;
    status: string;
}) => {
    const { data } = await api.patch(`/workitems/${id}/status`, { status });
    return mapWorkItem(data.data);
};

export const fetchWorkItemDiscussions = async (
    id: string,
    page = 1,
    limit = 50,
) => {
    const { data } = await api.get(`/workitems/${id}/discussions`, {
        params: { page, limit },
    });
    return data;
};

export const createWorkItemDiscussion = async ({
    id,
    comment,
    taggedMemberIds,
}: {
    id: string;
    comment: string;
    taggedMemberIds?: string[];
}) => {
    const { data } = await api.post(`/workitems/${id}/discussions`, {
        comment,
        taggedMemberIds,
    });
    return data;
};

export const deleteWorkItemDiscussion = async ({
    id,
    discussionId,
}: {
    id: string;
    discussionId: string;
}) => {
    const { data } = await api.delete(
        `/workitems/${id}/discussions/${discussionId}`,
    );
    return data;
};

export const fetchWorkItemActivities = async (
    id: string,
    page = 1,
    limit = 50,
) => {
    const { data } = await api.get(`/workitems/${id}/activities`, {
        params: { page, limit },
    });
    return data;
};

export const fetchWorkItemMedia = async (id: string, page = 1, limit = 50) => {
    const { data } = await api.get(`/workitems/${id}/media`, {
        params: { page, limit },
    });
    return data;
};

export const uploadWorkItemMedia = async ({
    id,
    file,
}: {
    id: string;
    file: File;
}) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(`/workitems/${id}/media`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
};

export const deleteWorkItemMedia = async ({
    id,
    mediaId,
}: {
    id: string;
    mediaId: string;
}) => {
    const { data } = await api.delete(`/workitems/${id}/media/${mediaId}`);
    return data;
};
