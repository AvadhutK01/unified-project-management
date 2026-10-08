import { CommentThread } from "@/components/common/collab/CommentThread";

interface WorkItemCommentsTabProps {
    workItemId: string;
    discussions: any[];
    isCommentsLoading: boolean;
    currentUserEmail: string;
    isSubmittingComment: boolean;
    onAddComment: (
        comment: string,
        mentions?: { id: string; name: string }[],
    ) => void;
    onDeleteComment: (discussionId: string) => void;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    users: { id: string; name: string }[];
}

const WorkItemCommentsTab = ({
    workItemId,
    ...props
}: WorkItemCommentsTabProps) => (
    <CommentThread entityId={workItemId} {...props} />
);

export default WorkItemCommentsTab;
