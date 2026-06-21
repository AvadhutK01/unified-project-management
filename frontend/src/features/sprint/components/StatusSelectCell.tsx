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
    SPRINT_STATUS_OPTIONS,
    STATUS_STYLES,
} from "../constants/sprint.constants";
import {
    type StatusSelectCellProps,
    type SprintItem,
} from "../types/sprint.types";

const StatusSelectCell = ({
    sprint,
    pendingSprintId,
    onStatusChange,
}: StatusSelectCellProps) => {
    const [currentStatus, setCurrentStatus] = useState(sprint.status);
    const isPending = pendingSprintId === sprint.id;

    useEffect(() => {
        setCurrentStatus(sprint.status);
    }, [sprint.status]);

    const handleValueChange = (value: string) => {
        setCurrentStatus(value as SprintItem["status"]);
        onStatusChange?.(sprint, value);
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
                {SPRINT_STATUS_OPTIONS.map((option) => (
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
