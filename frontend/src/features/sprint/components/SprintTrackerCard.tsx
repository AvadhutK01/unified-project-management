import { format } from "date-fns";
import { isAfter, isBefore } from "date-fns";
import { Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SectionCard } from "@/components/common/SectionCard";
import type { SprintTrackerCardProps } from "../types/sprint.types";

const SprintTrackerCard = ({ sprint }: SprintTrackerCardProps) => {
    const sDate = sprint.startDate ? new Date(sprint.startDate) : null;
    const eDate = sprint.endDate ? new Date(sprint.endDate) : null;
    const today = new Date();

    let timelineMessage = "No dates set";
    let progressPercent = 0;

    if (sDate && eDate) {
        const totalDuration = eDate.getTime() - sDate.getTime();
        const elapsed = today.getTime() - sDate.getTime();

        if (isBefore(today, sDate)) {
            const daysToStart = Math.ceil(
                (sDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );
            timelineMessage = `Starts in ${daysToStart} day${daysToStart > 1 ? "s" : ""}`;
            progressPercent = 0;
        } else if (isAfter(today, eDate)) {
            timelineMessage = "Sprint Concluded";
            progressPercent = 100;
        } else {
            const totalDays =
                Math.ceil(totalDuration / (1000 * 60 * 60 * 24)) || 1;
            const elapsedDays = Math.floor(elapsed / (1000 * 60 * 60 * 24)) + 1;
            const remainingDays = Math.max(
                0,
                Math.ceil(
                    (eDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                ),
            );
            timelineMessage = `${remainingDays} day${remainingDays !== 1 ? "s" : ""} remaining (Day ${elapsedDays} of ${totalDays})`;
            progressPercent = Math.min(
                100,
                Math.max(0, Math.round((elapsed / totalDuration) * 100)),
            );
        }
    }

    return (
        <SectionCard title="Timeline" icon={Clock}>
            <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] font-medium text-foreground">
                        {timelineMessage}
                    </span>
                    <span className="tabular shrink-0 text-xs text-muted-foreground">
                        {progressPercent}% elapsed
                    </span>
                </div>
                <Progress
                    value={progressPercent}
                    className="h-2"
                    aria-label="Sprint time elapsed"
                    indicatorClassName={
                        progressPercent >= 100 ? "bg-success" : "bg-primary"
                    }
                />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                    <dt className="text-[11px] font-medium text-muted-foreground">
                        Start date
                    </dt>
                    <dd className="mt-0.5 text-[13px] font-semibold text-foreground">
                        {sDate ? format(sDate, "PP") : "Not set"}
                    </dd>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                    <dt className="text-[11px] font-medium text-muted-foreground">
                        End date
                    </dt>
                    <dd className="mt-0.5 text-[13px] font-semibold text-foreground">
                        {eDate ? format(eDate, "PP") : "Not set"}
                    </dd>
                </div>
            </dl>
        </SectionCard>
    );
};

export default SprintTrackerCard;
