export interface Notification {
    id: string;
    organizationId: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface NotificationListResponse {
    data: Notification[];
    pagination: NotificationPagination;
}
