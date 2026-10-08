import { AttachmentList } from "@/components/common/collab/AttachmentList";
import { formatBytes } from "../utils/sprint.utils";
import type { SprintAttachmentsTabProps } from "../types/sprint.types";

const SprintAttachmentsTab = (props: SprintAttachmentsTabProps) => (
    <AttachmentList {...props} formatBytes={formatBytes} entityLabel="sprint" />
);

export default SprintAttachmentsTab;
