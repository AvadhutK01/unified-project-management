import { useState, useMemo } from "react";
import { FileDown, Activity, Users, Clock, CheckSquare } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { StatCard, StatGrid } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import {
    ReportDateFilter,
    ReportErrorBanner,
} from "../components/ReportFilters";
import { useMemberActivityQuery } from "../hooks/useReports";
import { exportMemberActivityToExcel } from "../utils/exportToExcel";
import type { MemberActivityItem } from "../types/reports.types";
import { toast } from "sonner";

const MemberActivity = () => {
    // Default to June 2026 as per the user's specific sample request range
    const [startDate, setStartDate] = useState("2026-06-01");
    const [endDate, setEndDate] = useState("2026-06-30");

    const {
        data: reportData,
        isLoading,
        isError,
    } = useMemberActivityQuery({
        startDate,
        endDate,
    });

    const activityList = useMemo<MemberActivityItem[]>(() => {
        return reportData?.data?.data ?? [];
    }, [reportData]);

    // KPI Metrics calculation
    const metrics = useMemo(() => {
        const uniqueMembers = new Set(
            activityList.map((item) => item.memberName).filter(Boolean),
        ).size;
        const totalWorkitems = activityList.reduce(
            (sum, item) => sum + (item.totalWorkitems || 0),
            0,
        );
        const completedWorkitems = activityList.reduce(
            (sum, item) =>
                sum +
                ((item.statusCounts?.closed || 0) +
                    (item.statusCounts?.resolved || 0)),
            0,
        );
        const totalWorkedTime = activityList.reduce(
            (sum, item) => sum + (item.totalWorkedTime || 0),
            0,
        );

        return {
            uniqueMembers,
            totalWorkitems,
            completedWorkitems,
            totalWorkedTime,
        };
    }, [activityList]);

    const handleExport = () => {
        if (activityList.length === 0) {
            toast.warning("No member activity records available to export.");
            return;
        }
        try {
            exportMemberActivityToExcel(
                activityList,
                `member-activity-${startDate}-to-${endDate}`,
            );
            toast.success("Excel report exported successfully!");
        } catch (err) {
            toast.error("Failed to export Excel report. Please try again.");
            console.error(err);
        }
    };

    const columns = useMemo<DataTableColumn<MemberActivityItem>[]>(
        () => [
            {
                key: "memberName",
                label: "Member Name",
                render: (item) => (
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Users className="size-4 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">
                            {item.memberName}
                        </span>
                    </div>
                ),
            },
            {
                key: "projectName",
                label: "Project",
                render: (item) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                            {item.projectName}
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5">
                            {item.phaseName} &middot; {item.sprintName}
                        </span>
                    </div>
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
                key: "totalWorkedTime",
                label: "Worked Time",
                render: (item) => (
                    <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
                        <Clock className="size-3.5 text-muted-foreground" />
                        <span>{item.totalWorkedTime} Hrs</span>
                    </div>
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
                    { label: "Member Activity Report" },
                ]}
                title="Member Activity Report"
                description="Track individual member work item status distribution and logged activity hours."
                actions={
                    <Button
                        onClick={handleExport}
                        disabled={activityList.length === 0 || isLoading}
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
                    label="Active Members"
                    value={isLoading ? "…" : metrics.uniqueMembers}
                    icon={Users}
                    tone="primary"
                />
                <StatCard
                    label="Total Work Items"
                    value={isLoading ? "…" : metrics.totalWorkitems}
                    icon={Activity}
                    tone="info"
                />
                <StatCard
                    label="Completed Items"
                    value={isLoading ? "…" : metrics.completedWorkitems}
                    icon={CheckSquare}
                    tone="violet"
                />
                <StatCard
                    label="Total Worked Time"
                    value={isLoading ? "…" : `${metrics.totalWorkedTime} Hrs`}
                    icon={Clock}
                    tone="success"
                />
            </StatGrid>

            {isError && <ReportErrorBanner subject="member activity report" />}

            {/* Table section */}
            <DataTable
                columns={columns}
                stickyHeader
                maxHeight="min(70vh, 720px)"
                data={activityList}
                getRowId={(item) =>
                    `${item.memberName}-${item.projectName}-${item.phaseName}-${item.sprintName}`
                }
                loading={isLoading}
                showDefaultFooter={true}
                emptyState={
                    <EmptyState
                        icon={Users}
                        title="No member activity in date range"
                        description="Adjust dates to view activity records for a different period."
                    />
                }
            />
        </PageContainer>
    );
};

export default MemberActivity;
