import { Clock, User, ClipboardList, Layers, Disc } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
    getInitials,
    getAvatarColorClass,
    formatHours,
} from "../utils/workitem.utils";
import { TYPE_LABELS, TYPE_STYLES } from "../constants/workitem.constants";
import type { WorkItem, WorkItemType } from "../types/workitem.types";

interface WorkItemDetailsCardProps {
    workItem: WorkItem;
    project: any;
    phaseName: string | undefined;
    sprintName: string | undefined;
}

const WorkItemDetailsCard = ({
    workItem,
    project,
    phaseName,
    sprintName,
}: WorkItemDetailsCardProps) => {
    console.log(workItem);
    const est = workItem.originalEstimation ?? 0;
    const rem = workItem.remaining ?? 0;
    const completed = workItem.completed ?? 0;
    const progressPercent = est > 0 ? Math.round((completed / est) * 100) : 0;

    return (
        <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Time Tracker
                    </h3>
                    <Clock className="size-4 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground/90">
                            {progressPercent}% Complete
                        </span>
                        <span className="text-muted-foreground">
                            {formatHours(completed)} of {formatHours(est)} done
                        </span>
                    </div>
                    <Progress
                        value={progressPercent}
                        className="h-2 rounded-full"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-1 text-xs">
                    <div className="p-2.5 bg-secondary/20 rounded-xl border border-border/30">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Estimated
                        </p>
                        <p className="text-xs font-semibold text-foreground/90 mt-0.5">
                            {formatHours(est)}
                        </p>
                    </div>

                    <div className="p-2.5 bg-secondary/20 rounded-xl border border-border/30">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Remaining
                        </p>
                        <p className="text-xs font-semibold text-foreground/90 mt-0.5">
                            {formatHours(rem)}
                        </p>
                    </div>
                </div>

                {workItem.completed !== undefined && (
                    <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl border border-border/30 text-xs">
                        <Clock className="size-4.5 text-primary/80" />
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                Completed
                            </p>
                            <p className="text-xs font-semibold text-foreground/90 mt-0.5">
                                {formatHours(completed)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-3">
                    People & Details
                </h3>

                <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                            <User className="size-3.5" /> Assignee
                        </span>
                        {workItem.assignedToName ? (
                            <div className="flex items-center gap-2">
                                <Avatar
                                    className={cn(
                                        "size-6 shadow-inner",
                                        getAvatarColorClass(
                                            workItem.assignedToEmail!,
                                        ),
                                    )}
                                >
                                    <AvatarFallback className="font-bold text-[9px]">
                                        {getInitials(workItem.assignedToName)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-foreground/90 text-right">
                                    {workItem.assignedToName}
                                </span>
                            </div>
                        ) : (
                            <span className="text-muted-foreground italic text-xs">
                                Unassigned
                            </span>
                        )}
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                            <Disc className="size-3.5" /> Type
                        </span>
                        <span
                            className={cn(
                                "px-2.5 py-0.5 text-[10px] font-semibold rounded-full border shadow-2xs",
                                TYPE_STYLES[workItem.type as WorkItemType] ||
                                    "bg-secondary text-secondary-foreground",
                            )}
                        >
                            {TYPE_LABELS[workItem.type as WorkItemType] ||
                                workItem.type}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                            <ClipboardList className="size-3.5" /> Project
                        </span>
                        <span className="font-semibold text-foreground/90 max-w-[150px] truncate">
                            {project?.name || "Loading..."}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                            <Layers className="size-3.5" /> Phase
                        </span>
                        <span className="font-semibold text-foreground/90 bg-secondary/40 px-2 py-0.5 rounded text-[10px] truncate max-w-[150px]">
                            {phaseName || "Phase"}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                            <Layers className="size-3.5" /> Sprint
                        </span>
                        <span className="font-semibold text-foreground/90 bg-secondary/40 px-2 py-0.5 rounded text-[10px] truncate max-w-[150px]">
                            {sprintName || "Sprint"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkItemDetailsCard;
