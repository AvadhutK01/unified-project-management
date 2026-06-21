import type { SprintOverviewTabProps } from "../types/sprint.types";

const SprintOverviewTab = ({ sprint }: SprintOverviewTabProps) => {
    return (
        <div className="grid grid-cols-1 gap-6">
            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Description
                </h3>
                {sprint.description ? (
                    <div
                        className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-foreground"
                        dangerouslySetInnerHTML={{ __html: sprint.description }}
                    />
                ) : (
                    <p className="text-sm text-muted-foreground italic">
                        No description provided for this sprint.
                    </p>
                )}
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Acceptance Criteria
                </h3>
                {sprint.acceptanceCriteria ? (
                    <div
                        className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-foreground"
                        dangerouslySetInnerHTML={{
                            __html: sprint.acceptanceCriteria,
                        }}
                    />
                ) : (
                    <p className="text-sm text-muted-foreground italic">
                        No acceptance criteria defined for this sprint.
                    </p>
                )}
            </div>
        </div>
    );
};

export default SprintOverviewTab;
