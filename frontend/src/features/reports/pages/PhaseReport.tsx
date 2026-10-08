import { useState, useMemo } from "react";
import { FileDown, Activity, Layers, ListTodo, Tag } from "lucide-react";
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
        <PageContainer>
            <PageHeader
                breadcrumbs={[
                    { label: "Reports" },
                    { label: "Phase Overview Report" },
                ]}
                title="Phase Overview Report"
                description="Analyze project execution phases, timeline schedules, and deliverable iterations."
                actions={
                    <Button
                        onClick={handleExport}
                        disabled={phasesList.length === 0 || isLoading}
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
                    label="Total Phases"
                    value={isLoading ? "…" : metrics.total}
                    icon={Layers}
                    tone="primary"
                />
                <StatCard
                    label="Started Phases"
                    value={isLoading ? "…" : metrics.active}
                    icon={Activity}
                    tone="info"
                />
                <StatCard
                    label="Total Sprints"
                    value={isLoading ? "…" : metrics.totalSprints}
                    icon={ListTodo}
                    tone="violet"
                />
                <StatCard
                    label="Distinct Types"
                    value={isLoading ? "…" : metrics.uniqueTypes}
                    icon={Tag}
                    tone="success"
                />
            </StatGrid>

            {isError && <ReportErrorBanner subject="phase report" />}

            {/* Table section */}
            <DataTable
                columns={columns}
                stickyHeader
                maxHeight="min(70vh, 720px)"
                data={phasesList}
                getRowId={(item) => item.id}
                loading={isLoading}
                showDefaultFooter={true}
                emptyState={
                    <EmptyState
                        icon={Layers}
                        title="No phases in date range"
                        description="Adjust dates to view phase records for a different period."
                    />
                }
            />
        </PageContainer>
    );
};

export default PhaseReport;
