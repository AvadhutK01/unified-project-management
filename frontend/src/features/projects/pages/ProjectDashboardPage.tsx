import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Users,
    Layers,
    CheckCircle2,
    Activity,
    Building2,
    CalendarDays,
    Pencil,
    ArrowRight,
} from "lucide-react";
import {
    useProjectDashboardQuery,
    useProjectSummaryMutation,
} from "../hooks/useProjects";
import AiSummary from "@/features/dashboard/components/AiSummary";
import { formatDate } from "@/lib/utils";
import { STATUS_LABELS } from "../constants/projects.constants";
import { MemberAvatar } from "@/components/common/MemberAvatar";
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
import { LIFECYCLE_TONE, TONE_FILL, progressTone } from "@/lib/tones";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";
import { ProjectLogo } from "../components/ProjectLogo";
import ProjectEditModal from "../components/ProjectEditModal";

const ProjectDashboardPage = () => {
    const { id, slug } = useParams<{ id: string; slug: string }>();
    const navigate = useNavigate();
    const { hasPermission } = usePermission();
    const [editOpen, setEditOpen] = useState(false);

    const { data, isLoading, isError, refetch } = useProjectDashboardQuery(id);
    const summaryMutation = useProjectSummaryMutation();

    const overallPct =
        data && data.phases.length > 0
            ? Math.round(
                  data.phases.reduce((s, p) => s + p.completionPercent, 0) /
                      data.phases.length,
              )
            : 0;

    if (isLoading) {
        return <PageSkeleton stats={4} variant="dashboard" />;
    }

    if (isError || !data) {
        return (
            <PageContainer>
                <ErrorState
                    title="We couldn't load this project"
                    description="The project may have been removed, or there was a problem reaching the server."
                    onRetry={() => refetch()}
                    action={
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/${slug}/projects`)}
                        >
                            Back to projects
                        </Button>
                    }
                />
            </PageContainer>
        );
    }

    const canEdit = hasPermission(PERMISSIONS.PROJECTS.EDIT);
    const canListPhases = hasPermission(PERMISSIONS.PHASES.LIST);

    return (
        <PageContainer>
            <PageHeader
                breadcrumbs={[
                    { label: "Projects", to: `/${slug}/projects` },
                    { label: data.title },
                ]}
                media={
                    <ProjectLogo
                        logo={data.logoUrl}
                        name={data.title}
                        className="size-12 rounded-xl"
                        iconClassName="size-5"
                    />
                }
                title={data.title}
                meta={
                    <StatusBadge
                        tone={LIFECYCLE_TONE[data.status] ?? "neutral"}
                    >
                        {STATUS_LABELS[data.status] ?? data.status}
                    </StatusBadge>
                }
                details={
                    <>
                        {data.clientName && (
                            <MetaItem icon={Building2}>
                                {data.clientName}
                            </MetaItem>
                        )}
                        <MetaItem icon={CalendarDays}>
                            {formatDate(data.startDate)} –{" "}
                            {formatDate(data.endDate)}
                        </MetaItem>
                    </>
                }
                actions={
                    <>
                        {canEdit && (
                            <Button
                                variant="outline"
                                onClick={() => setEditOpen(true)}
                            >
                                <Pencil />
                                Edit
                            </Button>
                        )}
                        {canListPhases && (
                            <Button
                                onClick={() =>
                                    navigate(`/${slug}/projects/${id}/phases`)
                                }
                            >
                                <Layers />
                                View phases
                            </Button>
                        )}
                    </>
                }
            />

            <StatGrid columns={4}>
                <StatCard
                    label="Members"
                    value={data.totalMembersCount}
                    icon={Users}
                    tone="violet"
                />
                <StatCard
                    label="Total Phases"
                    value={data.totalPhasesCount}
                    icon={Layers}
                    tone="primary"
                />
                <StatCard
                    label="Completed"
                    value={data.completedPhasesCount}
                    icon={CheckCircle2}
                    tone="success"
                    hint={
                        data.totalPhasesCount > 0
                            ? `of ${data.totalPhasesCount} phases`
                            : undefined
                    }
                />
                <StatCard
                    label="Active Phases"
                    value={data.activePhasesCount}
                    icon={Activity}
                    tone="info"
                />
            </StatGrid>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-6">
                <div className="space-y-4 xl:col-span-2 xl:space-y-6">
                    <SectionCard
                        title="Phase progress"
                        description={`${data.completedPhasesCount} of ${data.totalPhasesCount} phases completed`}
                        actions={
                            data.phases.length > 0 ? (
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
                        {data.phases.length === 0 ? (
                            <EmptyState
                                icon={Layers}
                                title="No phases yet"
                                description="Break this project into phases to track progress across milestones."
                                size="sm"
                                action={
                                    canListPhases ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                navigate(
                                                    `/${slug}/projects/${id}/phases`,
                                                )
                                            }
                                        >
                                            Go to phases
                                            <ArrowRight />
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ) : (
                            <>
                                <div className="border-b border-border px-5 py-3">
                                    <Progress
                                        value={overallPct}
                                        className="h-2"
                                        aria-label="Overall project completion"
                                        indicatorClassName={
                                            TONE_FILL[progressTone(overallPct)]
                                        }
                                    />
                                </div>
                                <ol className="divide-y divide-border">
                                    {data.phases.map((phase, i) => (
                                        <li
                                            key={i}
                                            className="flex items-center gap-4 px-5 py-3"
                                        >
                                            <span className="tabular flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground">
                                                {i + 1}
                                            </span>
                                            <span className="w-28 shrink-0 truncate text-[13px] font-medium text-foreground sm:w-44">
                                                {phase.phaseName}
                                            </span>
                                            <Progress
                                                value={phase.completionPercent}
                                                aria-label={`${phase.phaseName} completion`}
                                                className="flex-1"
                                                indicatorClassName={
                                                    TONE_FILL[
                                                        progressTone(
                                                            phase.completionPercent,
                                                        )
                                                    ]
                                                }
                                            />
                                            <span className="tabular w-10 shrink-0 text-right text-xs font-medium text-muted-foreground">
                                                {phase.completionPercent}%
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            </>
                        )}
                    </SectionCard>

                    <AiSummary
                        summary={summaryMutation.data}
                        isPending={summaryMutation.isPending}
                        onGenerate={() => summaryMutation.mutate(id!)}
                        title="AI Project Summary"
                        subject="project"
                    />
                </div>

                <div className="space-y-4 xl:space-y-6">
                    {data.description && (
                        <SectionCard title="About">
                            <div
                                className="rich-content text-[13px] text-muted-foreground"
                                dangerouslySetInnerHTML={{
                                    __html: data.description,
                                }}
                            />
                        </SectionCard>
                    )}

                    <SectionCard
                        title="Team"
                        description={`${data.totalMembersCount} member${data.totalMembersCount !== 1 ? "s" : ""}`}
                        flush
                    >
                        {data.teamMembers.length === 0 ? (
                            <EmptyState
                                icon={Users}
                                title="No team members"
                                description="Add members to this project from the edit panel."
                                size="sm"
                            />
                        ) : (
                            <ul className="divide-y divide-border">
                                {data.teamMembers.map((member) => (
                                    <li
                                        key={member.id}
                                        className="flex items-center gap-3 px-5 py-2.5"
                                    >
                                        <MemberAvatar
                                            name={member.name}
                                            status={member.status}
                                            size="sm"
                                            memberId={member.id}
                                        />
                                        <span className="truncate text-[13px] font-medium text-foreground">
                                            {member.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </SectionCard>
                </div>
            </div>

            {editOpen && (
                <ProjectEditModal
                    project={{
                        id: id!,
                        name: data.title,
                        status: data.status,
                        manager: data.clientName,
                        startDate: data.startDate,
                        endDate: data.endDate,
                        logo: data.logoUrl ?? undefined,
                    }}
                    open={editOpen}
                    onOpenChange={(open) => {
                        setEditOpen(open);
                        // The dashboard query is keyed separately from the
                        // project record, so refresh it after editing.
                        if (!open) refetch();
                    }}
                />
            )}
        </PageContainer>
    );
};

export default ProjectDashboardPage;
