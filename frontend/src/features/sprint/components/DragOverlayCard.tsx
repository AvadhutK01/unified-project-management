import { type SprintItem } from "../types/sprint.types";
import { KanbanCardFrame } from "@/components/common/Kanban";
import { SprintCardBody } from "./SprintCardBody";

interface DragOverlayCardProps {
    sprint: SprintItem;
}

function DragOverlayCard({ sprint }: DragOverlayCardProps) {
    return (
        <KanbanCardFrame overlay>
            <SprintCardBody sprint={sprint} />
        </KanbanCardFrame>
    );
}

export default DragOverlayCard;
