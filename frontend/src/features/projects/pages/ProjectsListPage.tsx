import { useCallback, useMemo, useState } from "react";
import { Eye, Pencil, Trash2, FolderKanban, Layers } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { formatDate, useDebounce } from "@/lib/utils";
import {
    useProjectsQuery,
    useDeleteProjectMutation,
} from "../hooks/useProjects";
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";
import ProjectCreateModal from "../components/ProjectCreateModal";
import ProjectEditModal from "../components/ProjectEditModal";
import { STATUS_LABELS } from "../constants/projects.constants";
import type { Project } from "../types/project.types";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { ProjectLogo } from "../components/ProjectLogo";

const ProjectsListPage = () => {
    const confirm = useConfirm();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const { hasPermission } = usePermission();
    const { mutate: deleteProjectMutation } = useDeleteProjectMutation();

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

    const [search, setSearch] = useState("");
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);

    const canView = hasPermission(PERMISSIONS.PROJECTS.VIEW);
    const canEdit = hasPermission(PERMISSIONS.PROJECTS.EDIT);
    const canDelete = hasPermission(PERMISSIONS.PROJECTS.DELETE);
    const canAdd = hasPermission(PERMISSIONS.PROJECTS.ADD);
    const hasPhaseAccess = hasPermission(PERMISSIONS.PHASES.LIST);
    const hasAnyAction = canView || canEdit || canDelete || hasPhaseAccess;

    const debouncedSearch = useDebounce(search, 300);

    const { data: projectsData, isLoading } = useProjectsQuery(
        currentPage,
        debouncedSearch,
    );

    const projects = useMemo<Project[]>(() => {
        return (
            projectsData?.data?.data?.map((item: any) => ({
                id: item.id,
                name: item.title,
                status: item.status,
                manager: item.clientName ?? "",
                startDate: item.startDate ?? "",
                endDate: item.endDate ?? "",
                logo: item.logoUrl,
            })) ?? []
        );
    }, [projectsData]);

    const totalProjects = projectsData?.data?.pagination?.total ?? 0;
    const totalPages = projectsData?.data?.pagination?.totalPages ?? 1;
    const safePage = Math.min(currentPage, totalPages);

    const handleView = (project: Project) => {
        navigate(`${project.id}`);
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setEditModalOpen(true);
    };

    const handleDelete = async (project: Project) => {
        const confirmed = await confirm({
            title: `Delete ${project.name}?`,
            description: `Are you sure you want to delete ${project.name}? This action cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
        });
        if (!confirmed) return;

        deleteProjectMutation(project.id, {
            onSuccess: () => {
                toast.success(`${project.name} has been deleted.`);
            },
            onError: (error: any) => {
                toast.error(
                    error?.response?.data?.message ||
                        `Failed to delete ${project.name}. Please try again.`,
                );
            },
        });
    };

    const columns = useMemo<DataTableColumn<Project>[]>(
        () => [
            {
                key: "name",
                label: "Project",
                render: (project) => (
                    <div className="flex max-w-[22rem] min-w-0 items-center gap-3">
                        <ProjectLogo logo={project.logo} name={project.name} />
                        <div className="min-w-0">
                            {canView ? (
                                <Link
                                    to={`${project.id}`}
                                    className="block truncate font-medium text-foreground hover:text-primary hover:underline-offset-4"
                                >
                                    {project.name}
                                </Link>
                            ) : (
                                <p className="truncate font-medium text-foreground">
                                    {project.name}
                                </p>
                            )}
                            {project.manager && (
                                <p className="truncate text-xs text-muted-foreground md:hidden">
                                    {project.manager}
                                </p>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                key: "status",
                label: "Status",
                render: (project) => (
                    <StatusBadge
                        tone={LIFECYCLE_TONE[project.status] ?? "neutral"}
                    >
                        {STATUS_LABELS[project.status] ?? project.status}
                    </StatusBadge>
                ),
            },
            {
                key: "manager",
                label: "Client",
                className: "hidden md:table-cell",
                render: (project) => (
                    <span className="text-[13px] text-muted-foreground">
                        {project.manager || "—"}
                    </span>
                ),
            },
            {
                key: "startDate",
                label: "Start",
                className: "hidden lg:table-cell",
                render: (project) => (
                    <span className="tabular text-[13px] text-muted-foreground">
                        {project.startDate
                            ? formatDate(project.startDate)
                            : "—"}
                    </span>
                ),
            },
            {
                key: "endDate",
                label: "End",
                className: "hidden lg:table-cell",
                render: (project) => (
                    <span className="tabular text-[13px] text-muted-foreground">
                        {project.endDate ? formatDate(project.endDate) : "—"}
                    </span>
                ),
            },
            ...(hasAnyAction
                ? [
                      {
                          key: "actions" as const,
                          label: "",
                          className: "w-px text-right",
                          render: (project: Project) => (
                              <div className="flex items-center justify-end gap-0.5">
                                  {canView && (
                                      <IconAction
                                          label={`Open ${project.name}`}
                                          icon={Eye}
                                          onClick={() => handleView(project)}
                                      />
                                  )}
                                  {hasPhaseAccess && (
                                      <IconAction
                                          label="Phases"
                                          icon={Layers}
                                          onClick={() =>
                                              navigate(`${project.id}/phases`)
                                          }
                                      />
                                  )}
                                  {canEdit && (
                                      <IconAction
                                          label={`Edit ${project.name}`}
                                          icon={Pencil}
                                          onClick={() => handleEdit(project)}
                                      />
                                  )}
                                  {canDelete && (
                                      <IconAction
                                          label={`Delete ${project.name}`}
                                          icon={Trash2}
                                          tone="danger"
                                          onClick={() => handleDelete(project)}
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
        <>
            <PageContainer>
                <PageHeader
                    title="Projects"
                    description="Plan, track and deliver work across your organization."
                    actions={<ProjectCreateModal />}
                />

                <Toolbar>
                    <SearchInput
                        value={search}
                        placeholder="Search projects…"
                        onChange={(value) => {
                            setSearch(value);
                            setSearchParams((prev) => {
                                const next = new URLSearchParams(prev);
                                next.delete("page");
                                return next;
                            });
                        }}
                    />
                    {!isLoading && (
                        <span className="tabular text-[13px] text-muted-foreground sm:ml-1">
                            {totalProjects} project
                            {totalProjects !== 1 ? "s" : ""}
                        </span>
                    )}
                </Toolbar>

                <DataTable
                    columns={columns}
                    data={projects}
                    getRowId={(p) => p.id}
                    hasActiveFilters={search.length > 0}
                    loading={isLoading}
                    showDefaultFooter={false}
                    emptyState={
                        <EmptyState
                            icon={FolderKanban}
                            title="No projects yet"
                            description="Create your first project to start organizing your work."
                            action={canAdd ? <ProjectCreateModal /> : undefined}
                        />
                    }
                />

                {projects.length > 0 && (
                    <Pagination
                        page={safePage}
                        totalPages={totalPages}
                        onPrevious={() => setPage((p) => Math.max(1, p - 1))}
                        onNext={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                        shown={projects.length}
                        total={totalProjects}
                        noun="project"
                    />
                )}
            </PageContainer>
            <ProjectEditModal
                project={editingProject}
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);
                    if (!open) setEditingProject(null);
                }}
            />
        </>
    );
};

export default ProjectsListPage;
