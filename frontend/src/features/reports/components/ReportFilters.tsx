import { AlertCircle, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

const DATE_INPUT =
    "h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] outline-none hover:border-foreground/20 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 sm:w-40 dark:bg-input/20 dark:[color-scheme:dark]";

/** Date-range filter bar shared by every report. */
export function ReportDateFilter({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
}: {
    startDate: string;
    endDate: string;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
}) {
    const invalid = startDate > endDate;
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-card sm:flex-row sm:items-end sm:gap-4 sm:px-4">
            <div className="hidden items-center gap-2 self-center pr-1 text-[13px] font-medium text-muted-foreground sm:flex">
                <CalendarRange className="size-4" />
                Date range
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
                <div className="space-y-1">
                    <label
                        htmlFor="report-start"
                        className="block text-xs font-medium text-muted-foreground"
                    >
                        From
                    </label>
                    <input
                        id="report-start"
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        aria-invalid={invalid}
                        className={cn(
                            DATE_INPUT,
                            invalid && "border-destructive",
                        )}
                    />
                </div>
                <div className="space-y-1">
                    <label
                        htmlFor="report-end"
                        className="block text-xs font-medium text-muted-foreground"
                    >
                        To
                    </label>
                    <input
                        id="report-end"
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        aria-invalid={invalid}
                        className={cn(
                            DATE_INPUT,
                            invalid && "border-destructive",
                        )}
                    />
                </div>
            </div>
            {invalid && (
                <p
                    role="alert"
                    className="flex items-center gap-1.5 text-xs text-destructive sm:pb-2.5"
                >
                    <AlertCircle className="size-3.5" />
                    Start date cannot be after end date
                </p>
            )}
        </div>
    );
}

/** Friendly inline failure message for report queries. */
export function ReportErrorBanner({ subject }: { subject: string }) {
    return (
        <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/[0.06] px-4 py-3 text-destructive"
        >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
                <p className="text-sm font-medium">
                    We couldn't load the {subject}
                </p>
                <p className="mt-0.5 text-xs text-destructive/80">
                    Check your date range and try again in a moment.
                </p>
            </div>
        </div>
    );
}
