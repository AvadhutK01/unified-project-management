import { useState, useMemo } from "react";
import {
    FileDown,
    Activity,
    Calendar,
    AlertCircle,
    Layers,
    ListTodo,
    Tag,
} from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePhaseOverviewQuery } from "../hooks/useReports";
import { exportPhasesToExcel } from "../utils/exportToExcel";
import {
    PHASE_STATUS_STYLES,
    PHASE_STATUS_LABELS,
} from "@/features/phases/schema/phases.schema";
import type { PhaseOverviewItem } from "../types/reports.types";
import { toast } from "sonner";

const PhaseReport = () => {
    // Default to June 2026 as per the user's specific sample request range
    const [startDate, setStartDate] = useState("2026-06-01");
    const [endDate, setEndDate] = useState("2026-06-30");

    const {
        data: reportData,
        isLoading,
        isError,
        error,
    } = usePhaseOverviewQuery({
        startDate,
        endDate,
    });

    const phasesList = useMemo<PhaseOverviewItem[]>(() => {
        return reportData?.data?.data ?? [];
    }, [reportData]);

    // KPI Metrics calculation
    const metrics = useMemo(() => {
        const total = phasesList.length;
        const active = phasesList.filter((p) => p.status === "started").length;
        const totalSprints = phasesList.reduce(
            (sum, p) => sum + (p.sprintCount || 0),
            0,
        );
        const uniqueTypes = new Set(
            phasesList.map((p) => p.type).filter(Boolean),
        ).size;

        return { total, active, totalSprints, uniqueTypes };
    }, [phasesList]);

    const handleExport = () => {
        if (phasesList.length === 0) {
            toast.warning("No phase records available to export.");
            return;
        }
        try {
            exportPhasesToExcel(
                phasesList,
                `phase-overview-${startDate}-to-${endDate}`,
            );
            toast.success("Excel report exported successfully!");
        } catch (err) {
            toast.error("Failed to export Excel report. Please try again.");
            console.error(err);
        }
    };

    const columns = useMemo<DataTableColumn<PhaseOverviewItem>[]>(
        () => [
            {
                key: "name",
                label: "Phase Name",
                render: (item) => (
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Layers className="size-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">
                            {item.name}
                        </span>
                    </div>
                ),
            },
            {
                key: "projectName",
                label: "Project Name",
                render: (item) => (
                    <span className="text-sm font-medium text-foreground">
                        {item.projectName}
                    </span>
                ),
            },
            {
                key: "status",
                label: "Status",
                render: (item) => (
                    <Badge
                        variant="outline"
                        className={PHASE_STATUS_STYLES[item.status] ?? ""}
                    >
                        {PHASE_STATUS_LABELS[item.status] ?? item.status}
                    </Badge>
                ),
            },
            {
                key: "type",
                label: "Type",
                render: (item) => (
                    <span className="text-sm text-muted-foreground">
                        {item.type || "N/A"}
                    </span>
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
                key: "sprintCount",
                label: "Sprints",
                render: (item) => (
                    <span className="text-sm font-medium text-foreground">
                        {item.sprintCount}
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
                        Phase Overview Report
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Analyze project execution phases, timeline schedules,
                        and deliverable iterations.
                    </p>
                </div>

                <Button
                    onClick={handleExport}
                    disabled={phasesList.length === 0 || isLoading}
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
                        <Layers className="size-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Total Phases
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
                            Started Phases
                        </p>
                        <p className="text-2xl font-bold text-foreground mt-0.5">
                            {isLoading ? "..." : metrics.active}
                        </p>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border flex items-center gap-4 shadow-2xs hover:shadow-xs transition">
                    <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <ListTodo className="size-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Total Sprints
                        </p>
                        <p className="text-2xl font-bold text-foreground mt-0.5">
                            {isLoading ? "..." : metrics.totalSprints}
                        </p>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border flex items-center gap-4 shadow-2xs hover:shadow-xs transition">
                    <div className="size-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Tag className="size-5 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Distinct Types
                        </p>
                        <p className="text-2xl font-bold text-foreground mt-0.5">
                            {isLoading ? "..." : metrics.uniqueTypes}
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
                            Failed to fetch phase overview report data
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
                data={phasesList}
                getRowId={(item) => item.id}
                loading={isLoading}
                showDefaultFooter={true}
                emptyState={
                    <tr>
                        <td colSpan={8}>
                            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                                <Layers className="size-8 text-muted-foreground/30" />
                                <p className="text-sm font-medium text-muted-foreground">
                                    No phases in date range
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Adjust dates to view phase records for a
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

export default PhaseReport;
