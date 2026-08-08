import { useMemo } from "react";
import { Link } from "react-router-dom";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import {
    Trash2,
    Bug,
    Edit,
    Eye,
    ListTodo,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { type WorkItem, type WorkItemListProps } from "../types/workitem.types";
import { TYPE_LABELS, TYPE_STYLES } from "../constants/workitem.constants";
import { formatHours } from "../utils/workitem.utils";
import StatusSelectCell from "./StatusSelectCell";
import { MemberAvatar } from "@/components/common/MemberAvatar";

const WorkItemList = ({
    workItems,
    pendingWorkItemId,
    onEditRequest,
    onStatusChange,
    onDeleteRequest,
    projectMembers,
    canEdit,
    canDelete,
    canView,
    currentPage = 1,
    totalPages = 0,
    totalItems = 0,
    onPageChange,
    isLoading,
}: WorkItemListProps) => {
    const hasAnyAction = canEdit || canDelete || canView;

    const columns = useMemo<DataTableColumn<WorkItem>[]>(
        () => [
            {
                key: "title",
                label: "Title",
                render: (item) => (
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            {item.type === "bug" ? (
                                <Bug className="size-4 text-rose-500" />
                            ) : (
                                <ListTodo className="size-4 text-indigo-500" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {item.title}
                            </p>
                        </div>
                    </div>
                ),
            },
            {
                key: "type",
                label: "Type",
                render: (item) => (
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[item.type]}`}
                    >
                        {TYPE_LABELS[item.type]}
                    </span>
                ),
            },
            {
                key: "status",
                label: "Status",
                render: (item) => (
                    <StatusSelectCell
                        workItem={item}
                        pendingWorkItemId={pendingWorkItemId}
                        onStatusChange={onStatusChange}
                    />
                ),
            },
            {
                key: "originalEstimation",
                label: "Est.",
                className: "hidden md:table-cell",
                render: (item) => (
                    <span className="text-sm text-muted-foreground">
                        {formatHours(item.originalEstimation ?? 0)}
                    </span>
                ),
            },
            {
                key: "remaining",
                label: "Rem.",
                className: "hidden md:table-cell",
                render: (item) => (
                    <span className="text-sm text-muted-foreground">
                        {formatHours(item.remaining ?? 0)}
                    </span>
                ),
            },
            {
                key: "completed",
                label: "Completed",
                className: "hidden lg:table-cell",
                render: (item) => (
                    <span className="text-sm text-muted-foreground">
                        {item.completed !== undefined
                            ? formatHours(item.completed)
                            : "-"}
                    </span>
                ),
            },
            {
                key: "assignedTo",
                label: "Assigned To",
                className: "hidden sm:table-cell",
                render: (item) => {
                    const member = projectMembers?.find(
                        (m) => m.id === item.assignedTo,
                    );
                    if (!member) {
                        return (
                            <span className="text-sm text-muted-foreground/60 italic">
                                Unassigned
                            </span>
                        );
                    }
                    return (
                        <div className="flex items-center gap-2 min-w-0">
                            <MemberAvatar
                                name={member.name}
                                status={member.status}
                                size="sm"
                                memberId={member.memberId}
                            />
                            <span className="text-sm text-muted-foreground truncate">
                                {member.name}
                            </span>
                        </div>
                    );
                },
            },
            ...(hasAnyAction
                ? [
                      {
                          key: "actions" as const,
                          label: "Actions",
                          className: "w-24 text-right",
                          render: (item: WorkItem) => (
                              <div className="flex items-center justify-end gap-2">
                                  {canView && (
                                      <Link
                                          to={`${item.id}`}
                                          className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer p-1"
                                      >
                                          <Eye className="size-4" />
                                      </Link>
                                  )}
                                  {canEdit && (
                                      <button
                                          onClick={() => onEditRequest?.(item)}
                                          className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                      >
                                          <Edit className="size-4" />
                                      </button>
                                  )}
                                  {canDelete && (
                                      <button
                                          onClick={() =>
                                              onDeleteRequest?.(item)
                                          }
                                          className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                      >
                                          <Trash2 className="size-4" />
                                      </button>
                                  )}
                              </div>
                          ),
                      },
                  ]
                : []),
        ],
        [
            onEditRequest,
            onStatusChange,
            onDeleteRequest,
            projectMembers,
            pendingWorkItemId,
            canEdit,
            canDelete,
            canView,
            hasAnyAction,
        ],
    );

    const safePage = Math.min(currentPage, totalPages || 1);

    return (
        <>
            <DataTable
                columns={columns}
                data={workItems}
                getRowId={(s) => s.id}
                showDefaultFooter={false}
                loading={isLoading}
                emptyState={
                    <tr>
                        <td colSpan={columns.length + (hasAnyAction ? 1 : 0)}>
                            <div className="flex flex-col items-center justify-center py-16 gap-2">
                                <ListTodo className="size-8 text-muted-foreground/40" />
                                <p className="text-sm font-medium text-muted-foreground">
                                    No work items yet
                                </p>
                            </div>
                        </td>
                    </tr>
                }
            />

            {totalPages > 0 && onPageChange && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
                    <p className="text-xs text-muted-foreground px-1">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {workItems.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                            {totalItems}
                        </span>{" "}
                        work item{totalItems !== 1 ? "s" : ""}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                onPageChange((p) => Math.max(1, p - 1))
                            }
                            disabled={safePage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-muted-foreground px-2">
                            Page{" "}
                            <span className="font-medium text-foreground">
                                {safePage}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-foreground">
                                {totalPages}
                            </span>
                        </span>
                        <button
                            onClick={() =>
                                onPageChange((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={safePage === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default WorkItemList;
