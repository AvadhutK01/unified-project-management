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
    type SprintStatus,
} from "../types/sprint.types";
import { cn } from "@/lib/utils";
import { TONE_DOT, WORKFLOW_TONE } from "@/lib/tones";

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
                size="sm"
                aria-label={`Status for ${sprint.title}`}
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
                {SPRINT_STATUS_OPTIONS.map((option) => (
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
                                        option.value as SprintStatus
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
