import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TONE_DOT, WORKFLOW_TONE } from "@/lib/tones";

interface Option {
    readonly value: string;
    readonly label: string;
}

/** Status picker with semantic dots, used in detail-page headers. */
export function WorkflowStatusSelect({
    value,
    onChange,
    options,
    label = "Status",
    className,
}: {
    value: string;
    onChange: (value: string) => void;
    options: readonly Option[];
    label?: string;
    className?: string;
}) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger
                aria-label={label}
                className={cn("min-w-36 gap-2", className)}
            >
                <SelectValue placeholder={label} />
            </SelectTrigger>
            <SelectContent align="end">
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        <span
                            aria-hidden="true"
                            className={cn(
                                "size-2 rounded-full",
                                TONE_DOT[
                                    WORKFLOW_TONE[option.value] ?? "neutral"
                                ],
                            )}
                        />
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
