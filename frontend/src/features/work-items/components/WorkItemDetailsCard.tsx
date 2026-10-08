import {
    Clock,
    User,
    FolderKanban,
    Layers,
    Info,
    Timer,
    Tag,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { DetailRow, SectionCard } from "@/components/common/SectionCard";
import { formatHours } from "../utils/workitem.utils";
import type { WorkItem } from "../types/workitem.types";
import { WorkItemTypeBadge } from "./WorkItemTypeBadge";

interface WorkItemDetailsCardProps {
    workItem: WorkItem;
    project: any;
    phaseName: string | undefined;
    sprintName: string | undefined;
}

function TimeStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">
                {label}
            </dt>
            <dd className="tabular mt-0.5 text-[13px] font-semibold text-foreground">
                {value}
            </dd>
        </div>
    );
}

const WorkItemDetailsCard = ({
    workItem,
    project,
    phaseName,
    sprintName,
}: WorkItemDetailsCardProps) => {
    const est = workItem.originalEstimation ?? 0;
    const rem = workItem.remaining ?? 0;
    const completed = workItem.completed ?? 0;
    const progressPercent = est > 0 ? Math.round((completed / est) * 100) : 0;

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <SectionCard title="Time tracking" icon={Clock}>
                <div className="space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                        <span className="tabular text-[13px] font-medium text-foreground">
                            {progressPercent}% complete
                        </span>
                        <span className="tabular text-xs text-muted-foreground">
                            {formatHours(completed)} of {formatHours(est)}
                        </span>
                    </div>
                    <Progress
                        value={Math.min(progressPercent, 100)}
                        className="h-2"
                        aria-label="Time tracking progress"
                        indicatorClassName={
                            progressPercent >= 100 ? "bg-success" : "bg-primary"
                        }
                    />
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2">
                    <TimeStat label="Estimated" value={formatHours(est)} />
                    <TimeStat label="Remaining" value={formatHours(rem)} />
                    <TimeStat
                        label="Completed"
                        value={
                            workItem.completed !== undefined
                                ? formatHours(completed)
                                : "—"
                        }
                    />
                </dl>
            </SectionCard>

            <SectionCard title="Details" icon={Info}>
                <div className="divide-y divide-border">
                    <DetailRow label="Assignee" icon={User}>
                        {workItem.assignedToName ? (
                            <span className="inline-flex items-center gap-2">
                                <MemberAvatar
                                    name={workItem.assignedToName}
                                    status={
                                        workItem.assignedToStatus || "active"
                                    }
                                    size="sm"
                                    memberId={workItem.assignedTo ?? undefined}
                                    userId={
                                        workItem.assignedToUserId ?? undefined
                                    }
                                />
                                <span className="truncate">
                                    {workItem.assignedToName}
                                </span>
                            </span>
                        ) : (
                            <span className="font-normal text-muted-foreground">
                                Unassigned
                            </span>
                        )}
                    </DetailRow>
                    <DetailRow label="Type" icon={Tag}>
                        <WorkItemTypeBadge type={workItem.type} size="sm" />
                    </DetailRow>
                    <DetailRow label="Project" icon={FolderKanban}>
                        {project?.name || "—"}
                    </DetailRow>
                    <DetailRow label="Phase" icon={Layers}>
                        {phaseName || "—"}
                    </DetailRow>
                    <DetailRow label="Sprint" icon={Timer}>
                        {sprintName || "—"}
                    </DetailRow>
                </div>
            </SectionCard>
        </div>
    );
};

export default WorkItemDetailsCard;
