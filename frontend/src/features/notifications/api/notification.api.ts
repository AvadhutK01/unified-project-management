import { api } from "@/lib/axios";
import type { NotificationListResponse } from "../types/notification.types";

export const getNotifications = async (
    page: number = 1,
    limit: number = 10,
): Promise<NotificationListResponse> => {
    const response = await api.get<NotificationListResponse>("/notifications", {
        params: { page, limit },
    });
    return response.data;
};

export const markAsRead = async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
    await api.post("/notifications/read-all");
};
