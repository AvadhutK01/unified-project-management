import type { WorkItemFormValues } from "../schema/workitem.schema";
import type { CreateWorkItemPayload } from "../types/workitem.types";

export const convertFormToPayload = (
    form: WorkItemFormValues,
    sprintId: string,
): CreateWorkItemPayload => {
    return {
        sprintId,
        title: form.title,
        description: form.description,
        acceptanceCriteria: form.acceptanceCriteria,
        status: form.status,
        type: form.type,
        originalEstimation: form.estimatedTime,
        remaining: form.remainingTime,
        completed: form.completionTime,
        assignedTo: form.assignedTo,
    };
};

export const formatHours = (hours: number): string => {
    if (!hours && hours !== 0) return "-";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

export const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export const getAvatarColorClass = (email: string) => {
    const colors = [
        "bg-rose-500/20 text-rose-300 border-rose-500/30",
        "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        "bg-sky-500/20 text-sky-300 border-sky-500/30",
        "bg-amber-500/20 text-amber-300 border-amber-500/30",
        "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        "bg-violet-500/20 text-violet-300 border-violet-500/30",
        "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
        "bg-teal-500/20 text-teal-300 border-teal-500/30",
    ];
    let hash = 0;
    for (let i = 0; i < email?.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

export const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};
