import * as XLSX from "xlsx";
import type {
    ProjectOverviewItem,
    SprintPerformanceItem,
    PhaseOverviewItem,
    MemberActivityItem,
} from "../types/reports.types";

const STATUS_LABELS: Record<string, string> = {
    notstarted: "Not Started",
    started: "Started",
    completed: "Completed",
    on_hold: "On Hold",
};

const SPRINT_STATUS_LABELS: Record<string, string> = {
    new: "New",
    active: "Active",
    closed: "Closed",
    removed: "Removed",
    onhold: "On Hold",
};

export const exportProjectsToExcel = (
    data: ProjectOverviewItem[],
    fileName = "project-overview-report",
) => {
    // Map items to rows for the excel sheet
    const rows = data.map((item) => ({
        "Project Title": item.title,
        Status: STATUS_LABELS[item.status] || item.status,
        "Start Date": item.startDate,
        "End Date": item.endDate,
        "Phases Count": item.phaseCount,
        "Members Count": item.memberCount,
        "Created At": new Date(item.createdAt).toLocaleDateString(),
    }));

    // Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-adjust column widths for premium feel
    if (rows.length > 0) {
        const maxLens = Object.keys(rows[0]).map((key) => {
            let maxLen = key.length;
            rows.forEach((row: any) => {
                const val = String(row[key] ?? "");
                if (val.length > maxLen) maxLen = val.length;
            });
            return { wch: maxLen + 3 }; // add a little padding
        });
        worksheet["!cols"] = maxLens;
    }

    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Project Overview");

    // Write file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportSprintsToExcel = (
    data: SprintPerformanceItem[],
    fileName = "sprint-performance-report",
) => {
    // Map items to rows for the excel sheet
    const rows = data.map((item) => ({
        "Sprint Title": item.title,
        "Project Name": item.projectName,
        "Phase Name": item.phaseName,
        Status: SPRINT_STATUS_LABELS[item.status] || item.status,
        "Start Date": item.startDate,
        "End Date": item.endDate,
        "Total Work Items": item.totalWorkitems,
        "New Items": item.statusCounts?.new || 0,
        "Active Items": item.statusCounts?.active || 0,
        "Resolved Items": item.statusCounts?.resolved || 0,
        "Closed Items": item.statusCounts?.closed || 0,
        "Removed Items": item.statusCounts?.removed || 0,
        "On Hold Items": item.statusCounts?.onhold || 0,
        "Created At": new Date(item.createdAt).toLocaleDateString(),
    }));

    // Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-adjust column widths for premium feel
    if (rows.length > 0) {
        const maxLens = Object.keys(rows[0]).map((key) => {
            let maxLen = key.length;
            rows.forEach((row: any) => {
                const val = String(row[key] ?? "");
                if (val.length > maxLen) maxLen = val.length;
            });
            return { wch: maxLen + 3 }; // add a little padding
        });
        worksheet["!cols"] = maxLens;
    }

    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sprint Performance");

    // Write file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportPhasesToExcel = (
    data: PhaseOverviewItem[],
    fileName = "phase-overview-report",
) => {
    // Map items to rows for the excel sheet
    const rows = data.map((item) => ({
        "Phase Name": item.name,
        "Project Name": item.projectName,
        Status: STATUS_LABELS[item.status] || item.status,
        Type: item.type,
        "Start Date": item.startDate,
        "End Date": item.endDate,
        "Sprints Count": item.sprintCount,
        "Created At": new Date(item.createdAt).toLocaleDateString(),
    }));

    // Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-adjust column widths for premium feel
    if (rows.length > 0) {
        const maxLens = Object.keys(rows[0]).map((key) => {
            let maxLen = key.length;
            rows.forEach((row: any) => {
                const val = String(row[key] ?? "");
                if (val.length > maxLen) maxLen = val.length;
            });
            return { wch: maxLen + 3 }; // add a little padding
        });
        worksheet["!cols"] = maxLens;
    }

    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Phase Overview");

    // Write file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportMemberActivityToExcel = (
    data: MemberActivityItem[],
    fileName = "member-activity-report",
) => {
    // Map items to rows for the excel sheet
    const rows = data.map((item) => ({
        "Member Name": item.memberName,
        "Project Name": item.projectName,
        "Phase Name": item.phaseName,
        "Sprint Name": item.sprintName,
        "Total Work Items": item.totalWorkitems,
        "New Items": item.statusCounts?.new || 0,
        "Active Items": item.statusCounts?.active || 0,
        "Resolved Items": item.statusCounts?.resolved || 0,
        "Closed Items": item.statusCounts?.closed || 0,
        "Removed Items": item.statusCounts?.removed || 0,
        "On Hold Items": item.statusCounts?.onhold || 0,
        "Total Worked Time (Hrs)": item.totalWorkedTime,
    }));

    // Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-adjust column widths for premium feel
    if (rows.length > 0) {
        const maxLens = Object.keys(rows[0]).map((key) => {
            let maxLen = key.length;
            rows.forEach((row: any) => {
                const val = String(row[key] ?? "");
                if (val.length > maxLen) maxLen = val.length;
            });
            return { wch: maxLen + 3 }; // add a little padding
        });
        worksheet["!cols"] = maxLens;
    }

    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Member Activity");

    // Write file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
