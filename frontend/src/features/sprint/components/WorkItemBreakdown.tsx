import { SectionCard } from "@/components/common/SectionCard";
import { cn } from "@/lib/utils";
import { TONE_DOT, WORKFLOW_TONE } from "@/lib/tones";
import {
    STATUS_LABELS,
    WORK_ITEM_STATUSES,
} from "@/features/work-items/constants/workitem.constants";
import type { SprintMetrics } from "../types/sprint.types";

/** Stacked bar + legend of a sprint's work items by status. */
export function WorkItemBreakdown({
    metrics,
    action,
}: {
    metrics: SprintMetrics;
    action?: React.ReactNode;
}) {
    const total = metrics.totalWorkItems;
    const entries = WORK_ITEM_STATUSES.map((status) => ({
        status,
        count: metrics.workitemsByStatus[status] ?? 0,
    }));

    return (
        <SectionCard
            title="Work items"
            description={`${total} item${total !== 1 ? "s" : ""} in this sprint`}
            actions={action}
        >
            {total > 0 ? (
                <div
                    className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full"
                    role="img"
                    aria-label={entries
                        .map((e) => `${STATUS_LABELS[e.status]}: ${e.count}`)
                        .join(", ")}
                >
                    {entries
                        .filter((e) => e.count > 0)
                        .map((e) => (
                            <span
                                key={e.status}
                                className={cn(
                                    "h-full first:rounded-l-full last:rounded-r-full",
                                    TONE_DOT[WORKFLOW_TONE[e.status]],
                                )}
                                style={{ width: `${(e.count / total) * 100}%` }}
                            />
                        ))}
                </div>
            ) : (
                <div className="h-2 w-full rounded-full bg-foreground/[0.07]" />
            )}
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-6">
                {entries.map((e) => (
                    <div key={e.status} className="flex items-center gap-2">
                        <span
                            aria-hidden="true"
                            className={cn(
                                "size-2 shrink-0 rounded-full",
                                TONE_DOT[WORKFLOW_TONE[e.status]],
                            )}
                        />
                        <dt className="truncate text-xs text-muted-foreground">
                            {STATUS_LABELS[e.status]}
                        </dt>
                        <dd className="tabular ml-auto text-[13px] font-semibold text-foreground lg:ml-1">
                            {e.count}
                        </dd>
                    </div>
                ))}
            </dl>
        </SectionCard>
    );
}

export default WorkItemBreakdown;
