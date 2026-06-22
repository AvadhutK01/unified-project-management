import { useMemo } from "react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Trash2, ListTodo, Edit, Eye, ListChecks } from "lucide-react";
import { type SprintItem, type SprintListProps } from "../types/sprint.types";
import StatusSelectCell from "./StatusSelectCell";
import { useNavigate } from "react-router-dom";

const SprintList = ({
    sprints,
    pendingSprintId,
    onEditRequest,
    onStatusChange,
    canEdit,
    canDelete,
    canView,
}: SprintListProps) => {
    const navigate = useNavigate();
    const hasAnyAction = canEdit || canDelete || canView;

    const columns = useMemo<DataTableColumn<SprintItem>[]>(
        () => [
            {
                key: "title",
                label: "Title",
                render: (sprint) => (
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <ListTodo className="size-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {sprint.title}
                            </p>
                        </div>
                    </div>
                ),
            },
            {
                key: "startDate",
                label: "Start Date",
                render: (sprint) => (
                    <span className="text-sm text-muted-foreground">
                        {sprint.startDate ?? "-"}
                    </span>
                ),
            },
            {
                key: "endDate",
                label: "End Date",
                render: (sprint) => (
                    <span className="text-sm text-muted-foreground">
                        {sprint.endDate ?? "-"}
                    </span>
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
            ...(hasAnyAction
                ? [
                      {
                          key: "actions" as const,
                          label: "Actions",
                          className: "w-24 text-right",
                          render: (sprint: SprintItem) => (
                              <div className="flex items-center justify-end gap-2">
                                  {canView && (
                                      <button
                                          onClick={() =>
                                              navigate(`${sprint.id}`)
                                          }
                                          className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                      >
                                          <Eye className="size-4" />
                                      </button>
                                  )}
                                  {canEdit && (
                                      <button
                                          onClick={() =>
                                              onEditRequest?.(sprint)
                                          }
                                          className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                      >
                                          <Edit className="size-4" />
                                      </button>
                                  )}
                                  {canDelete && (
                                      <button className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
                                          <Trash2 className="size-4" />
                                      </button>
                                  )}
                                  <button
                                      onClick={() =>
                                          navigate(`${sprint.id}/work-items`)
                                      }
                                      className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                                      title="Work Items"
                                  >
                                      <ListChecks className="size-4" />
                                  </button>
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
            hasAnyAction,
        ],
    );

    return (
        <DataTable
            columns={columns}
            data={sprints}
            getRowId={(s) => s.id}
            showDefaultFooter={false}
            emptyState={
                <tr>
                    <td colSpan={6}>
                        <div className="flex flex-col items-center justify-center py-16 gap-2">
                            <ListTodo className="size-8 text-muted-foreground/40" />
                            <p className="text-sm font-medium text-muted-foreground">
                                No sprints yet
                            </p>
                        </div>
                    </td>
                </tr>
            }
        />
    );
};

export default SprintList;
