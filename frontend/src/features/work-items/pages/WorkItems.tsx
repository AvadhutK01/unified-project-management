import { useState, useMemo, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
    LayoutList,
    Columns3,
    Activity,
    CheckCircle2,
    Sparkles,
    ListChecks,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { StatCard, StatGrid } from "@/components/common/StatCard";
import { Toolbar, ViewSwitcher } from "@/components/common/Toolbar";
import { usePhaseByIdQuery } from "../../phases/hooks/usePhases";
import { useSprintQuery } from "../../sprint/hooks/useSprints";
import { type WorkItem } from "../types/workitem.types";
import { mapWorkItem } from "../api/workitem.api";
import WorkItemList from "../components/WorkItemList";
import WorkItemKanbanBoard from "../components/WorkItemKanbanBoard";
import AddWorkItemModal from "../components/AddWorkItemModal";
import EditWorkItemModal from "../components/EditWorkItemModal";
import { useWorkItemViewStore } from "../store/workitem.store";
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
    const {
        slug,
        id: projectId,
        phaseId,
        sprintId,
    } = useParams<{
        slug: string;
        id: string;
        phaseId: string;
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
    const { data: phaseRes } = usePhaseByIdQuery(phaseId);
    const { data: sprintRes } = useSprintQuery(sprintId);
    const projectName: string | undefined =
        projectData?.data?.title ?? projectData?.data?.name;
    const phaseName: string | undefined = phaseRes?.data?.name;
    const sprintName: string | undefined = sprintRes?.data?.title;

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
                    memberId: m.memberId,
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

    const phasesHref = `/${slug}/projects/${projectId}/phases`;
    const sprintHref = `${phasesHref}/${phaseId}/sprints/${sprintId}`;

    return (
        <PageContainer size="wide">
            <PageHeader
                breadcrumbs={[
                    { label: "Projects", to: `/${slug}/projects` },
                    {
                        label: projectName || "Project",
                        to: `/${slug}/projects/${projectId}`,
                    },
                    {
                        label: phaseName || "Phase",
                        to: `${phasesHref}/${phaseId}`,
                    },
                    { label: sprintName || "Sprint", to: sprintHref },
                    { label: "Work items" },
                ]}
                title="Work items"
                description="Track tasks and bugs, estimates and ownership for this sprint."
                actions={
                    <AddWorkItemModal
                        onAddWorkItem={() => {}}
                        canAdd={canAdd}
                    />
                }
            />

            <StatGrid columns={4}>
                <StatCard
                    label="Total"
                    value={totalItems}
                    icon={ListChecks}
                    tone="primary"
                    hint="Items tracked"
                />
                <StatCard
                    label="Active"
                    value={activeItems}
                    icon={Activity}
                    tone="info"
                    hint="In progress"
                />
                <StatCard
                    label="New"
                    value={newItems}
                    icon={Sparkles}
                    tone="violet"
                    hint="Awaiting start"
                />
                <StatCard
                    label="Closed"
                    value={closedItems}
                    icon={CheckCircle2}
                    tone="success"
                    hint="Completed"
                />
            </StatGrid>

            <Toolbar
                actions={
                    <ViewSwitcher
                        value={view}
                        onChange={setView}
                        options={[
                            { value: "kanban", label: "Board", icon: Columns3 },
                            { value: "list", label: "List", icon: LayoutList },
                        ]}
                        className="w-full sm:w-auto"
                    />
                }
            >
                {view === "kanban" && (
                    <p className="text-[13px] text-muted-foreground">
                        Drag a card between columns to change its status.
                    </p>
                )}
            </Toolbar>

            <div>
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
        </PageContainer>
    );
};

export default WorkItems;
