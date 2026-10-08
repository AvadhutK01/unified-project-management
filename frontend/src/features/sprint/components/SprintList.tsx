import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Trash2, ListTodo, Pencil, Eye, ListChecks } from "lucide-react";
import { type SprintItem, type SprintListProps } from "../types/sprint.types";
import StatusSelectCell from "./StatusSelectCell";
import { IconAction } from "@/components/common/Toolbar";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/utils";

const SprintList = ({
    sprints,
    pendingSprintId,
    onEditRequest,
    onStatusChange,
    canEdit,
    canDelete,
    canView,
    canViewWorkItems,
}: SprintListProps) => {
    const navigate = useNavigate();
    const hasAnyAction = canEdit || canDelete || canView || canViewWorkItems;

    const columns = useMemo<DataTableColumn<SprintItem>[]>(
        () => [
            {
                key: "title",
                label: "Sprint",
                render: (sprint) => (
                    <div className="flex max-w-[24rem] min-w-0 items-center gap-3">
                        <span className="tabular flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold text-muted-foreground">
                            {sprint.sequence ?? "—"}
                        </span>
                        {canView ? (
                            <Link
                                to={`${sprint.id}`}
                                className="truncate font-medium text-foreground hover:text-primary"
                            >
                                {sprint.title}
                            </Link>
                        ) : (
                            <span className="truncate font-medium text-foreground">
                                {sprint.title}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                key: "status",
                label: "Status",
                render: (sprint) => (
                    <StatusSelectCell
                        sprint={sprint}
                        pendingSprintId={pendingSprintId}
                        onStatusChange={onStatusChange}
                    />
                ),
            },
            {
                key: "startDate",
                label: "Start",
                className: "hidden sm:table-cell",
                render: (sprint) => (
                    <span className="tabular text-[13px] text-muted-foreground">
                        {sprint.startDate ? formatDate(sprint.startDate) : "—"}
                    </span>
                ),
            },
            {
                key: "endDate",
                label: "End",
                className: "hidden sm:table-cell",
                render: (sprint) => (
                    <span className="tabular text-[13px] text-muted-foreground">
                        {sprint.endDate ? formatDate(sprint.endDate) : "—"}
                    </span>
                ),
            },
            ...(hasAnyAction
                ? [
                      {
                          key: "actions" as const,
                          label: "",
                          className: "w-px text-right",
                          render: (sprint: SprintItem) => (
                              <div className="flex items-center justify-end gap-0.5">
                                  {canView && (
                                      <IconAction
                                          label={`Open ${sprint.title}`}
                                          icon={Eye}
                                          onClick={() =>
                                              navigate(`${sprint.id}`)
                                          }
                                      />
                                  )}
                                  {canViewWorkItems && (
                                      <IconAction
                                          label="Work items"
                                          icon={ListChecks}
                                          onClick={() =>
                                              navigate(
                                                  `${sprint.id}/work-items`,
                                              )
                                          }
                                      />
                                  )}
                                  {canEdit && (
                                      <IconAction
                                          label={`Edit ${sprint.title}`}
                                          icon={Pencil}
                                          onClick={() =>
                                              onEditRequest?.(sprint)
                                          }
                                      />
                                  )}
                                  {canDelete && (
                                      // NOTE: this button had no handler before the
                                      // redesign; behaviour intentionally preserved.
                                      <IconAction
                                          label={`Delete ${sprint.title}`}
                                          icon={Trash2}
                                          tone="danger"
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
            pendingSprintId,
            canEdit,
            canDelete,
            canView,
            canViewWorkItems,
            hasAnyAction,
            navigate,
        ],
    );

    return (
        <DataTable
            columns={columns}
            data={sprints}
            getRowId={(s) => s.id}
            showDefaultFooter={false}
            emptyState={
                <EmptyState
                    icon={ListTodo}
                    title="No sprints yet"
                    description="Plan your first sprint to start delivering this phase in iterations."
                />
            }
        />
    );
};

export default SprintList;
