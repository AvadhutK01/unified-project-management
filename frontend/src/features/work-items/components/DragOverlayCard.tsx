import { type WorkItem } from "../types/workitem.types";
import { KanbanCardFrame } from "@/components/common/Kanban";
import { WorkItemCardBody } from "./WorkItemCardBody";

interface DragOverlayCardProps {
    workItem: WorkItem;
}

function DragOverlayCard({ workItem }: DragOverlayCardProps) {
    return (
        <KanbanCardFrame overlay>
            <WorkItemCardBody workItem={workItem} />
        </KanbanCardFrame>
    );
}

export default DragOverlayCard;
