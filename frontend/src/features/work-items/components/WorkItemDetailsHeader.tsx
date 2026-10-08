import { Pencil, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetaItem, PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WorkflowStatusSelect } from "@/components/common/WorkflowStatusSelect";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { WORKFLOW_TONE } from "@/lib/tones";
import {
    WORK_ITEM_STATUS_OPTIONS,
    STATUS_LABELS,
} from "../constants/workitem.constants";
import type { WorkItem, WorkItemStatus } from "../types/workitem.types";
import { WorkItemTypeBadge, WorkItemTypeIcon } from "./WorkItemTypeBadge";

interface WorkItemDetailsHeaderProps {
    workItem: WorkItem;
    project: any;
    phaseName: string | undefined;
    sprintName: string | undefined;
    slug: string;
    projectId: string;
    phaseId: string;
    sprintId: string;
    canEdit: boolean;
    canDelete: boolean;
    canChangeStatus: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: (status: string) => void;
}

const WorkItemDetailsHeader = ({
    workItem,
    project,
    phaseName,
    sprintName,
    slug,
    projectId,
    phaseId,
    sprintId,
    canEdit,
    canDelete,
    canChangeStatus,
    onEdit,
    onDelete,
    onStatusChange,
}: WorkItemDetailsHeaderProps) => {
    const phasesHref = `/${slug}/projects/${projectId}/phases`;
    const sprintHref = `${phasesHref}/${phaseId}/sprints/${sprintId}`;
    const status = workItem.status as WorkItemStatus;

    return (
        <PageHeader
            breadcrumbs={[
                { label: "Projects", to: `/${slug}/projects` },
                {
                    label: project?.name || "Project",
                    to: `/${slug}/projects/${projectId}`,
                },
                {
                    label: phaseName || "Phase",
                    to: `${phasesHref}/${phaseId}`,
                },
                { label: sprintName || "Sprint", to: sprintHref },
                { label: "Work items", to: `${sprintHref}/work-items` },
                { label: workItem.title },
            ]}
            media={
                <span className="hidden sm:block">
                    <WorkItemTypeIcon type={workItem.type} />
                </span>
            }
            title={workItem.title}
            meta={
                <>
                    <WorkItemTypeBadge type={workItem.type} />
                    <StatusBadge tone={WORKFLOW_TONE[status] ?? "neutral"}>
                        {STATUS_LABELS[status] ?? workItem.status}
                    </StatusBadge>
                </>
            }
            details={
                workItem.assignedToName ? (
                    <span className="inline-flex items-center gap-2">
                        <MemberAvatar
                            name={workItem.assignedToName}
                            status={workItem.assignedToStatus || "active"}
                            size="sm"
                            memberId={workItem.assignedToUserId || undefined}
                        />
                        <span>
                            Assigned to{" "}
                            <span className="font-medium text-foreground">
                                {workItem.assignedToName}
                            </span>
                        </span>
                    </span>
                ) : (
                    <MetaItem icon={UserRound}>Unassigned</MetaItem>
                )
            }
            actions={
                (canChangeStatus || canEdit || canDelete) && (
                    <>
                        {canChangeStatus && (
                            <WorkflowStatusSelect
                                value={workItem.status}
                                onChange={onStatusChange}
                                options={WORK_ITEM_STATUS_OPTIONS}
                                label="Work item status"
                            />
                        )}
                        {canEdit && (
                            <Button onClick={onEdit} variant="outline">
                                <Pencil />
                                Edit
                            </Button>
                        )}
                        {canDelete && (
                            <Button onClick={onDelete} variant="destructive">
                                <Trash2 />
                                Delete
                            </Button>
                        )}
                    </>
                )
            }
        />
    );
};

export default WorkItemDetailsHeader;
