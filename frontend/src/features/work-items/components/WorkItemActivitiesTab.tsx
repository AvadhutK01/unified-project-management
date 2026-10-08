import { ActivityTimeline } from "@/components/common/collab/ActivityTimeline";
import { SectionCard } from "@/components/common/SectionCard";

interface WorkItemActivitiesTabProps {
    activities: any[];
    isActivitiesLoading: boolean;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
}

const WorkItemActivitiesTab = (props: WorkItemActivitiesTabProps) => (
    <SectionCard
        title="Activity log"
        description="Every change made to this work item"
    >
        <ActivityTimeline {...props} />
    </SectionCard>
);

export default WorkItemActivitiesTab;
