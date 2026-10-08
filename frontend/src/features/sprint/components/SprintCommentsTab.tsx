import { CommentThread } from "@/components/common/collab/CommentThread";
import type { SprintCommentsTabProps } from "../types/sprint.types";

const SprintCommentsTab = ({ sprintId, ...props }: SprintCommentsTabProps) => (
    <CommentThread entityId={sprintId} {...props} />
);

export default SprintCommentsTab;
