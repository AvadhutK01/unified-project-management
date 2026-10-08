import { useState, useMemo } from "react";
import { FileDown, FolderKanban, Layers, Users, Activity } from "lucide-react";
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
        <PageContainer>
            <PageHeader
                breadcrumbs={[
                    { label: "Reports" },
                    { label: "Project Overview Report" },
                ]}
                title="Project Overview Report"
                description="Track progress, team distribution, and status of organization projects."
                actions={
                    <Button
                        onClick={handleExport}
                        disabled={projectsList.length === 0 || isLoading}
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
                    label="Total Projects"
                    value={isLoading ? "…" : metrics.total}
                    icon={FolderKanban}
                    tone="primary"
                />
                <StatCard
                    label="Active Projects"
                    value={isLoading ? "…" : metrics.active}
                    icon={Activity}
                    tone="info"
                />
                <StatCard
                    label="Total Phases"
                    value={isLoading ? "…" : metrics.totalPhases}
                    icon={Layers}
                    tone="violet"
                />
                <StatCard
                    label="Team Members"
                    value={isLoading ? "…" : metrics.totalMembers}
                    icon={Users}
                    tone="success"
                />
            </StatGrid>

            {isError && <ReportErrorBanner subject="project report" />}

            {/* Table section */}
            <DataTable
                columns={columns}
                stickyHeader
                maxHeight="min(70vh, 720px)"
                data={projectsList}
                getRowId={(item) => item.id}
                loading={isLoading}
                showDefaultFooter={true}
                emptyState={
                    <EmptyState
                        icon={FolderKanban}
                        title="No projects in date range"
                        description="Adjust dates to view project records for a different period."
                    />
                }
            />
        </PageContainer>
    );
};

export default ProjectReport;
