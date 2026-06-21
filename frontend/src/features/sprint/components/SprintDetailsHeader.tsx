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
    SPRINT_STATUS_OPTIONS,
    STATUS_STYLES,
    STATUS_LABELS,
} from "../constants/sprint.constants";
import type {
    SprintStatus,
    SprintDetailsHeaderProps,
} from "../types/sprint.types";

const SprintDetailsHeader = ({
    sprint,
    project,
    phaseName,
    slug,
    projectId,
    phaseId,
    onEdit,
    onDelete,
    onStatusChange,
}: SprintDetailsHeaderProps) => {
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
                    to={`/${slug}/projects/${projectId}/phases/${phaseId}/sprints`}
                    className="hover:text-foreground transition-colors"
                >
                    Sprints
                </Link>
                <ChevronRight className="size-3" />
                <span className="text-foreground/80 truncate max-w-[150px]">
                    {sprint.title}
                </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-4">
                    <Link
                        to={`/${slug}/projects/${projectId}/phases/${phaseId}/sprints`}
                        className="p-2 bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-xl border border-border/40 transition-all hover:scale-105"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {sprint.title}
                            </h1>
                            <span
                                className={cn(
                                    "px-2.5 py-0.5 text-xs font-semibold rounded-full border shadow-2xs transition-colors duration-200",
                                    STATUS_STYLES[
                                        sprint.status as SprintStatus
                                    ] ||
                                        "bg-secondary text-secondary-foreground",
                                )}
                            >
                                {STATUS_LABELS[sprint.status as SprintStatus]}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Sequence Order:{" "}
                            <span className="font-semibold text-foreground">
                                {sprint.sequence ?? 0}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">
                            Status:
                        </span>
                        <Select
                            value={sprint.status}
                            onValueChange={onStatusChange}
                        >
                            <SelectTrigger className="w-[130px] h-9 rounded-xl bg-card border-border/40 shadow-xs ring-0!">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {SPRINT_STATUS_OPTIONS.map((option) => (
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

export default SprintDetailsHeader;
