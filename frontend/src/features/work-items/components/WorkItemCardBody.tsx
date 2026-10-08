import { Clock } from "lucide-react";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { type WorkItem } from "../types/workitem.types";
import { formatHours } from "../utils/workitem.utils";
import { WorkItemTypeBadge } from "./WorkItemTypeBadge";

/** Card body shared by the sortable work-item card and its drag overlay. */
export function WorkItemCardBody({
    workItem,
    titleSlot,
    menu,
}: {
    workItem: WorkItem;
    titleSlot?: React.ReactNode;
    menu?: React.ReactNode;
}) {
    const est = workItem.originalEstimation ?? 0;
    const rem = workItem.remaining ?? 0;

    return (
        <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 text-[13px] leading-snug font-medium text-foreground">
                    {titleSlot ?? (
                        <span className="line-clamp-2">{workItem.title}</span>
                    )}
                </div>
                {menu}
            </div>

            <div className="flex items-center justify-between gap-2">
                <WorkItemTypeBadge type={workItem.type} size="sm" />
                {(est > 0 || rem > 0) && (
                    <span
                        className="tabular inline-flex items-center gap-1 text-[11px] text-muted-foreground"
                        title={`Estimated ${formatHours(est)} · Remaining ${formatHours(rem)}`}
                    >
                        <Clock className="size-3" />
                        {formatHours(rem)} / {formatHours(est)}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2 border-t border-border pt-2.5">
                {workItem.assignedToName ? (
                    <>
                        <MemberAvatar
                            name={workItem.assignedToName}
                            status={workItem.assignedToStatus || "active"}
                            size="sm"
                            memberId={workItem.assignedToUserId || undefined}
                        />
                        <span className="truncate text-xs text-muted-foreground">
                            {workItem.assignedToName}
                        </span>
                    </>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        Unassigned
                    </span>
                )}
            </div>
        </div>
    );
}

export default WorkItemCardBody;
