import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Layers,
    CheckCircle2,
    Activity,
    CalendarDays,
    Tag,
    ListTodo,
    ArrowRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
    usePhaseDashboardQuery,
    usePhaseSummaryMutation,
} from "../hooks/usePhases";
import { PHASE_STATUS_LABELS } from "../schema/phases.schema";
import { STATUS_LABELS as SPRINT_STATUS_LABELS } from "@/features/sprint/constants/sprint.constants";
import type { SprintStatus } from "@/features/sprint/types/sprint.types";
import AiSummary from "@/features/dashboard/components/AiSummary";
import { useProjectByIdQuery } from "@/features/projects/hooks/useProjects";
import {
    MetaItem,
    PageContainer,
    PageHeader,
} from "@/components/common/PageHeader";
import { StatCard, StatGrid } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState, ErrorState } from "@/components/common/EmptyState";
import { PageSkeleton } from "@/components/common/Skeletons";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    LIFECYCLE_TONE,
    TONE_FILL,
    WORKFLOW_TONE,
    progressTone,
} from "@/lib/tones";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";

const PhaseDashboardPage = () => {
    const {
        id: projectId,
        phaseId,
        slug,
    } = useParams<{
        id: string;
        phaseId: string;
        slug: string;
    }>();
    const navigate = useNavigate();
    const { hasPermission } = usePermission();

    const { data, isLoading, isError, refetch } =
        usePhaseDashboardQuery(phaseId);
    const summaryMutation = usePhaseSummaryMutation();
    const { data: projectRes } = useProjectByIdQuery(projectId);
    const projectName: string | undefined =
        projectRes?.data?.title ?? projectRes?.data?.name;

    const overallPct =
        data && data.sprints.length > 0
            ? Math.round(
                  data.sprints.reduce((s, sp) => s + sp.completionPercent, 0) /
                      data.sprints.length,
              )
            : 0;

    const phasesHref = `/${slug}/projects/${projectId}/phases`;
    const sprintsHref = `${phasesHref}/${phaseId}/sprints`;

    if (isLoading) {
        return <PageSkeleton stats={3} variant="dashboard" />;
    }

    if (isError || !data) {
        return (
            <PageContainer>
                <ErrorState
                    title="We couldn't load this phase"
                    description="The phase may have been removed, or there was a problem reaching the server."
                    onRetry={() => refetch()}
                    action={
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(phasesHref)}
                        >
                            Back to phases
                        </Button>
                    }
                />
            </PageContainer>
        );
    }

    const canListSprints = hasPermission(PERMISSIONS.SPRINT.LIST);

    return (
        <PageContainer>
            <PageHeader
                breadcrumbs={[
                    { label: "Projects", to: `/${slug}/projects` },
                    {
                        label: projectName || "Project",
                        to: `/${slug}/projects/${projectId}`,
                    },
                    { label: "Phases", to: phasesHref },
                    { label: data.title },
                ]}
                media={
                    <span className="flex size-12 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
                        <Layers className="size-5" />
                    </span>
                }
                title={data.title}
                meta={
                    <StatusBadge
                        tone={LIFECYCLE_TONE[data.status] ?? "neutral"}
                    >
                        {PHASE_STATUS_LABELS[data.status] ?? data.status}
                    </StatusBadge>
                }
                details={
                    <>
                        <MetaItem icon={Tag}>{data.type}</MetaItem>
                        <MetaItem icon={CalendarDays}>
                            {formatDate(data.startDate)} –{" "}
                            {formatDate(data.endDate)}
                        </MetaItem>
                    </>
                }
                actions={
                    canListSprints ? (
                        <Button onClick={() => navigate(sprintsHref)}>
                            <ListTodo />
                            View sprints
                        </Button>
                    ) : undefined
                }
            />

            <StatGrid columns={3}>
                <StatCard
                    label="Total Sprints"
                    value={data.totalSprintsCount}
                    icon={ListTodo}
                    tone="primary"
                />
                <StatCard
                    label="Active Sprints"
                    value={data.activeSprintsCount}
                    icon={Activity}
                    tone="info"
                />
                <StatCard
                    label="Completed"
                    value={data.completedSprintsCount}
                    icon={CheckCircle2}
                    tone="success"
                    hint={
                        data.totalSprintsCount > 0
                            ? `of ${data.totalSprintsCount} sprints`
                            : undefined
                    }
                    className="col-span-2 lg:col-span-1"
                />
            </StatGrid>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-6">
                <SectionCard
                    className="xl:col-span-2"
                    title="Sprints"
                    description={`${data.completedSprintsCount} of ${data.totalSprintsCount} completed`}
                    actions={
                        data.sprints.length > 0 ? (
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs text-muted-foreground">
                                    Overall
                                </span>
                                <span className="tabular text-sm font-semibold text-foreground">
                                    {overallPct}%
                                </span>
                            </div>
                        ) : undefined
                    }
                    flush
                >
                    {data.sprints.length === 0 ? (
                        <EmptyState
                            icon={ListTodo}
                            title="No sprints yet"
                            description="Plan sprints to deliver this phase in focused iterations."
                            size="sm"
                            action={
                                canListSprints ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(sprintsHref)}
                                    >
                                        Go to sprints
                                        <ArrowRight />
                                    </Button>
                                ) : undefined
                            }
                        />
                    ) : (
                        <ol className="divide-y divide-border">
                            {data.sprints.map((sprint, i) => {
                                const status = sprint.status as
                                    | SprintStatus
                                    | undefined;
                                const href = sprint.id
                                    ? `${sprintsHref}/${sprint.id}`
                                    : undefined;
                                return (
                                    <li
                                        key={sprint.id ?? i}
                                        className="group space-y-2 px-5 py-3.5"
                                    >
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                            <span className="tabular flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground">
                                                {sprint.sequence ?? i + 1}
                                            </span>
                                            {href ? (
                                                <Link
                                                    to={href}
                                                    className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground hover:text-primary"
                                                >
                                                    {sprint.sprintName}
                                                </Link>
                                            ) : (
                                                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                                                    {sprint.sprintName}
                                                </span>
                                            )}
                                            {status && (
                                                <StatusBadge
                                                    size="sm"
                                                    tone={
                                                        WORKFLOW_TONE[status] ??
                                                        "neutral"
                                                    }
                                                >
                                                    {SPRINT_STATUS_LABELS[
                                                        status
                                                    ] ?? sprint.status}
                                                </StatusBadge>
                                            )}
                                            {(sprint.startDate ||
                                                sprint.endDate) && (
                                                <span className="tabular hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                                                    <CalendarDays className="size-3" />
                                                    {sprint.startDate
                                                        ? formatDate(
                                                              sprint.startDate,
                                                          )
                                                        : "—"}{" "}
                                                    –{" "}
                                                    {sprint.endDate
                                                        ? formatDate(
                                                              sprint.endDate,
                                                          )
                                                        : "—"}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 pl-9">
                                            <Progress
                                                value={sprint.completionPercent}
                                                aria-label={`${sprint.sprintName} completion`}
                                                className="flex-1"
                                                indicatorClassName={
                                                    TONE_FILL[
                                                        progressTone(
                                                            sprint.completionPercent,
                                                        )
                                                    ]
                                                }
                                            />
                                            <span className="tabular w-9 shrink-0 text-right text-xs font-medium text-muted-foreground">
                                                {sprint.completionPercent}%
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </SectionCard>

                <div className="space-y-4 xl:space-y-6">
                    <AiSummary
                        summary={summaryMutation.data}
                        isPending={summaryMutation.isPending}
                        onGenerate={() => summaryMutation.mutate(phaseId!)}
                        title="AI Phase Summary"
                        subject="phase"
                    />
                    {data.description && (
                        <SectionCard title="About this phase">
                            <div
                                className="rich-content text-[13px] text-muted-foreground"
                                dangerouslySetInnerHTML={{
                                    __html: data.description,
                                }}
                            />
                        </SectionCard>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default PhaseDashboardPage;
