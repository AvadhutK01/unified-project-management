import { useState, useMemo, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
    LayoutList,
    Columns3,
    PlayCircle,
    ClipboardList,
    CheckCircle,
    Sparkles,
    Bug,
} from "lucide-react";
import { type WorkItem } from "../types/workitem.types";
import { mapWorkItem } from "../api/workitem.api";
import WorkItemList from "../components/WorkItemList";
import WorkItemKanbanBoard from "../components/WorkItemKanbanBoard";
import AddWorkItemModal from "../components/AddWorkItemModal";
import EditWorkItemModal from "../components/EditWorkItemModal";
import { useWorkItemViewStore } from "../store/workitem.store";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/providers/ConfirmProvider";
import { toast } from "sonner";
import {
    useProjectByIdQuery,
    useProjectMembersQuery,
} from "../../projects/hooks/useProjects";
import {
    useWorkItemsQuery,
    useUpdateWorkItemStatusMutation,
    useDeleteWorkItemMutation,
} from "../hooks/useWorkItems";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";

const WorkItems = () => {
    const { view, setView } = useWorkItemViewStore();
    const { id: projectId, sprintId } = useParams<{
        id: string;
        sprintId: string;
    }>();
    const [searchParams, setSearchParams] = useSearchParams();

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

    const { data: workItemsResponse, isPending: isLoading } = useWorkItemsQuery(
        sprintId,
        currentPage,
    );

    const workItems = useMemo(() => {
        return (workItemsResponse?.data?.data ?? []).map(mapWorkItem);
    }, [workItemsResponse]);

    const totalItems =
        workItemsResponse?.data?.pagination?.total ?? workItems.length;
    const totalPages = workItemsResponse?.data?.pagination?.totalPages ?? 0;
    const { mutate: updateStatus } = useUpdateWorkItemStatusMutation();
    const { mutate: deleteWorkItem } = useDeleteWorkItemMutation();

    const { data: projectData } = useProjectByIdQuery(projectId);
    const { data: projectMembersData } = useProjectMembersQuery(projectId);

    const [pendingWorkItemId, setPendingWorkItemId] = useState<string | null>(
        null,
    );
    const [editingWorkItem, setEditingWorkItem] = useState<WorkItem | null>(
        null,
    );

    const confirm = useConfirm();

    const projectMembers = useMemo(() => {
        if (!projectData?.data?.members || !projectMembersData?.data?.data)
            return [];
        return projectMembersData.data.data
            .map((m: any) => {
                const pm = projectData.data.members.find(
                    (pMember: any) =>
                        pMember.organizationMemberId === m.memberId,
                );
                return {
                    id: pm?.id || "",
                    name: m.name,
                    email: m.email,
                };
            })
            .filter((m: any) => m.id);
    }, [projectData, projectMembersData]);

    const handleStatusChange = (workItem: WorkItem, newStatus: string) => {
        setPendingWorkItemId(workItem.id);
        updateStatus(
            { id: workItem.id, status: newStatus },
            {
                onSuccess: () => {
                    setPendingWorkItemId(null);
                },
                onError: (err: any) => {
                    setPendingWorkItemId(null);
                    toast.error(
                        err?.response?.data?.message ||
                            "Failed to update status",
                    );
                },
            },
        );
    };

    const handleDeleteRequest = async (workItem: WorkItem) => {
        const confirmed = await confirm({
            title: `Delete ${workItem.title}?`,
            description:
                "Are you sure you want to delete this work item? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
        });
        if (!confirmed) return;

        deleteWorkItem(workItem.id, {
            onSuccess: () => {
                toast.success("Work item deleted successfully");
            },
            onError: (err: any) => {
                toast.error(
                    err?.response?.data?.message ||
                        "Failed to delete work item",
                );
            },
        });
    };

    const activeItems = workItems.filter(
        (w: WorkItem) => w.status === "active",
    ).length;
    const newItems = workItems.filter(
        (w: WorkItem) => w.status === "new",
    ).length;
    const closedItems = workItems.filter(
        (w: WorkItem) => w.status === "closed",
    ).length;

    const { hasPermission } = usePermission();
    const canAdd = hasPermission(PERMISSIONS.WORKITEM.ADD);
    const canView = hasPermission(PERMISSIONS.WORKITEM.VIEW);
    const canEdit = hasPermission(PERMISSIONS.WORKITEM.EDIT);
    const canDelete = hasPermission(PERMISSIONS.WORKITEM.DELETE);

    return (
        <div className="p-6 space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20 shadow-xs">
                        <Bug className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Work Items
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage and track tasks, bugs, and their progress.
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
            <div className="flex flex-row items-center justify-between">
                <AddWorkItemModal onAddWorkItem={() => {}} canAdd={canAdd} />

                {/* View switcher */}
                <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-xl border border-border/40 shadow-inner">
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

            <div className="transition-all duration-300">
                {view === "list" ? (
                    <WorkItemList
                        workItems={workItems}
                        pendingWorkItemId={pendingWorkItemId}
                        projectMembers={projectMembers}
                        canView={canView}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onEditRequest={(workItem) =>
                            setEditingWorkItem(workItem)
                        }
                        onStatusChange={handleStatusChange}
                        onDeleteRequest={handleDeleteRequest}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        onPageChange={setPage}
                        isLoading={isLoading}
                    />
                ) : (
                    <WorkItemKanbanBoard
                        sprintId={sprintId}
                        canView={canView}
                        canEdit={canEdit}
                        onEditRequest={(workItem) =>
                            setEditingWorkItem(workItem)
                        }
                        onStatusChange={handleStatusChange}
                    />
                )}
            </div>

            <EditWorkItemModal
                open={!!editingWorkItem}
                onOpenChange={(open) => {
                    if (!open) setEditingWorkItem(null);
                }}
                workItem={editingWorkItem}
                onEditWorkItem={() => setEditingWorkItem(null)}
            />
        </div>
    );
};

export default WorkItems;
