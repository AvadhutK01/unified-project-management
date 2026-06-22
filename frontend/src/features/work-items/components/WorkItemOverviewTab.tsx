import type { WorkItem } from "../types/workitem.types";

interface WorkItemOverviewTabProps {
    workItem: WorkItem;
}

const WorkItemOverviewTab = ({ workItem }: WorkItemOverviewTabProps) => {
    return (
        <div className="grid grid-cols-1 gap-6">
            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Description
                </h3>
                {workItem.description ? (
                    <div
                        className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-foreground"
                        dangerouslySetInnerHTML={{
                            __html: workItem.description,
                        }}
                    />
                ) : (
                    <p className="text-sm text-muted-foreground italic">
                        No description provided for this work item.
                    </p>
                )}
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Acceptance Criteria
                </h3>
                {workItem.acceptanceCriteria ? (
                    <div
                        className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-foreground"
                        dangerouslySetInnerHTML={{
                            __html: workItem.acceptanceCriteria,
                        }}
                    />
                ) : (
                    <p className="text-sm text-muted-foreground italic">
                        No acceptance criteria defined for this work item.
                    </p>
                )}
            </div>
        </div>
    );
};

export default WorkItemOverviewTab;
