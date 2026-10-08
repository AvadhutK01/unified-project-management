import { useState, useMemo } from "react";
import {
    FileDown,
    Activity,
    ClipboardList,
    CheckSquare,
    AlertCircle as PendingIcon,
} from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { StatCard, StatGrid } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import {
    ReportDateFilter,
    ReportErrorBanner,
} from "../components/ReportFilters";
import { useSprintPerformanceQuery } from "../hooks/useReports";
import { exportSprintsToExcel } from "../utils/exportToExcel";
import {
    STATUS_STYLES,
    STATUS_LABELS,
} from "@/features/sprint/constants/sprint.constants";
import type { SprintPerformanceItem } from "../types/reports.types";
import { toast } from "sonner";

const SprintReport = () => {
    // Default to June 2026 as per the user's specific sample request range
    const [startDate, setStartDate] = useState("2026-06-01");
    const [endDate, setEndDate] = useState("2026-06-30");

    const {
        data: reportData,
        isLoading,
        isError,
    } = useSprintPerformanceQuery({
        startDate,
        endDate,
    });

    const sprintsList = useMemo<SprintPerformanceItem[]>(() => {
        return reportData?.data?.data ?? [];
    }, [reportData]);

    // KPI Metrics calculation
    const metrics = useMemo(() => {
        const total = sprintsList.length;
        const active = sprintsList.filter((s) => s.status === "active").length;
        const totalWorkitems = sprintsList.reduce(
            (sum, s) => sum + (s.totalWorkitems || 0),
            0,
        );
        const completedWorkitems = sprintsList.reduce(
            (sum, s) =>
                sum +
                ((s.statusCounts?.closed || 0) +
                    (s.statusCounts?.resolved || 0)),
            0,
        );

        return { total, active, totalWorkitems, completedWorkitems };
    }, [sprintsList]);

    const handleExport = () => {
        if (sprintsList.length === 0) {
            toast.warning("No sprint records available to export.");
            return;
        }
        try {
            exportSprintsToExcel(
                sprintsList,
                `sprint-performance-${startDate}-to-${endDate}`,
            );
            toast.success("Excel report exported successfully!");
        } catch (err) {
            toast.error("Failed to export Excel report. Please try again.");
            console.error(err);
        }
    };

    const columns = useMemo<DataTableColumn<SprintPerformanceItem>[]>(
        () => [
            {
                key: "title",
                label: "Sprint",
                render: (item) => (
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <ClipboardList className="size-4 text-primary" />
                        </div>
                        <div>
                            <span className="font-semibold text-foreground block">
                                {item.title}
                            </span>
                            <span className="text-xs text-muted-foreground block mt-0.5">
                                {item.projectName} &middot; {item.phaseName}
                            </span>
                        </div>
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
                key: "totalWorkitems",
                label: "Total Work Items",
                render: (item) => (
                    <span className="text-sm font-medium text-foreground">
                        {item.totalWorkitems}
                    </span>
                ),
            },
            {
                key: "newWorkitems",
                label: "New",
                render: (item) => (
                    <span className="text-sm font-medium tabular text-violet">
                        {item.statusCounts?.new || 0}
                    </span>
                ),
            },
            {
                key: "activeWorkitems",
                label: "Active",
                render: (item) => (
                    <span className="text-sm font-medium tabular text-info">
                        {item.statusCounts?.active || 0}
                    </span>
                ),
            },
            {
                key: "resolvedWorkitems",
                label: "Resolved",
                render: (item) => (
                    <span className="text-sm font-medium tabular text-success">
                        {item.statusCounts?.resolved || 0}
                    </span>
                ),
            },
            {
                key: "closedWorkitems",
                label: "Closed",
                render: (item) => (
                    <span className="text-sm font-medium tabular text-muted-foreground">
                        {item.statusCounts?.closed || 0}
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
        <PageContainer>
            <PageHeader
                breadcrumbs={[
                    { label: "Reports" },
                    { label: "Sprint Performance Report" },
                ]}
                title="Sprint Performance Report"
                description="Monitor sprint deliverables, completion rates, and outstanding items."
                actions={
                    <Button
                        onClick={handleExport}
                        disabled={sprintsList.length === 0 || isLoading}
                        variant="outline"
                    >
                        <FileDown />
                        Export to Excel
                    </Button>
                }
            />

            <ReportDateFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
            />

            <StatGrid columns={4}>
                <StatCard
                    label="Total Sprints"
                    value={isLoading ? "…" : metrics.total}
                    icon={ClipboardList}
                    tone="primary"
                />
                <StatCard
                    label="Active Sprints"
                    value={isLoading ? "…" : metrics.active}
                    icon={Activity}
                    tone="info"
                />
                <StatCard
                    label="Total Work Items"
                    value={isLoading ? "…" : metrics.totalWorkitems}
                    icon={PendingIcon}
                    tone="violet"
                />
                <StatCard
                    label="Completed Items"
                    value={isLoading ? "…" : metrics.completedWorkitems}
                    icon={CheckSquare}
                    tone="success"
                />
            </StatGrid>

            {isError && <ReportErrorBanner subject="sprint report" />}

            {/* Table section */}
            <DataTable
                columns={columns}
                stickyHeader
                maxHeight="min(70vh, 720px)"
                data={sprintsList}
                getRowId={(item) => item.id}
                loading={isLoading}
                showDefaultFooter={true}
                emptyState={
                    <EmptyState
                        icon={ClipboardList}
                        title="No sprints in date range"
                        description="Adjust dates to view sprint records for a different period."
                    />
                }
            />
        </PageContainer>
    );
};

export default SprintReport;
