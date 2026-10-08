import { Bug, CheckSquare } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TYPE_LABELS } from "../constants/workitem.constants";
import type { WorkItemType } from "../types/workitem.types";

/** Task / Bug identity badge with icon. */
export function WorkItemTypeBadge({
    type,
    size = "default",
}: {
    type: WorkItemType | string;
    size?: "sm" | "default";
}) {
    const isBug = type === "bug";
    return (
        <StatusBadge
            tone={isBug ? "danger" : "primary"}
            icon={isBug ? Bug : CheckSquare}
            size={size}
        >
            {TYPE_LABELS[type as WorkItemType] ?? type}
        </StatusBadge>
    );
}

/** Square type glyph for dense lists. */
export function WorkItemTypeIcon({ type }: { type: WorkItemType | string }) {
    const isBug = type === "bug";
    const Icon = isBug ? Bug : CheckSquare;
    return (
        <span
            title={isBug ? "Bug" : "Task"}
            className={
                "flex size-7 shrink-0 items-center justify-center rounded-md " +
                (isBug
                    ? "bg-danger/10 text-danger"
                    : "bg-primary/10 text-primary dark:bg-primary/15")
            }
        >
            <Icon className="size-3.5" />
        </span>
    );
}

export default WorkItemTypeBadge;
