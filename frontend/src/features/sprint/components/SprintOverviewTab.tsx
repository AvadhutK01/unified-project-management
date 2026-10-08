import { CheckCircle2, FileText } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";
import type { SprintOverviewTabProps } from "../types/sprint.types";

const SprintOverviewTab = ({ sprint }: SprintOverviewTabProps) => {
    return (
        <div className="space-y-4">
            <SectionCard title="Description" icon={FileText}>
                {sprint.description ? (
                    <div
                        className="rich-content overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: sprint.description }}
                    />
                ) : (
                    <p className="text-[13px] text-muted-foreground">
                        No description provided for this sprint.
                    </p>
                )}
            </SectionCard>

            <SectionCard title="Acceptance criteria" icon={CheckCircle2}>
                {sprint.acceptanceCriteria ? (
                    <div
                        className="rich-content overflow-x-auto"
                        dangerouslySetInnerHTML={{
                            __html: sprint.acceptanceCriteria,
                        }}
                    />
                ) : (
                    <p className="text-[13px] text-muted-foreground">
                        No acceptance criteria defined for this sprint.
                    </p>
                )}
            </SectionCard>
        </div>
    );
};

export default SprintOverviewTab;
