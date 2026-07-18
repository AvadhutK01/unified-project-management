export interface UpdateSprintPayload {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    sequence: number;
    acceptanceCriteria: string;
    status: string;
}

export interface CreateSprintPayload {
    phaseId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    sequence: number;
    acceptanceCriteria: string;
    status: string;
}

export type SprintStatus = "new" | "active" | "closed" | "removed" | "onhold";

export type WorkItemStatus =
    | "new"
    | "active"
    | "resolved"
    | "closed"
    | "removed"
    | "onhold";

export interface SprintMetrics {
    totalWorkItems: number;
    workitemsByStatus: Record<WorkItemStatus, number>;
}

export interface SprintItem {
    id: string;
    title: string;
    description: string;
    acceptanceCriteria: string;
    projectTitle: string;
    phaseTitle: string;
    status: SprintStatus;
    startDate?: string;
    endDate?: string;
    sequence?: number;
    metrics?: SprintMetrics;
}

export interface StatusSelectCellProps {
    sprint: SprintItem;
    pendingSprintId?: string | null;
    onStatusChange?: (sprint: SprintItem, newStatus: string) => void;
}

export interface SprintListProps {
    sprints: SprintItem[];
    pendingSprintId?: string | null;
    onEditRequest?: (sprint: SprintItem) => void;
    onStatusChange?: (sprint: SprintItem, newStatus: string) => void;
    canEdit?: boolean;
    canDelete?: boolean;
    canView?: boolean;
    canViewWorkItems?: boolean;
}

export interface AddSprintModalProps {
    onAddSprint: (sprint: SprintItem) => void;
    canAdd: boolean;
}

export interface EditSprintModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sprint: SprintItem | null;
    onEditSprint: (sprint: SprintItem) => void;
}

// Sprint Details Page component prop types

export interface SprintDetailsErrorProps {
    slug: string;
    projectId: string;
    phaseId: string;
    sprintError: Error | null;
}

export interface SprintDetailsHeaderProps {
    sprint: SprintItem;
    project: { name: string } | null;
    phaseName: string;
    slug: string;
    projectId: string;
    phaseId: string;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: (status: string) => void;
}

export interface SprintOverviewTabProps {
    sprint: SprintItem;
}

export type SprintCommentsTabMention = {
    id: string;
    name: string;
};

export interface SprintCommentsTabProps {
    sprintId: string;
    discussions: any[];
    isCommentsLoading: boolean;
    currentUserEmail: string;
    isSubmittingComment: boolean;
    onAddComment: (
        comment: string,
        mentions?: SprintCommentsTabMention[],
    ) => void;
    onDeleteComment: (discussionId: string) => void;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    users: { id: string; name: string }[];
}

export interface SprintAttachmentsTabProps {
    mediaList: any[];
    isMediaLoading: boolean;
    currentUserEmail: string;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteMedia: (mediaId: string) => void;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
}

export interface SprintActivitiesTabProps {
    activities: any[];
    isActivitiesLoading: boolean;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
}

export interface SprintTrackerCardProps {
    sprint: SprintItem;
}

export interface SprintDetailsCardProps {
    sprint: SprintItem;
    project: { name: string } | null;
    phaseId: string;
}
