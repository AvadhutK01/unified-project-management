import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    WORK_ITEM_STATUS_OPTIONS,
    STATUS_STYLES,
} from "../constants/workitem.constants";
import {
    type StatusSelectCellProps,
    type WorkItem,
    type WorkItemStatus,
} from "../types/workitem.types";
import { cn } from "@/lib/utils";
import { TONE_DOT, WORKFLOW_TONE } from "@/lib/tones";

const StatusSelectCell = ({
    workItem,
    pendingWorkItemId,
    onStatusChange,
}: StatusSelectCellProps) => {
    const [currentStatus, setCurrentStatus] = useState(workItem.status);
    const isPending = pendingWorkItemId === workItem.id;

    useEffect(() => {
        setCurrentStatus(workItem.status);
    }, [workItem.status]);

    const handleValueChange = (value: string) => {
        if (value === "") return;
        setCurrentStatus(value as WorkItem["status"]);
        onStatusChange?.(workItem, value);
    };

    return (
        <Select
            value={currentStatus}
            onValueChange={handleValueChange}
            disabled={isPending}
        >
            <SelectTrigger
                size="sm"
                aria-label={`Status for ${workItem.title}`}
                className={cn(
                    "h-7! w-fit min-w-26 gap-1.5 rounded-md px-2 text-xs font-medium shadow-none hover:border-current/30 dark:bg-transparent [&_svg]:size-3.5 [&_svg]:opacity-70",
                    STATUS_STYLES[currentStatus],
                )}
            >
                {isPending ? (
                    <Loader2 className="size-3 shrink-0 animate-spin" />
                ) : (
                    <SelectValue />
                )}
            </SelectTrigger>
            <SelectContent>
                {WORK_ITEM_STATUS_OPTIONS.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-[13px]"
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                "size-2 rounded-full",
                                TONE_DOT[
                                    WORKFLOW_TONE[
                                        option.value as WorkItemStatus
                                    ] ?? "neutral"
                                ],
                            )}
                        />
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default StatusSelectCell;
