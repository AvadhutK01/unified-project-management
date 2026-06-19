import { api } from "@/lib/axios";
import type { PhaseFormValues } from "../schema/phases.schema";
import type {
    CreatePhasePayload,
    UpdatePhasePayload,
} from "../types/phase.types";

export const convertFormToPayload = (
    form: PhaseFormValues,
    projectId: string,
): CreatePhasePayload => {
    const typeValue =
        form.type === "Custom" ? (form.customType ?? "") : form.type;

    return {
        projectId,
        name: form.name,
        description: form.description,
        type: typeValue,
        startDate: form.startDate ? formatDate(form.startDate) : "",
        endDate: form.endDate ? formatDate(form.endDate) : "",
        status: form.status,
    };
};

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const convertFormToUpdatePayload = (
    form: PhaseFormValues,
): UpdatePhasePayload => {
    const typeValue =
        form.type === "Custom" ? (form.customType ?? "") : form.type;

    return {
        name: form.name,
        description: form.description,
        type: typeValue,
        startDate: form.startDate ? formatDate(form.startDate) : "",
        endDate: form.endDate ? formatDate(form.endDate) : "",
        status: form.status,
    };
};

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
