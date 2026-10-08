import { AttachmentList } from "@/components/common/collab/AttachmentList";
import { formatBytes } from "../utils/workitem.utils";

interface WorkItemAttachmentsTabProps {
    mediaList: any[];
    isMediaLoading: boolean;
    currentUserEmail: string;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteMedia: (mediaId: string) => void;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
}

const WorkItemAttachmentsTab = (props: WorkItemAttachmentsTabProps) => (
    <AttachmentList
        {...props}
        formatBytes={formatBytes}
        entityLabel="work item"
    />
);

export default WorkItemAttachmentsTab;
