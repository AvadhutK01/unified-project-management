import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardAction,
} from "@/components/ui/card";
import { FolderKanban, ArrowRight } from "lucide-react";
import { getColor, getInitials } from "@/lib/utils";
import type { DashboardProject } from "../types/dashboard.types";

interface Props {
    projects: DashboardProject[];
}

const ProjectProgressList = ({ projects }: Props) => {
    const completedCount = projects.filter(
        (p) => p.completionPercent >= 100,
    ).length;
    const inProgressCount = projects.length - completedCount;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FolderKanban size={18} className="text-muted-foreground" />
                    Projects
                </CardTitle>
                <CardDescription>
                    {inProgressCount} in progress &middot; {completedCount}{" "}
                    completed
                </CardDescription>
                <CardAction>
                    <button className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/70">
                        View All
                        <ArrowRight size={12} />
                    </button>
                </CardAction>
            </CardHeader>

            <CardContent className="divide-y divide-border/60">
                {projects.map((project) => {
                    const color = getColor(project.projectName);
                    const isCompleted = project.completionPercent >= 100;

                    return (
                        <div
                            key={project.projectName}
                            className="group -mx-1 rounded-lg px-3 py-3 transition-colors hover:bg-accent/40 first:pt-0 last:pb-0"
                        >
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <div
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                                        style={{ backgroundColor: color }}
                                    >
                                        {getInitials(project.projectName)}
                                    </div>
                                    <span className="truncate text-sm font-medium text-foreground">
                                        {project.projectName}
                                    </span>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                    <span
                                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                                        style={
                                            isCompleted
                                                ? {
                                                      backgroundColor:
                                                          "rgba(121,140,94,0.12)",
                                                      color: "#798c5e",
                                                  }
                                                : {
                                                      backgroundColor:
                                                          "rgba(218,119,86,0.10)",
                                                      color: "#da7756",
                                                  }
                                        }
                                    >
                                        {isCompleted
                                            ? "Completed"
                                            : "In Progress"}
                                    </span>
                                    <span className="w-8 text-right text-xs font-medium text-muted-foreground">
                                        {project.completionPercent}%
                                    </span>
                                </div>
                            </div>

                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary/70 transition-all duration-500"
                                    style={{
                                        width: `${project.completionPercent}%`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};

export default ProjectProgressList;
