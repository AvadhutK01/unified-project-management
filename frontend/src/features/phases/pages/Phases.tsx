import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import { Eye, Layers, ListTodo, Pencil, Trash2 } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { formatDate, useDebounce } from "@/lib/utils";
import { useConfirm } from "@/providers/ConfirmProvider";
import { toast } from "sonner";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";
import AddPhaseModal from "../components/AddPhaseModal";
import EditPhaseModal, { type Phase } from "../components/EditPhaseModal";
import { usePhasesQuery, useDeletePhaseMutation } from "../hooks/usePhases";
import { PHASE_STATUS_LABELS } from "../schema/phases.schema";
import { useProjectByIdQuery } from "@/features/projects/hooks/useProjects";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import {
    IconAction,
    Pagination,
    SearchInput,
    Toolbar,
} from "@/components/common/Toolbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { LIFECYCLE_TONE } from "@/lib/tones";

const Phases = () => {
    const { id: projectId, slug } = useParams<{ id: string; slug: string }>();
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
    const { data: projectRes } = useProjectByIdQuery(projectId);
    const projectName: string | undefined =
        projectRes?.data?.title ?? projectRes?.data?.name;

    const canView = hasPermission(PERMISSIONS.PHASES.VIEW);
    const canEdit = hasPermission(PERMISSIONS.PHASES.EDIT);
    const canDelete = hasPermission(PERMISSIONS.PHASES.DELETE);
    const hasSprintAccess = hasPermission(PERMISSIONS.SPRINT.LIST);
    const hasAnyAction = canView || canEdit || canDelete || hasSprintAccess;

    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("page");
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleDelete = async (phase: Phase) => {
        const confirmed = await confirm({
            title: `Delete ${phase.name}?`,
            description: `Are you sure you want to delete ${phase.name}? This action cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
        });
        if (!confirmed) return;
        deletePhaseMutation(phase.id, {
            onSuccess: () => {
                toast.success(`${phase.name} has been deleted.`);
            },
            onError: (error: any) => {
                toast.error(
                    error?.response?.data?.message ||
                        `Failed to delete ${phase.name}. Please try again.`,
                );
            },
        });
    };

    const columns = useMemo<DataTableColumn<Phase>[]>(
        () => [
            {
                key: "name",
                label: "Phase",
                render: (phase) => (
                    <div className="flex max-w-[22rem] min-w-0 items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                            <Layers className="size-4" />
                        </span>
                        {canView ? (
                            <Link
                                to={`${phase.id}`}
                                className="truncate font-medium text-foreground hover:text-primary"
                            >
                                {phase.name}
                            </Link>
                        ) : (
                            <span className="truncate font-medium text-foreground">
                                {phase.name}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                key: "type",
                label: "Type",
                render: (phase) => (
                    <span className="inline-flex h-5.5 items-center rounded-md border border-border bg-muted/60 px-2 text-xs font-medium text-muted-foreground">
                        {phase.type}
                    </span>
                ),
            },
            {
                key: "status",
                label: "Status",
                render: (phase) => (
                    <StatusBadge
                        tone={LIFECYCLE_TONE[phase.status] ?? "neutral"}
                    >
                        {PHASE_STATUS_LABELS[phase.status] ?? phase.status}
                    </StatusBadge>
                ),
            },
            {
                key: "startDate",
                label: "Start",
                className: "hidden sm:table-cell",
                render: (phase) => (
                    <span className="tabular text-[13px] text-muted-foreground">
                        {phase.startDate ? formatDate(phase.startDate) : "—"}
                    </span>
                ),
            },
            {
                key: "endDate",
                label: "End",
                className: "hidden sm:table-cell",
                render: (phase) => (
                    <span className="tabular text-[13px] text-muted-foreground">
                        {phase.endDate ? formatDate(phase.endDate) : "—"}
                    </span>
                ),
            },
            ...(hasAnyAction
                ? [
                      {
                          key: "actions" as const,
                          label: "",
                          className: "w-px text-right",
                          render: (phase: Phase) => (
                              <div className="flex items-center justify-end gap-0.5">
                                  {canView && (
                                      <IconAction
                                          label={`Open ${phase.name}`}
                                          icon={Eye}
                                          onClick={() =>
                                              navigate(`${phase.id}`)
                                          }
                                      />
                                  )}
                                  {hasSprintAccess && (
                                      <IconAction
                                          label="Sprints"
                                          icon={ListTodo}
                                          onClick={() =>
                                              navigate(`${phase.id}/sprints`)
                                          }
                                      />
                                  )}
                                  {canEdit && (
                                      <IconAction
                                          label={`Edit ${phase.name}`}
                                          icon={Pencil}
                                          onClick={() => {
                                              setEditPhase(phase);
                                              setEditModalOpen(true);
                                          }}
                                      />
                                  )}
                                  {canDelete && (
                                      <IconAction
                                          label={`Delete ${phase.name}`}
                                          icon={Trash2}
                                          tone="danger"
                                          onClick={() => handleDelete(phase)}
                                      />
                                  )}
                              </div>
                          ),
                      },
                  ]
                : []),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [hasAnyAction, canView, canEdit, canDelete],
    );

    return (
        <PageContainer>
            <PageHeader
                breadcrumbs={[
                    { label: "Projects", to: `/${slug}/projects` },
                    {
                        label: projectName || "Project",
                        to: `/${slug}/projects/${projectId}`,
                    },
                    { label: "Phases" },
                ]}
                title="Phases"
                description="Organize the project into milestones and track each phase's timeline."
                actions={<AddPhaseModal />}
            />

            <Toolbar>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search phases…"
                />
                {!isLoading && (
                    <span className="tabular text-[13px] text-muted-foreground sm:ml-1">
                        {totalPhases} phase{totalPhases !== 1 ? "s" : ""}
                    </span>
                )}
            </Toolbar>

            <DataTable
                columns={columns}
                data={phases}
                getRowId={(phase) => phase.id}
                hasActiveFilters={search.length > 0}
                showDefaultFooter={false}
                loading={isLoading}
                emptyState={
                    <EmptyState
                        icon={Layers}
                        title="No phases yet"
                        description="Add a phase to break this project into clear milestones."
                    />
                }
            />

            {totalPages > 0 && phases.length > 0 && (
                <Pagination
                    page={safePage}
                    totalPages={totalPages}
                    onPrevious={() => setPage((p) => Math.max(1, p - 1))}
                    onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                    shown={phases.length}
                    total={totalPhases}
                    noun="phase"
                />
            )}

            <EditPhaseModal
                phase={editPhase}
                open={editModalOpen}
                onOpenChange={(val) => {
                    setEditModalOpen(val);
                    if (!val) setEditPhase(null);
                }}
            />
        </PageContainer>
    );
};

export default Phases;
