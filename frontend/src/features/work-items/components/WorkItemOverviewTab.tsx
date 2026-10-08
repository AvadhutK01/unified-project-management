import { CheckCircle2, FileText } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";
import type { WorkItem } from "../types/workitem.types";

interface WorkItemOverviewTabProps {
    workItem: WorkItem;
}

const WorkItemOverviewTab = ({ workItem }: WorkItemOverviewTabProps) => {
    return (
        <div className="space-y-4">
            <SectionCard title="Description" icon={FileText}>
                {workItem.description ? (
                    <div
                        className="rich-content overflow-x-auto"
                        dangerouslySetInnerHTML={{
                            __html: workItem.description,
                        }}
                    />
                ) : (
                    <p className="text-[13px] text-muted-foreground">
                        No description provided for this work item.
                    </p>
                )}
            </SectionCard>

            <SectionCard title="Acceptance criteria" icon={CheckCircle2}>
                {workItem.acceptanceCriteria ? (
                    <div
                        className="rich-content overflow-x-auto"
                        dangerouslySetInnerHTML={{
                            __html: workItem.acceptanceCriteria,
                        }}
                    />
                ) : (
                    <p className="text-[13px] text-muted-foreground">
                        No acceptance criteria defined for this work item.
                    </p>
                )}
            </SectionCard>
        </div>
    );
};

export default WorkItemOverviewTab;
