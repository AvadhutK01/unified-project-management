import { useCallback, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    LayoutList,
    Columns3,
    ListTodo,
    PlayCircle,
    ClipboardList,
    CheckCircle,
    Sparkles,
} from "lucide-react";
import { type SprintItem } from "../types/sprint.types";
import { useSprintsQuery, useUpdateSprintMutation } from "../hooks/useSprints";
import { useProjectByIdQuery } from "../../projects/hooks/useProjects";
import { usePhaseByIdQuery } from "../../phases/hooks/usePhases";
import SprintList from "../components/SprintList";
import SprintKanbanBoard from "../components/SprintKanbanBoard";
import AddSprintModal from "../components/AddSprintModal";
import EditSprintModal from "../components/EditSprintModal";
import { useSprintViewStore } from "../../../store/sprint.store";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";
import { cn } from "@/lib/utils";

const SprintPage = () => {
    const { view, setView } = useSprintViewStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        slug,
        id: projectId,
        phaseId,
    } = useParams<{ slug: string; id: string; phaseId: string }>();

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

    const { data: sprintsData = [], isLoading } = useSprintsQuery(
        phaseId,
        currentPage,
    );
    const { mutate: updateSprintStatus, mutateAsync: updateSprintStatusAsync } =
        useUpdateSprintMutation();
    const [pendingSprintId, setPendingSprintId] = useState<string | null>(null);
    const [editingSprint, setEditingSprint] = useState<SprintItem | null>(null);

    const { data: projectRes } = useProjectByIdQuery(projectId);
    const projectName = projectRes?.data?.name;

    const { data: phaseRes } = usePhaseByIdQuery(phaseId);
    const phaseName = phaseRes?.data?.name;

    const { hasPermission } = usePermission();
    const canAdd = hasPermission(PERMISSIONS.SPRINT.ADD);
    const canView = hasPermission(PERMISSIONS.SPRINT.VIEW);
    const canEdit = hasPermission(PERMISSIONS.SPRINT.EDIT);
    const canDelete = hasPermission(PERMISSIONS.SPRINT.DELETE);
    const canChangeStatus = hasPermission(PERMISSIONS.SPRINT.STATUS);
    const canViewWorkItems = hasPermission(PERMISSIONS.WORKITEM.LIST);

    // Calculate metrics dynamically
    const sprints = sprintsData.data?.data ?? [];
    const totalItems = sprints.length;
    const activeItems = sprints?.filter(
        (s: SprintItem) => s.status === "active",
    ).length;
    const newItems = sprints?.filter(
        (s: SprintItem) => s.status === "new",
    ).length;
    const closedItems = sprints?.filter(
        (s: SprintItem) => s.status === "closed",
    ).length;

    const totalSprints = sprintsData?.data?.pagination?.total ?? 0;
    const totalPages = sprintsData?.data?.pagination?.totalPages ?? 0;
    const safePage = Math.min(currentPage, totalPages || 1);

    return (
        <div className="p-4 sm:p-6 space-y-5">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Link
                    to={`/${slug}/projects/${projectId}/phases`}
                    className="hover:text-foreground transition-colors"
                >
                    {projectName || "Project"}
                </Link>
                <ChevronRight className="size-3" />
                <span className="text-foreground">{phaseName || "Phase"}</span>
                <ChevronRight className="size-3" />
                <span className="text-foreground">Sprints</span>
            </div>

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20 shadow-xs">
                        <ListTodo className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Sprints
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage and track active iteration cycles, status,
                            and priorities.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Total Items
                        </span>
                        <div className="p-1.5 bg-primary/5 text-primary rounded-lg group-hover:bg-primary/10 transition-colors">
                            <ClipboardList className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-foreground">
                            {totalItems}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                            items tracked
                        </span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-l-4 border-l-green-500 group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Active
                        </span>
                        <div className="p-1.5 bg-green-500/5 text-green-500 rounded-lg group-hover:bg-green-500/10 transition-colors">
                            <PlayCircle className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-foreground">
                            {activeItems}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                            in progress
                        </span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-l-4 border-l-purple-500 group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Backlog / New
                        </span>
                        <div className="p-1.5 bg-purple-500/5 text-purple-500 rounded-lg group-hover:bg-purple-500/10 transition-colors">
                            <Sparkles className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-foreground">
                            {newItems}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                            awaiting start
                        </span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-l-4 border-l-gray-400 group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Closed
                        </span>
                        <div className="p-1.5 bg-gray-500/5 text-gray-500 rounded-lg group-hover:bg-gray-500/10 transition-colors">
                            <CheckCircle className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-foreground">
                            {closedItems}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                            completed
                        </span>
                    </div>
                </div>
            </div>

            {/* Toolbar Row */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <AddSprintModal onAddSprint={() => {}} canAdd={canAdd} />

                {/* View switcher Segmented Control */}
                <div className="flex items-center gap-1 self-start bg-secondary/60 p-1 rounded-xl border border-border/40 shadow-inner sm:self-auto">
                    <button
                        onClick={() => setView("kanban")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ease-out cursor-pointer select-none",
                            view === "kanban"
                                ? "bg-card text-primary shadow-sm scale-102 border border-border/30"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                        )}
                    >
                        <Columns3 className="size-4" />
                        <span>Kanban</span>
                    </button>
                    <button
                        onClick={() => setView("list")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ease-out cursor-pointer select-none",
                            view === "list"
                                ? "bg-card text-primary shadow-sm scale-102 border border-border/30"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                        )}
                    >
                        <LayoutList className="size-4" />
                        <span>List</span>
                    </button>
                </div>
            </div>

            {/* List/Board Content Container */}
            <div className="transition-all duration-300">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : view === "list" ? (
                    <>
                        <SprintList
                            sprints={sprints}
                            pendingSprintId={pendingSprintId}
                            canView={canView}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            canViewWorkItems={canViewWorkItems}
                            onEditRequest={(sprint) => setEditingSprint(sprint)}
                            onStatusChange={(sprint, newStatus) => {
                                setPendingSprintId(sprint.id);
                                updateSprintStatus(
                                    {
                                        id: sprint.id,
                                        payload: {
                                            title: sprint.title,
                                            description: sprint.description,
                                            acceptanceCriteria:
                                                sprint.acceptanceCriteria,
                                            status: newStatus as SprintItem["status"],
                                            startDate: sprint.startDate ?? "",
                                            endDate: sprint.endDate ?? "",
                                            sequence: sprint.sequence ?? 0,
                                        },
                                    },
                                    {
                                        onSettled: () =>
                                            setPendingSprintId(null),
                                    },
                                );
                            }}
                        />

                        {totalPages > 0 && (
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between mt-4">
                                <p className="text-xs text-muted-foreground px-1">
                                    Showing{" "}
                                    <span className="font-medium text-foreground">
                                        {sprints.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium text-foreground">
                                        {totalSprints}
                                    </span>{" "}
                                    sprint{totalSprints !== 1 ? "s" : ""}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
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
                                            setPage((p) =>
                                                Math.min(totalPages, p + 1),
                                            )
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
                ) : (
                    <SprintKanbanBoard
                        phaseId={phaseId}
                        canView={canView}
                        canEdit={canEdit}
                        onEditRequest={(sprint) => setEditingSprint(sprint)}
                        onStatusChange={async (
                            sprint,
                            newStatus,
                            newSequence,
                        ) => {
                            await updateSprintStatusAsync({
                                id: sprint.id,
                                payload: {
                                    title: sprint.title,
                                    description: sprint.description,
                                    acceptanceCriteria:
                                        sprint.acceptanceCriteria,
                                    status: newStatus as SprintItem["status"],
                                    startDate: sprint.startDate ?? "",
                                    endDate: sprint.endDate ?? "",
                                    sequence:
                                        newSequence ?? sprint.sequence ?? 0,
                                },
                            });
                        }}
                    />
                )}
            </div>

            <EditSprintModal
                open={!!editingSprint}
                onOpenChange={(open) => {
                    if (!open) setEditingSprint(null);
                }}
                sprint={editingSprint}
                onEditSprint={() => {}}
            />
        </div>
    );
};

export default SprintPage;
