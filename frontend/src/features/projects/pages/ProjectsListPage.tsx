import { useCallback, useMemo, useState } from "react";
import {
    Search,
    Eye,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    FolderKanban,
    Layers,
} from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { formatDate, useDebounce } from "@/lib/utils";
import {
    useProjectsQuery,
    useDeleteProjectMutation,
} from "../hooks/useProjects";
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";
import ProjectCreateModal from "../components/ProjectCreateModal";
import ProjectEditModal from "../components/ProjectEditModal";
import { STATUS_STYLES, STATUS_LABELS } from "../constants/projects.constants";
import type { Project } from "../types/project.types";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";
import { useNavigate, useSearchParams } from "react-router-dom";

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
    const hasPhaseAccess = hasPermission(PERMISSIONS.PHASES.LIST);
    const hasAnyAction = canView || canEdit || canDelete;

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

    const getImageUrl = (logoPath?: string) => {
        if (!logoPath) return "";
        if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) {
            return logoPath;
        }
        const apiBase = import.meta.env.VITE_PUBLIC_API_BASE_URL || "";
        const rootBase = apiBase.replace("/api/v1", "");
        return `${rootBase}${logoPath.startsWith("/") ? "" : "/"}${logoPath}`;
    };

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
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                            {project.logo ? (
                                <img
                                    src={getImageUrl(project.logo)}
                                    alt={project.name}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <FolderKanban className="size-4 text-primary" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {project.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {project.manager}
                            </p>
                        </div>
                    </div>
                ),
            },
            {
                key: "status",
                label: "Status",
                render: (project) => (
                    <Badge
                        variant="outline"
                        className={STATUS_STYLES[project.status] ?? ""}
                    >
                        {STATUS_LABELS[project.status] ?? project.status}
                    </Badge>
                ),
            },
            {
                key: "manager",
                label: "Client",
                className: "hidden md:table-cell",
                render: (project) => (
                    <span className="text-sm text-muted-foreground">
                        {project.manager}
                    </span>
                ),
            },
            {
                key: "startDate",
                label: "Start Date",
                className: "hidden lg:table-cell",
                render: (project) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(project.startDate)}
                    </span>
                ),
            },
            {
                key: "endDate",
                label: "End Date",
                className: "hidden lg:table-cell",
                render: (project) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(project.endDate)}
                    </span>
                ),
            },
            ...(hasAnyAction
                ? [
                      {
                          key: "actions" as const,
                          label: "Actions",
                          className: "w-24 text-right",
                          render: (project: Project) => (
                              <div className="flex items-center justify-end gap-2">
                                  {canView && (
                                      <button
                                          title={`View ${project.name}`}
                                          onClick={() => handleView(project)}
                                          className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                      >
                                          <Eye className="size-4" />
                                      </button>
                                  )}
                                  {canEdit && (
                                      <button
                                          title={`Edit ${project.name}`}
                                          onClick={() => handleEdit(project)}
                                          className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                      >
                                          <Edit className="size-4" />
                                      </button>
                                  )}
                                  {canDelete && (
                                      <button
                                          title={`Delete ${project.name}`}
                                          onClick={() => handleDelete(project)}
                                          className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                      >
                                          <Trash2 className="size-4" />
                                      </button>
                                  )}
                                  {hasPhaseAccess && (
                                      <button
                                          title={`Project Phases`}
                                          onClick={() =>
                                              navigate(`${project.id}/phases`)
                                          }
                                          className="inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                      >
                                          <Layers className="size-4" />
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

    const activeCount = projects.filter((p) => p.status === "started").length;

    return (
        <>
            <div className="p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">
                            Projects
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Manage and monitor all your agency projects.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
                            <FolderKanban className="size-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-foreground">
                                {totalProjects} total
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
                            <span className="size-1.5 rounded-full bg-blue-500" />
                            <span className="text-xs font-medium text-foreground">
                                {activeCount} active
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ProjectCreateModal />

                    <div className="relative min-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setSearchParams((prev) => {
                                    const next = new URLSearchParams(prev);
                                    next.delete("page");
                                    return next;
                                });
                            }}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary transition"
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={projects}
                    getRowId={(p) => p.id}
                    hasActiveFilters={search.length > 0}
                    loading={isLoading}
                    showDefaultFooter={false}
                    emptyState={
                        <tr>
                            <td colSpan={hasAnyAction ? 6 : 5}>
                                <div className="flex flex-col items-center justify-center py-16 gap-2">
                                    <FolderKanban className="size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">
                                        No projects yet
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Create your first project to get
                                        started.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    }
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground px-1">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {projects.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                            {totalProjects}
                        </span>{" "}
                        project{totalProjects !== 1 ? "s" : ""}
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
            </div>
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
