import { useState, useMemo } from "react";
import {
    FileDown,
    Activity,
    Calendar,
    AlertCircle,
    Users,
    Clock,
    ClipboardList,
    CheckSquare,
} from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        error,
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
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {item.statusCounts?.new || 0}
                    </span>
                ),
            },
            {
                key: "activeWorkitems",
                label: "Active",
                render: (item) => (
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {item.statusCounts?.active || 0}
                    </span>
                ),
            },
            {
                key: "resolvedWorkitems",
                label: "Resolved",
                render: (item) => (
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {item.statusCounts?.resolved || 0}
                    </span>
                ),
            },
            {
                key: "closedWorkitems",
                label: "Closed",
                render: (item) => (
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
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
        <div className="p-6 space-y-6">
            {/* Header section */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground">
                        Member Activity Report
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Track individual member work item status distribution
                        and logged activity hours.
                    </p>
                </div>

                <Button
                    onClick={handleExport}
                    disabled={activityList.length === 0 || isLoading}
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
                        <Users className="size-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Active Members
                        </p>
                        <p className="text-2xl font-bold text-foreground mt-0.5">
                            {isLoading ? "..." : metrics.uniqueMembers}
                        </p>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border flex items-center gap-4 shadow-2xs hover:shadow-xs transition">
                    <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Activity className="size-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Total Work Items
                        </p>
                        <p className="text-2xl font-bold text-foreground mt-0.5">
                            {isLoading ? "..." : metrics.totalWorkitems}
                        </p>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border flex items-center gap-4 shadow-2xs hover:shadow-xs transition">
                    <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <CheckSquare className="size-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Completed Items
                        </p>
                        <p className="text-2xl font-bold text-foreground mt-0.5">
                            {isLoading ? "..." : metrics.completedWorkitems}
                        </p>
                    </div>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border flex items-center gap-4 shadow-2xs hover:shadow-xs transition">
                    <div className="size-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Clock className="size-5 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Total Worked Time
                        </p>
                        <p className="text-2xl font-bold text-foreground mt-0.5">
                            {isLoading
                                ? "..."
                                : `${metrics.totalWorkedTime} Hrs`}
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
                            Failed to fetch member activity report data
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
                data={activityList}
                getRowId={(item) =>
                    `${item.memberName}-${item.projectName}-${item.phaseName}-${item.sprintName}`
                }
                loading={isLoading}
                showDefaultFooter={true}
                emptyState={
                    <tr>
                        <td colSpan={8}>
                            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                                <Users className="size-8 text-muted-foreground/30" />
                                <p className="text-sm font-medium text-muted-foreground">
                                    No member activity in date range
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Adjust dates to view activity records for a
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

export default MemberActivity;
