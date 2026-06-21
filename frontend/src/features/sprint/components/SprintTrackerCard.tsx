import { format } from "date-fns";
import { isAfter, isBefore } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
        <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Sprint Tracker
                </h3>
                <Clock className="size-4 text-muted-foreground" />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground/90">
                        {timelineMessage}
                    </span>
                    <span className="text-muted-foreground">
                        {progressPercent}% elapsed
                    </span>
                </div>
                <Progress
                    value={progressPercent}
                    className="h-2 rounded-full"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 pt-1">
                <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl border border-border/30">
                    <Calendar className="size-4.5 text-primary/80" />
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Start Date
                        </p>
                        <p className="text-xs font-semibold text-foreground/90 mt-0.5">
                            {sDate ? format(sDate, "PPP") : "Not Set"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl border border-border/30">
                    <Calendar className="size-4.5 text-primary/80" />
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            End Date
                        </p>
                        <p className="text-xs font-semibold text-foreground/90 mt-0.5">
                            {eDate ? format(eDate, "PPP") : "Not Set"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SprintTrackerCard;
