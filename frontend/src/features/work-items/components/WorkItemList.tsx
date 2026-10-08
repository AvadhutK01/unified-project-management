import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Trash2, Pencil, Eye, ListChecks } from "lucide-react";
import { type WorkItem, type WorkItemListProps } from "../types/workitem.types";
import { formatHours } from "../utils/workitem.utils";
import StatusSelectCell from "./StatusSelectCell";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { IconAction, Pagination } from "@/components/common/Toolbar";
import { EmptyState } from "@/components/common/EmptyState";
import { WorkItemTypeBadge, WorkItemTypeIcon } from "./WorkItemTypeBadge";

const Hours = ({ value }: { value?: number }) => (
    <span className="tabular text-[13px] text-muted-foreground">
        {value !== undefined ? formatHours(value) : "—"}
    </span>
);

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
    const navigate = useNavigate();
    const hasAnyAction = canEdit || canDelete || canView;

    const columns = useMemo<DataTableColumn<WorkItem>[]>(
        () => [
            {
                key: "title",
                label: "Title",
                render: (item) => (
                    <div className="flex max-w-[26rem] min-w-0 items-center gap-2.5">
                        <WorkItemTypeIcon type={item.type} />
                        {canView ? (
                            <Link
                                to={`${item.id}`}
                                className="truncate font-medium text-foreground hover:text-primary"
                            >
                                {item.title}
                            </Link>
                        ) : (
                            <span className="truncate font-medium text-foreground">
                                {item.title}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                key: "type",
                label: "Type",
                className: "hidden md:table-cell",
                render: (item) => (
                    <WorkItemTypeBadge type={item.type} size="sm" />
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
                label: "Estimated",
                className: "hidden lg:table-cell",
                render: (item) => (
                    <Hours value={item.originalEstimation ?? 0} />
                ),
            },
            {
                key: "remaining",
                label: "Remaining",
                className: "hidden lg:table-cell",
                render: (item) => <Hours value={item.remaining ?? 0} />,
            },
            {
                key: "completed",
                label: "Completed",
                className: "hidden xl:table-cell",
                render: (item) => <Hours value={item.completed} />,
            },
            {
                key: "assignedTo",
                label: "Assigned to",
                className: "hidden sm:table-cell",
                render: (item) => {
                    const member = projectMembers?.find(
                        (m) => m.id === item.assignedTo,
                    );
                    if (!member) {
                        return (
                            <span className="text-[13px] text-muted-foreground">
                                Unassigned
                            </span>
                        );
                    }
                    return (
                        <div className="flex min-w-0 items-center gap-2">
                            <MemberAvatar
                                name={member.name}
                                status={member.status}
                                size="sm"
                                memberId={member.memberId || member.id}
                                userId={
                                    (member as any).userId || member.memberId
                                }
                            />
                            <span className="truncate text-[13px] text-foreground">
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
                          label: "",
                          className: "w-px text-right",
                          render: (item: WorkItem) => (
                              <div className="flex items-center justify-end gap-0.5">
                                  {canView && (
                                      <IconAction
                                          label={`Open ${item.title}`}
                                          icon={Eye}
                                          onClick={() => navigate(`${item.id}`)}
                                      />
                                  )}
                                  {canEdit && (
                                      <IconAction
                                          label={`Edit ${item.title}`}
                                          icon={Pencil}
                                          onClick={() => onEditRequest?.(item)}
                                      />
                                  )}
                                  {canDelete && (
                                      <IconAction
                                          label={`Delete ${item.title}`}
                                          icon={Trash2}
                                          tone="danger"
                                          onClick={() =>
                                              onDeleteRequest?.(item)
                                          }
                                      />
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
            navigate,
        ],
    );

    const safePage = Math.min(currentPage, totalPages || 1);

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={workItems}
                getRowId={(s) => s.id}
                showDefaultFooter={false}
                loading={isLoading}
                emptyState={
                    <EmptyState
                        icon={ListChecks}
                        title="No work items yet"
                        description="Create a work item to start tracking progress."
                    />
                }
            />

            {totalPages > 0 && onPageChange && workItems.length > 0 && (
                <Pagination
                    page={safePage}
                    totalPages={totalPages}
                    onPrevious={() => onPageChange((p) => Math.max(1, p - 1))}
                    onNext={() =>
                        onPageChange((p) => Math.min(totalPages, p + 1))
                    }
                    shown={workItems.length}
                    total={totalItems}
                    noun="work item"
                />
            )}
        </div>
    );
};

export default WorkItemList;
