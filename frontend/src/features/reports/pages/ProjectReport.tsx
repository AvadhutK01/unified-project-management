import { useState, useMemo } from "react";
import {
    FileDown,
    FolderKanban,
    Layers,
    Users,
    Activity,
    Calendar,
    AlertCircle,
} from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProjectOverviewQuery } from "../hooks/useReports";
import { exportProjectsToExcel } from "../utils/exportToExcel";
import {
    STATUS_STYLES,
    STATUS_LABELS,
} from "@/features/projects/constants/projects.constants";
import type { ProjectOverviewItem } from "../types/reports.types";
import { toast } from "sonner";

const ProjectReport = () => {
    // Default to June 2026 as per the user's specific sample request range
    const [startDate, setStartDate] = useState("2026-06-01");
    const [endDate, setEndDate] = useState("2026-06-30");

    const {
        data: overviewData,
        isLoading,
        isError,
        error,
    } = useProjectOverviewQuery({
        startDate,
        endDate,
    });

    const projectsList = useMemo<ProjectOverviewItem[]>(() => {
        return overviewData?.data?.data ?? [];
    }, [overviewData]);

    // KPI Metrics calculation
    const metrics = useMemo(() => {
        const total = projectsList.length;
        const active = projectsList.filter(
            (p) => p.status === "started",
        ).length;
        const totalPhases = projectsList.reduce(
            (sum, p) => sum + (p.phaseCount || 0),
            0,
        );
        const totalMembers = projectsList.reduce(
            (sum, p) => sum + (p.memberCount || 0),
            0,
        );

        return { total, active, totalPhases, totalMembers };
    }, [projectsList]);

    const handleExport = () => {
        if (projectsList.length === 0) {
            toast.warning("No project records available to export.");
            return;
        }
        try {
            exportProjectsToExcel(
                projectsList,
                `project-overview-${startDate}-to-${endDate}`,
            );
            toast.success("Excel report exported successfully!");
        } catch (err) {
            toast.error("Failed to export Excel report. Please try again.");
            console.error(err);
        }
    };

    const columns = useMemo<DataTableColumn<ProjectOverviewItem>[]>(
        () => [
            {
                key: "title",
                label: "Project Title",
                render: (item) => (
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FolderKanban className="size-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">
                            {item.title}
                        </span>
                    </div>
                ),
            },
            {
                key: "status",
                label: "Status",
                render: (item) => (
                    <Badge
                        variant="outline"
                        className={STATUS_STYLES[item.status] ?? ""}
                    >
                        {STATUS_LABELS[item.status] ?? item.status}
                    </Badge>
                ),
            },
            {
                key: "startDate",
                label: "Start Date",
                render: (item) => (
                    <span className="text-sm text-muted-foreground">
                        {item.startDate}
                    </span>
                ),
            },
            {
                key: "endDate",
                label: "End Date",
                render: (item) => (
                    <span className="text-sm text-muted-foreground">
                        {item.endDate}
                    </span>
                ),
            },
            {
                key: "phaseCount",
                label: "Phases",
                render: (item) => (
                    <span className="text-sm font-medium text-foreground">
                        {item.phaseCount}
                    </span>
                ),
            },
            {
                key: "memberCount",
                label: "Members",
                render: (item) => (
                    <span className="text-sm font-medium text-foreground">
                        {item.memberCount}
                    </span>
                ),
            },
            {
                key: "createdAt",
                label: "Created At",
                render: (item) => (
                    <span className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString(
                            undefined,
                            {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            },
                        )}
                    </span>
                ),
            },
        ],
        [],
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header section */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground">
                        Project Overview Report
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Track progress, team distribution, and status of
                        organization projects.
                    </p>
                </div>

                <Button
                    onClick={handleExport}
                    disabled={projectsList.length === 0 || isLoading}
                    className="gap-2 cursor-pointer"
                >
                    <FileDown className="size-4" />
                    Export Excel
                </Button>
            </div>

            {/* Date Filters block */}
            <div className="flex flex-wrap items-end gap-4 p-4 bg-card rounded-xl border border-border shadow-xs">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="block w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        End Date
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="block w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                    />
                </div>

                {startDate > endDate && (
                    <div className="flex items-center gap-1.5 text-xs text-destructive pb-2.5">
                        <AlertCircle className="size-4" />
                        Start date cannot be after end date
                    </div>
                )}
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card p-5 rounded-xl border border-border flex items-center gap-4 shadow-2xs hover:shadow-xs transition">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FolderKanban className="size-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Total Projects
                        </p>
                        <p className="text-2xl font-bold text-foreground mt-0.5">
                            {isLoading ? "..." : metrics.total}
                        </p>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border flex items-center gap-4 shadow-2xs hover:shadow-xs transition">
                    <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Activity className="size-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Active Projects
                        </p>
                        <p className="text-2xl font-bold text-foreground mt-0.5">
                            {isLoading ? "..." : metrics.active}
                        </p>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border flex items-center gap-4 shadow-2xs hover:shadow-xs transition">
                    <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Layers className="size-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Total Phases
                        </p>
                        <p className="text-2xl font-bold text-foreground mt-0.5">
                            {isLoading ? "..." : metrics.totalPhases}
                        </p>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border flex items-center gap-4 shadow-2xs hover:shadow-xs transition">
                    <div className="size-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Users className="size-5 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Team Members
                        </p>
                        <p className="text-2xl font-bold text-foreground mt-0.5">
                            {isLoading ? "..." : metrics.totalMembers}
                        </p>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {isError && (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                    <AlertCircle className="size-5" />
                    <div>
                        <p className="font-semibold text-sm">
                            Failed to fetch project overview report data
                        </p>
                        <p className="text-xs opacity-90">
                            {error?.message || "An unexpected error occurred."}
                        </p>
                    </div>
                </div>
            )}

            {/* Table section */}
            <DataTable
                columns={columns}
                data={projectsList}
                getRowId={(item) => item.id}
                loading={isLoading}
                showDefaultFooter={true}
                emptyState={
                    <tr>
                        <td colSpan={7}>
                            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                                <FolderKanban className="size-8 text-muted-foreground/30" />
                                <p className="text-sm font-medium text-muted-foreground">
                                    No projects in date range
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Adjust dates to view project records for a
                                    different period.
                                </p>
                            </div>
                        </td>
                    </tr>
                }
            />
        </div>
    );
};

export default ProjectReport;
