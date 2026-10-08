import { CalendarDays, Hash, Pencil, Trash2, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetaItem, PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WorkflowStatusSelect } from "@/components/common/WorkflowStatusSelect";
import { formatDate } from "@/lib/utils";
import { WORKFLOW_TONE } from "@/lib/tones";
import {
    SPRINT_STATUS_OPTIONS,
    STATUS_LABELS,
} from "../constants/sprint.constants";
import type {
    SprintStatus,
    SprintDetailsHeaderProps,
} from "../types/sprint.types";

const SprintDetailsHeader = ({
    sprint,
    project,
    phaseName,
    slug,
    projectId,
    phaseId,
    onEdit,
    onDelete,
    onStatusChange,
}: SprintDetailsHeaderProps) => {
    const phasesHref = `/${slug}/projects/${projectId}/phases`;
    const status = sprint.status as SprintStatus;

    return (
        <PageHeader
            breadcrumbs={[
                { label: "Projects", to: `/${slug}/projects` },
                {
                    label: project?.name || "Project",
                    to: `/${slug}/projects/${projectId}`,
                },
                { label: "Phases", to: phasesHref },
                {
                    label: phaseName || "Phase",
                    to: `${phasesHref}/${phaseId}`,
                },
                { label: "Sprints", to: `${phasesHref}/${phaseId}/sprints` },
                { label: sprint.title },
            ]}
            media={
                <span className="flex size-12 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
                    <Timer className="size-5" />
                </span>
            }
            title={sprint.title}
            meta={
                <StatusBadge tone={WORKFLOW_TONE[status] ?? "neutral"}>
                    {STATUS_LABELS[status] ?? sprint.status}
                </StatusBadge>
            }
            details={
                <>
                    <MetaItem icon={CalendarDays}>
                        {sprint.startDate ? formatDate(sprint.startDate) : "—"}{" "}
                        – {sprint.endDate ? formatDate(sprint.endDate) : "—"}
                    </MetaItem>
                    <MetaItem icon={Hash}>
                        Sequence {sprint.sequence ?? 0}
                    </MetaItem>
                </>
            }
            actions={
                <>
                    <WorkflowStatusSelect
                        value={sprint.status}
                        onChange={onStatusChange}
                        options={SPRINT_STATUS_OPTIONS}
                        label="Sprint status"
                    />
                    <Button onClick={onEdit} variant="outline">
                        <Pencil />
                        Edit
                    </Button>
                    <Button onClick={onDelete} variant="destructive">
                        <Trash2 />
                        Delete
                    </Button>
                </>
            }
        />
    );
};

export default SprintDetailsHeader;
