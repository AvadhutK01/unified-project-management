import type { PhaseFormValues } from "../schema/phases.schema";
import type {
    CreatePhasePayload,
    UpdatePhasePayload,
} from "../types/phase.types";

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

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
