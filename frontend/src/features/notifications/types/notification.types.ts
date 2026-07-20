export interface NotificationMetadata {
    orgSlug?: string;
    projectId?: string;
    phaseId?: string;
    sprintId?: string;
    workitemId?: string;
    isDeleted?: boolean;
    [key: string]: any;
}

export interface Notification {
    id: string;
    organizationId: string;
    title: string;
    message: string;
    type: string;
    entityId?: string | null;
    entityType?: string | null;
    metadata?: NotificationMetadata | null;
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
