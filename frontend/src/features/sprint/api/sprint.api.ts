import { api } from "@/lib/axios";
import type {
    CreateSprintPayload,
    UpdateSprintPayload,
} from "../types/sprint.types";

export const fetchSprints = async ({
    phaseId,
    page = 1,
    limit = 10,
    status,
}: {
    phaseId: string;
    page?: number;
    limit?: number;
    status?: string;
}) => {
    const params = new URLSearchParams({ phaseId });
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (status) params.set("status", status);
    const { data } = await api.get(`/sprints?${params.toString()}`);
    return data;
};

export const createSprint = async (payload: CreateSprintPayload) => {
    const { data } = await api.post("/sprints", payload);
    return data;
};

export const updateSprint = async ({
    id,
    payload,
}: {
    id: string;
    payload: UpdateSprintPayload;
}) => {
    const { data } = await api.put(`/sprints/${id}`, payload);
    return data;
};

export const fetchSprintById = async (id: string) => {
    const { data } = await api.get(`/sprints/${id}`);
    return data;
};

export const deleteSprint = async (id: string) => {
    const { data } = await api.delete(`/sprints/${id}`);
    return data;
};

export const fetchSprintActivities = async (
    id: string,
    page = 1,
    limit = 50,
) => {
    const { data } = await api.get(`/sprints/${id}/activities`, {
        params: { page, limit },
    });
    return data;
};

export const fetchSprintDiscussions = async (
    sprintId: string,
    page = 1,
    limit = 50,
) => {
    const { data } = await api.get(`/sprints/${sprintId}/discussions`, {
        params: { page, limit },
    });
    return data;
};

export const createSprintDiscussion = async ({
    sprintId,
    comment,
}: {
    sprintId: string;
    comment: string;
}) => {
    const { data } = await api.post(`/sprints/${sprintId}/discussions`, {
        comment,
    });
    return data;
};

export const deleteSprintDiscussion = async ({
    sprintId,
    discussionId,
}: {
    sprintId: string;
    discussionId: string;
}) => {
    const { data } = await api.delete(
        `/sprints/${sprintId}/discussions/${discussionId}`,
    );
    return data;
};

export const fetchSprintMedia = async (
    sprintId: string,
    page = 1,
    limit = 50,
) => {
    const { data } = await api.get(`/sprints/${sprintId}/media`, {
        params: { page, limit },
    });
    return data;
};

export const uploadSprintMedia = async ({
    sprintId,
    file,
}: {
    sprintId: string;
    file: File;
}) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(`/sprints/${sprintId}/media`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
};

export const deleteSprintMedia = async ({
    sprintId,
    mediaId,
}: {
    sprintId: string;
    mediaId: string;
}) => {
    const { data } = await api.delete(`/sprints/${sprintId}/media/${mediaId}`);
    return data;
};
