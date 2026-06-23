import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    ListTodo,
    Search,
    Trash2,
} from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/lib/utils";
import { useConfirm } from "@/providers/ConfirmProvider";
import { toast } from "sonner";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";
import AddPhaseModal from "../components/AddPhaseModal";
import EditPhaseModal, { type Phase } from "../components/EditPhaseModal";
import { usePhasesQuery, useDeletePhaseMutation } from "../hooks/usePhases";
import {
    PHASE_STATUS_STYLES,
    PHASE_STATUS_LABELS,
} from "../schema/phases.schema";

const Phases = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const [editPhase, setEditPhase] = useState<Phase | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);

    const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

    const setPage = useCallback(
        (pageOrUpdater: number | ((prev: number) => number)) => {
            setSearchParams((prev) => {
                const next =
                    typeof pageOrUpdater === "function"
                        ? pageOrUpdater(currentPage)
                        : pageOrUpdater;
                const nextParams = new URLSearchParams(prev);
                if (next <= 1) {
                    nextParams.delete("page");
                } else {
                    nextParams.set("page", String(next));
                }
                return nextParams;
            });
        },
        [setSearchParams, currentPage],
    );

    const navigate = useNavigate();
    const confirm = useConfirm();
    const { mutate: deletePhaseMutation } = useDeletePhaseMutation();
    const { hasPermission } = usePermission();

    const canView = hasPermission(PERMISSIONS.PHASES.VIEW);
    const canEdit = hasPermission(PERMISSIONS.PHASES.EDIT);
    const canDelete = hasPermission(PERMISSIONS.PHASES.DELETE);
    const hasSprintAccess = hasPermission(PERMISSIONS.SPRINT.LIST);
    const hasAnyAction = canView || canEdit || canDelete;

    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("page");
            return next;
        });
    }, [debouncedSearch]);

    const { data: phasesData, isLoading } = usePhasesQuery(
        projectId,
        debouncedSearch,
        currentPage,
    );

    const phases = useMemo<Phase[]>(() => {
        const raw = phasesData?.data?.data ?? [];
        return raw.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: item.type,
            description: item.description,
            startDate: item.startDate ?? "",
            endDate: item.endDate ?? "",
            status: item.status,
        }));
    }, [phasesData]);

    const totalPhases = phasesData?.data?.pagination?.total ?? 0;
    const totalPages = phasesData?.data?.pagination?.totalPages ?? 0;
    const safePage = Math.min(currentPage, totalPages || 1);

    const columns = useMemo<DataTableColumn<Phase>[]>(
        () => [
            { key: "name", label: "Name" },
            { key: "type", label: "Type" },
            {
                key: "status",
                label: "Status",
                render: (phase) => (
                    <Badge
                        variant="outline"
                        className={PHASE_STATUS_STYLES[phase.status] ?? ""}
                    >
                        {PHASE_STATUS_LABELS[phase.status] ?? phase.status}
                    </Badge>
                ),
            },
            { key: "startDate", label: "Start Date" },
            { key: "endDate", label: "End Date" },
            ...(hasAnyAction
                ? [
                      {
                          key: "actions" as const,
                          label: "Actions",
                          className: "w-28 text-right",
                          render: (phase: Phase) => (
                              <div className="flex items-center justify-end gap-2">
                                  {canView && (
                                      <button
                                          title={`View ${phase.name}`}
                                          className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                      >
                                          <Eye className="size-4" />
                                      </button>
                                  )}
                                  {canEdit && (
                                      <button
                                          title={`Edit ${phase.name}`}
                                          onClick={() => {
                                              setEditPhase(phase);
                                              setEditModalOpen(true);
                                          }}
                                          className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                      >
                                          <Edit className="size-4" />
                                      </button>
                                  )}
                                  {canDelete && (
                                      <button
                                          title={`Delete ${phase.name}`}
                                          onClick={async () => {
                                              const confirmed = await confirm({
                                                  title: `Delete ${phase.name}?`,
                                                  description: `Are you sure you want to delete ${phase.name}? This action cannot be undone.`,
                                                  confirmText: "Delete",
                                                  cancelText: "Cancel",
                                              });
                                              if (!confirmed) return;
                                              deletePhaseMutation(phase.id, {
                                                  onSuccess: () => {
                                                      toast.success(
                                                          `${phase.name} has been deleted.`,
                                                      );
                                                  },
                                                  onError: (error: any) => {
                                                      toast.error(
                                                          error?.response?.data
                                                              ?.message ||
                                                              `Failed to delete ${phase.name}. Please try again.`,
                                                      );
                                                  },
                                              });
                                          }}
                                          className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                      >
                                          <Trash2 className="size-4" />
                                      </button>
                                  )}
                                  {hasSprintAccess && (
                                      <button
                                          title={`Sprint of ${phase.name}`}
                                          onClick={() =>
                                              navigate(`${phase.id}/sprints`)
                                          }
                                          className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                      >
                                          <ListTodo className="size-4" />
                                      </button>
                                  )}
                              </div>
                          ),
                      },
                  ]
                : []),
        ],
        [hasAnyAction, canView, canEdit, canDelete],
    );

    return (
        <div className="p-6 space-y-5">
            <div>
                <h1 className="text-lg font-semibold text-foreground">
                    Phases
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Manage project phases and timelines
                </p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <AddPhaseModal />

                <div className="relative min-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search phases..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary transition"
                    />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={phases}
                getRowId={(phase) => phase.id}
                hasActiveFilters={search.length > 0}
                showDefaultFooter={false}
                loading={isLoading}
            />

            {totalPages > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground px-1">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {phases.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                            {totalPhases}
                        </span>{" "}
                        phase{totalPhases !== 1 ? "s" : ""}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={safePage === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <EditPhaseModal
                phase={editPhase}
                open={editModalOpen}
                onOpenChange={(val) => {
                    setEditModalOpen(val);
                    if (!val) setEditPhase(null);
                }}
            />
        </div>
    );
};

export default Phases;
