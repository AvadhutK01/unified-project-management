import { useCallback, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
    LayoutList,
    Columns3,
    ListTodo,
    Activity,
    CheckCircle2,
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
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { StatCard, StatGrid } from "@/components/common/StatCard";
import { Pagination, Toolbar, ViewSwitcher } from "@/components/common/Toolbar";
import { KanbanSkeleton, TableSkeleton } from "@/components/common/Skeletons";

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
    const projectName = projectRes?.data?.name ?? projectRes?.data?.title;

    const { data: phaseRes } = usePhaseByIdQuery(phaseId);
    const phaseName = phaseRes?.data?.name;

    const { hasPermission } = usePermission();
    const canAdd = hasPermission(PERMISSIONS.SPRINT.ADD);
    const canView = hasPermission(PERMISSIONS.SPRINT.VIEW);
    const canEdit = hasPermission(PERMISSIONS.SPRINT.EDIT);
    const canDelete = hasPermission(PERMISSIONS.SPRINT.DELETE);
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

    const phasesHref = `/${slug}/projects/${projectId}/phases`;

    return (
        <PageContainer size="wide">
            <PageHeader
                breadcrumbs={[
                    { label: "Projects", to: `/${slug}/projects` },
                    {
                        label: projectName || "Project",
                        to: `/${slug}/projects/${projectId}`,
                    },
                    { label: "Phases", to: phasesHref },
                    {
                        label: phaseName || "Phase",
                        to: `${phasesHref}/${phaseId}`,
                    },
                    { label: "Sprints" },
                ]}
                title="Sprints"
                description="Plan iterations, move sprints through their lifecycle and track delivery."
                actions={
                    <AddSprintModal onAddSprint={() => {}} canAdd={canAdd} />
                }
            />

            <StatGrid columns={4}>
                <StatCard
                    label="Total"
                    value={totalItems}
                    icon={ListTodo}
                    tone="primary"
                    hint="Sprints on this page"
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
                        Drag a sprint between columns to change its status.
                    </p>
                )}
            </Toolbar>

            {isLoading ? (
                view === "list" ? (
                    <TableSkeleton columns={4} />
                ) : (
                    <KanbanSkeleton />
                )
            ) : view === "list" ? (
                <div className="space-y-4">
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
                                    onSettled: () => setPendingSprintId(null),
                                },
                            );
                        }}
                    />

                    {totalPages > 0 && sprints.length > 0 && (
                        <Pagination
                            page={safePage}
                            totalPages={totalPages}
                            onPrevious={() =>
                                setPage((p) => Math.max(1, p - 1))
                            }
                            onNext={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            shown={sprints.length}
                            total={totalSprints}
                            noun="sprint"
                        />
                    )}
                </div>
            ) : (
                <SprintKanbanBoard
                    phaseId={phaseId}
                    canView={canView}
                    canEdit={canEdit}
                    onEditRequest={(sprint) => setEditingSprint(sprint)}
                    onStatusChange={async (sprint, newStatus, newSequence) => {
                        await updateSprintStatusAsync({
                            id: sprint.id,
                            payload: {
                                title: sprint.title,
                                description: sprint.description,
                                acceptanceCriteria: sprint.acceptanceCriteria,
                                status: newStatus as SprintItem["status"],
                                startDate: sprint.startDate ?? "",
                                endDate: sprint.endDate ?? "",
                                sequence: newSequence ?? sprint.sequence ?? 0,
                            },
                        });
                    }}
                />
            )}

            <EditSprintModal
                open={!!editingSprint}
                onOpenChange={(open) => {
                    if (!open) setEditingSprint(null);
                }}
                sprint={editingSprint}
                onEditSprint={() => {}}
            />
        </PageContainer>
    );
};

export default SprintPage;
