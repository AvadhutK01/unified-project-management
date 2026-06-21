import { api } from "@/lib/axios";
import type {
    CreatePhasePayload,
    UpdatePhasePayload,
} from "../types/phase.types";

export const fetchPhases = async ({
    projectId,
    search = "",
}: {
    projectId: string;
    search?: string;
}) => {
    const params = new URLSearchParams({ projectId });
    if (search) params.set("search", search);
    const { data } = await api.get(`/phases?${params.toString()}`);
    return data;
};

export const createPhase = async (payload: CreatePhasePayload) => {
    const { data } = await api.post("/phases", payload);
    return data;
};

export const updatePhase = async ({
    id,
    payload,
}: {
    id: number;
    payload: UpdatePhasePayload;
}) => {
    const { data } = await api.put(`/phases/${id}`, payload);
    return data;
};

export const deletePhase = async (id: number) => {
    const { data } = await api.delete(`/phases/${id}`);
    return data;
};

export const fetchPhaseById = async (id: string) => {
    const { data } = await api.get(`/phases/${id}`);
    return data;
};
