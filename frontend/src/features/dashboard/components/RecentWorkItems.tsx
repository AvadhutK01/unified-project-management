import { Bug, ListChecks, CheckSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WORKFLOW_TONE } from "@/lib/tones";
import { STATUS_LABELS } from "@/features/work-items/constants/workitem.constants";
import type { WorkItemStatus } from "@/features/work-items/types/workitem.types";
import type { DashboardWorkItem } from "../types/dashboard.types";

interface Props {
    workItems: DashboardWorkItem[];
}

const TypeIcon = ({ type }: { type: string }) =>
    type === "bug" ? (
        <span
            title="Bug"
            className="flex size-6 shrink-0 items-center justify-center rounded-md bg-danger/10 text-danger"
        >
            <Bug className="size-3.5" />
        </span>
    ) : (
        <span
            title="Task"
            className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
        >
            <CheckSquare className="size-3.5" />
        </span>
    );

const RecentWorkItems = ({ workItems }: Props) => {
    return (
        <SectionCard
            title="Recently assigned work items"
            description="Latest tasks and bugs across your projects"
            flush
        >
            {workItems.length === 0 ? (
                <EmptyState
                    icon={ListChecks}
                    title="No work items assigned yet"
                    description="Work items assigned to your team will show up here."
                    size="sm"
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                                <th
                                    scope="col"
                                    className="h-9 px-5 font-medium"
                                >
                                    Work item
                                </th>
                                <th
                                    scope="col"
                                    className="h-9 px-3 font-medium"
                                >
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="h-9 px-3 font-medium"
                                >
                                    Assignee
                                </th>
                                <th
                                    scope="col"
                                    className="h-9 px-5 text-right font-medium"
                                >
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {workItems.map((item) => {
                                const name =
                                    item.assignedToName ||
                                    item.assignedTo ||
                                    "Unassigned";
                                const status = item.status as WorkItemStatus;
                                return (
                                    <tr
                                        key={item.id}
                                        className="transition-colors hover:bg-muted/40"
                                    >
                                        <td className="px-5 py-2.5">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <TypeIcon type={item.type} />
                                                <span className="truncate font-medium text-foreground">
                                                    {item.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            {item.status && (
                                                <StatusBadge
                                                    tone={
                                                        WORKFLOW_TONE[status] ??
                                                        "neutral"
                                                    }
                                                    size="sm"
                                                >
                                                    {STATUS_LABELS[status] ??
                                                        item.status}
                                                </StatusBadge>
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <MemberAvatar
                                                    name={name}
                                                    status={
                                                        item.assignedToStatus ||
                                                        "active"
                                                    }
                                                    size="sm"
                                                    memberId={
                                                        item.assignedToUserId ||
                                                        undefined
                                                    }
                                                />
                                                <span className="truncate text-[13px] text-muted-foreground">
                                                    {name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="tabular px-5 py-2.5 text-right text-[13px] whitespace-nowrap text-muted-foreground">
                                            {item.createdAt
                                                ? formatDate(item.createdAt)
                                                : "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </SectionCard>
    );
};

export default RecentWorkItems;
