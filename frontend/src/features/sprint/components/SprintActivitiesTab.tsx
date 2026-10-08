import { ActivityTimeline } from "@/components/common/collab/ActivityTimeline";
import { SectionCard } from "@/components/common/SectionCard";
import type { SprintActivitiesTabProps } from "../types/sprint.types";

const SprintActivitiesTab = (props: SprintActivitiesTabProps) => (
    <SectionCard
        title="Activity log"
        description="Every change made to this sprint"
    >
        <ActivityTimeline {...props} />
    </SectionCard>
);

export default SprintActivitiesTab;
