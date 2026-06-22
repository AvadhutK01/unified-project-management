export interface CreateWorkItemPayload {
    sprintId: string;
    title: string;
    description?: string;
    acceptanceCriteria?: string;
    status?: string;
    type?: string;
    originalEstimation?: number;
    remaining?: number;
    completed?: number;
    assignedTo?: string | null;
}

export interface UpdateWorkItemPayload {
    title?: string;
    description?: string | null;
    acceptanceCriteria?: string | null;
    status?: string;
    type?: string;
    originalEstimation?: number;
    remaining?: number;
    completed?: number;
    assignedTo?: string | null;
}

export type WorkItemStatus =
    | "new"
    | "active"
    | "resolved"
    | "closed"
    | "removed"
    | "onhold";

export type WorkItemType = "task" | "bug";

export interface WorkItem {
    id: string;
    title: string;
    description: string;
    acceptanceCriteria: string;
    status: WorkItemStatus;
    type: WorkItemType;
    originalEstimation?: number;
    remaining?: number;
    completed?: number;
    assignedTo: string | null;
    assignedToName: string | null;
    assignedToEmail: string | null;
    projectId?: string | null;
    phaseId?: string | null;
    projectTitle?: string | null;
    phaseTitle?: string | null;
    sprintTitle?: string | null;
    organizationName?: string | null;
}

export interface StatusSelectCellProps {
    workItem: WorkItem;
    pendingWorkItemId?: string | null;
    onStatusChange?: (workItem: WorkItem, newStatus: string) => void;
}

export interface WorkItemListProps {
    workItems: WorkItem[];
    pendingWorkItemId?: string | null;
    onEditRequest?: (workItem: WorkItem) => void;
    onStatusChange?: (workItem: WorkItem, newStatus: string) => void;
    onDeleteRequest?: (workItem: WorkItem) => void;
    projectMembers?: Array<{ id: string; name: string; email: string }>;
    canEdit?: boolean;

    canDelete?: boolean;
    canView?: boolean;
}

export interface AddWorkItemModalProps {
    onAddWorkItem: (workItem: WorkItem) => void;
    canAdd: boolean;
}

export interface EditWorkItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workItem: WorkItem | null;
    onEditWorkItem: (workItem: WorkItem) => void;
}
