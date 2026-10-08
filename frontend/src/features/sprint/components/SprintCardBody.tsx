import { CalendarDays } from "lucide-react";
import { type SprintItem } from "../types/sprint.types";
import { formatDate } from "@/lib/utils";

/** Card body shared by the sortable sprint card and its drag overlay. */
export function SprintCardBody({
    sprint,
    titleSlot,
    menu,
}: {
    sprint: SprintItem;
    titleSlot?: React.ReactNode;
    menu?: React.ReactNode;
}) {
    return (
        <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 text-[13px] leading-snug font-medium text-foreground">
                    {titleSlot ?? (
                        <span className="line-clamp-2">{sprint.title}</span>
                    )}
                </div>
                {menu}
            </div>
            {sprint.description && (
                <div
                    className="line-clamp-2 text-xs leading-relaxed text-muted-foreground [&_*]:m-0 [&_*]:text-xs [&_*]:font-normal [&_*]:text-muted-foreground"
                    dangerouslySetInnerHTML={{
                        __html: sprint.description,
                    }}
                />
            )}
            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                {sprint.startDate || sprint.endDate ? (
                    <span className="tabular inline-flex items-center gap-1">
                        <CalendarDays className="size-3" />
                        {sprint.startDate
                            ? formatDate(sprint.startDate)
                            : "—"}{" "}
                        – {sprint.endDate ? formatDate(sprint.endDate) : "—"}
                    </span>
                ) : (
                    <span>No dates</span>
                )}
                {sprint.sequence !== undefined && (
                    <span className="tabular rounded bg-muted px-1.5 py-px font-medium">
                        #{sprint.sequence}
                    </span>
                )}
            </div>
        </div>
    );
}

export default SprintCardBody;
