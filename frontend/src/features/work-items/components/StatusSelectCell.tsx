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
} from "../types/workitem.types";

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
                className={`w-32 h-7 text-xs ${STATUS_STYLES[currentStatus]} border-0 ring-0! shadow-none focus:ring-0! gap-1 transition-all duration-200`}
            >
                {isPending ? (
                    <Loader2 className="size-3 animate-spin shrink-0" />
                ) : (
                    <SelectValue />
                )}
            </SelectTrigger>
            <SelectContent>
                {WORK_ITEM_STATUS_OPTIONS.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-xs"
                    >
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default StatusSelectCell;
