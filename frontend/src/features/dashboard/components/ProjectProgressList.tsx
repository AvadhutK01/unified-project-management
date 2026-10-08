import { Link } from "react-router-dom";
import { FolderKanban, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getColor, getInitials } from "@/lib/utils";
import { TONE_FILL, progressTone } from "@/lib/tones";
import type { DashboardProject } from "../types/dashboard.types";

interface Props {
    projects: DashboardProject[];
    /** Link target for "View all"; omitted when the viewer can't list projects. */
    viewAllHref?: string;
}

const ProjectProgressList = ({ projects, viewAllHref }: Props) => {
    const completedCount = projects.filter(
        (p) => p.completionPercent >= 100,
    ).length;
    const inProgressCount = projects.length - completedCount;

    return (
        <SectionCard
            title="Project progress"
            description={
                projects.length > 0
                    ? `${inProgressCount} in progress · ${completedCount} completed`
                    : undefined
            }
            actions={
                viewAllHref && projects.length > 0 ? (
                    <Link
                        to={viewAllHref}
                        className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        View all
                        <ArrowRight className="size-3.5" />
                    </Link>
                ) : undefined
            }
            flush
        >
            {projects.length === 0 ? (
                <EmptyState
                    icon={FolderKanban}
                    title="No projects yet"
                    description="Create your first project to start organizing your work."
                    size="sm"
                />
            ) : (
                <ul className="divide-y divide-border">
                    {projects.map((project) => {
                        const pct = Math.max(
                            0,
                            Math.min(100, project.completionPercent),
                        );
                        const isCompleted = pct >= 100;
                        return (
                            <li
                                key={project.projectName}
                                className="flex items-center gap-3 px-5 py-3"
                            >
                                <span
                                    aria-hidden="true"
                                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold text-white"
                                    style={{
                                        backgroundColor: getColor(
                                            project.projectName,
                                        ),
                                    }}
                                >
                                    {getInitials(project.projectName)}
                                </span>
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="truncate text-[13px] font-medium text-foreground">
                                            {project.projectName}
                                        </span>
                                        <span className="tabular shrink-0 text-xs font-medium text-muted-foreground">
                                            {pct}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={pct}
                                        aria-label={`${project.projectName} completion`}
                                        indicatorClassName={
                                            TONE_FILL[progressTone(pct)]
                                        }
                                    />
                                </div>
                                <StatusBadge
                                    tone={isCompleted ? "success" : "info"}
                                    size="sm"
                                    className="hidden sm:inline-flex"
                                >
                                    {isCompleted ? "Completed" : "In progress"}
                                </StatusBadge>
                            </li>
                        );
                    })}
                </ul>
            )}
        </SectionCard>
    );
};

export default ProjectProgressList;
