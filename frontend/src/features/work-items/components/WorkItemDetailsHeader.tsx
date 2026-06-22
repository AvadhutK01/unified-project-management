import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    WORK_ITEM_STATUS_OPTIONS,
    STATUS_STYLES,
    STATUS_LABELS,
} from "../constants/workitem.constants";
import type { WorkItem, WorkItemStatus } from "../types/workitem.types";

interface WorkItemDetailsHeaderProps {
    workItem: WorkItem;
    project: any;
    phaseName: string | undefined;
    sprintName: string | undefined;
    slug: string;
    projectId: string;
    phaseId: string;
    sprintId: string;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: (status: string) => void;
}

const WorkItemDetailsHeader = ({
    workItem,
    project,
    phaseName,
    sprintName,
    slug,
    projectId,
    phaseId,
    sprintId,
    onEdit,
    onDelete,
    onStatusChange,
}: WorkItemDetailsHeaderProps) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Link
                    to={`/${slug}/projects/${projectId}/phases`}
                    className="hover:text-foreground transition-colors"
                >
                    {project?.name || "Project"}
                </Link>
                <ChevronRight className="size-3" />
                <Link
                    to={`/${slug}/projects/${projectId}/phases/${phaseId}/sprints`}
                    className="hover:text-foreground transition-colors"
                >
                    {phaseName || "Phase"}
                </Link>
                <ChevronRight className="size-3" />
                <Link
                    to={`/${slug}/projects/${projectId}/phases/${phaseId}/sprints/${sprintId}`}
                    className="hover:text-foreground transition-colors"
                >
                    {sprintName || "Sprint"}
                </Link>
                <ChevronRight className="size-3" />
                <Link
                    to={`/${slug}/projects/${projectId}/phases/${phaseId}/sprints/${sprintId}/work-items`}
                    className="hover:text-foreground transition-colors"
                >
                    Work Items
                </Link>
                <ChevronRight className="size-3" />
                <span className="text-foreground/80 truncate max-w-[150px]">
                    {workItem.title}
                </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-4">
                    <Link
                        to={`/${slug}/projects/${projectId}/phases/${phaseId}/sprints/${sprintId}/work-items`}
                        className="p-2 bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-xl border border-border/40 transition-all hover:scale-105"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {workItem.title}
                            </h1>
                            <span
                                className={cn(
                                    "px-2.5 py-0.5 text-xs font-semibold rounded-full border shadow-2xs transition-colors duration-200",
                                    STATUS_STYLES[
                                        workItem.status as WorkItemStatus
                                    ] ||
                                        "bg-secondary text-secondary-foreground",
                                )}
                            >
                                {
                                    STATUS_LABELS[
                                        workItem.status as WorkItemStatus
                                    ]
                                }
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">
                            Status:
                        </span>
                        <Select
                            value={workItem.status}
                            onValueChange={onStatusChange}
                        >
                            <SelectTrigger className="w-[130px] h-9 rounded-xl bg-card border-border/40 shadow-xs ring-0!">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {WORK_ITEM_STATUS_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={onEdit}
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl border-border/40 bg-card hover:bg-secondary shadow-xs gap-1.5"
                    >
                        <Edit className="size-4" />
                        <span>Edit</span>
                    </Button>

                    <Button
                        onClick={onDelete}
                        variant="destructive"
                        size="sm"
                        className="h-9 rounded-xl shadow-xs gap-1.5"
                    >
                        <Trash2 className="size-4" />
                        <span>Delete</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default WorkItemDetailsHeader;
