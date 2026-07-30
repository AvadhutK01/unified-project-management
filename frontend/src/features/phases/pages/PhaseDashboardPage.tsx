import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Layers,
    CheckCircle2,
    Activity,
    AlertCircle,
    Loader2,
    CalendarDays,
    Tag,
    ListTodo,
    ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
    usePhaseDashboardQuery,
    usePhaseSummaryMutation,
} from "../hooks/usePhases";
import {
    PHASE_STATUS_STYLES,
    PHASE_STATUS_LABELS,
} from "../schema/phases.schema";
import {
    STATUS_LABELS as SPRINT_STATUS_LABELS,
    STATUS_STYLES as SPRINT_STATUS_STYLES,
} from "@/features/sprint/constants/sprint.constants";
import type { SprintStatus } from "@/features/sprint/types/sprint.types";
import AiSummary from "@/features/dashboard/components/AiSummary";

function sprintBarColor(pct: number) {
    if (pct >= 75) return "bg-emerald-500";
    if (pct >= 25) return "bg-amber-500";
    return "bg-red-500";
}

function sprintTextColor(pct: number) {
    if (pct >= 75) return "text-emerald-600 dark:text-emerald-400";
    if (pct >= 25) return "text-amber-600 dark:text-amber-400";
    return "text-red-500 dark:text-red-400";
}

function overallColor(pct: number) {
    if (pct >= 75) return { ring: "#10b981", text: "text-emerald-500" };
    if (pct >= 25) return { ring: "#f59e0b", text: "text-amber-500" };
    return { ring: "#ef4444", text: "text-red-500" };
}

function CompletionRing({ pct }: { pct: number }) {
    const r = 36;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    const { ring, text } = overallColor(pct);
    return (
        <div className="flex flex-col items-center gap-1">
            <svg width="90" height="90" viewBox="0 0 90 90">
                <circle
                    cx="45"
                    cy="45"
                    r={r}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    className="text-muted/30"
                />
                <circle
                    cx="45"
                    cy="45"
                    r={r}
                    fill="none"
                    stroke={ring}
                    strokeWidth="7"
                    strokeDasharray={`${dash} ${circ - dash}`}
                    strokeDashoffset={circ / 4}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                />
                <text
                    x="45"
                    y="45"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="15"
                    fontWeight="700"
                    fill={ring}
                >
                    {pct}%
                </text>
            </svg>
            <span className={`text-xs font-medium ${text}`}>Overall</span>
        </div>
    );
}

const STAT_CARDS = [
    {
        key: "totalSprintsCount",
        label: "Total Sprints",
        icon: ListTodo,
        bg: "bg-violet-50 dark:bg-violet-950/30",
        iconBg: "bg-violet-100 dark:bg-violet-900/40",
        iconColor: "text-violet-600 dark:text-violet-400",
        valueColor: "text-violet-700 dark:text-violet-300",
    },
    {
        key: "completedSprintsCount",
        label: "Completed",
        icon: CheckCircle2,
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        valueColor: "text-emerald-700 dark:text-emerald-300",
    },
    {
        key: "activeSprintsCount",
        label: "Active Sprints",
        icon: Activity,
        bg: "bg-orange-50 dark:bg-orange-950/30",
        iconBg: "bg-orange-100 dark:bg-orange-900/40",
        iconColor: "text-orange-600 dark:text-orange-400",
        valueColor: "text-orange-700 dark:text-orange-300",
    },
] as const;

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

    const { data, isLoading, isError } = usePhaseDashboardQuery(phaseId);
    const summaryMutation = usePhaseSummaryMutation();

    const overallPct =
        data && data.sprints.length > 0
            ? Math.round(
                  data.sprints.reduce((s, sp) => s + sp.completionPercent, 0) /
                      data.sprints.length,
              )
            : 0;

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-65px)] items-center justify-center">
                <Loader2
                    size={32}
                    className="animate-spin text-muted-foreground"
                />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex h-[calc(100vh-65px)] flex-col items-center justify-center gap-2 text-muted-foreground">
                <AlertCircle size={28} />
                <p className="text-sm">Failed to load phase details</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() =>
                        navigate(`/${slug}/projects/${projectId}/phases`)
                    }
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={15} />
                    Phases
                </button>
                <span className="text-muted-foreground/40 text-sm">/</span>
                <span className="text-sm font-medium text-foreground truncate max-w-xs">
                    {data.title}
                </span>
            </div>

            {/* Hero card */}
            <div className="rounded-xl border bg-card shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    {/* Icon */}
                    <div className="size-14 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center border">
                        <Layers size={24} className="text-primary" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl font-semibold text-foreground leading-tight">
                                {data.title}
                            </h1>
                            <Badge
                                variant="outline"
                                className={
                                    PHASE_STATUS_STYLES[data.status] ?? ""
                                }
                            >
                                {PHASE_STATUS_LABELS[data.status] ??
                                    data.status}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Tag size={13} className="shrink-0" />
                                <span>{data.type}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CalendarDays size={13} className="shrink-0" />
                                <span>
                                    {formatDate(data.startDate)} →{" "}
                                    {formatDate(data.endDate)}
                                </span>
                            </div>
                        </div>

                        {data.description && (
                            <div
                                className="text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-0"
                                dangerouslySetInnerHTML={{
                                    __html: data.description,
                                }}
                            />
                        )}
                    </div>

                    {/* Completion ring */}
                    <div className="shrink-0">
                        <CompletionRing pct={overallPct} />
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {STAT_CARDS.map(
                    ({
                        key,
                        label,
                        icon: Icon,
                        bg,
                        iconBg,
                        iconColor,
                        valueColor,
                    }) => (
                        <div
                            key={key}
                            className={`rounded-xl border p-4 ${bg} flex items-center gap-4`}
                        >
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
                            >
                                <Icon size={18} className={iconColor} />
                            </div>
                            <div>
                                <p
                                    className={`text-2xl font-bold ${valueColor}`}
                                >
                                    {data[key as keyof typeof data] as number}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {label}
                                </p>
                            </div>
                        </div>
                    ),
                )}
            </div>

            {/* AI Summary */}
            <AiSummary
                summary={summaryMutation.data}
                isPending={summaryMutation.isPending}
                onGenerate={() => summaryMutation.mutate(phaseId!)}
            />

            {/* Sprint List */}
            {data.sprints.length > 0 && (
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                            <ListTodo size={14} className="text-primary" />
                        </div>
                        <h2 className="text-sm font-semibold text-foreground">
                            Sprints
                        </h2>
                        <span className="ml-auto text-xs text-muted-foreground">
                            {data.completedSprintsCount}/
                            {data.totalSprintsCount} completed
                        </span>
                    </div>

                    <div className="divide-y">
                        {data.sprints.map((sprint, i) => (
                            <div
                                key={sprint.id ?? i}
                                className="px-5 py-4 space-y-2.5"
                            >
                                {/* Top row: index · name · status · dates · navigate */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-xs font-medium text-muted-foreground w-5 shrink-0">
                                        {sprint.sequence ?? i + 1}
                                    </span>

                                    <span className="text-sm font-semibold text-foreground flex-1 min-w-0 truncate">
                                        {sprint.sprintName}
                                    </span>

                                    {sprint.status && (
                                        <Badge
                                            variant="outline"
                                            className={`shrink-0 ${SPRINT_STATUS_STYLES[sprint.status as SprintStatus] ?? ""}`}
                                        >
                                            {SPRINT_STATUS_LABELS[
                                                sprint.status as SprintStatus
                                            ] ?? sprint.status}
                                        </Badge>
                                    )}

                                    {(sprint.startDate || sprint.endDate) && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                            <CalendarDays size={11} />
                                            <span>
                                                {sprint.startDate
                                                    ? formatDate(
                                                          sprint.startDate,
                                                      )
                                                    : "—"}
                                                {" → "}
                                                {sprint.endDate
                                                    ? formatDate(sprint.endDate)
                                                    : "—"}
                                            </span>
                                        </div>
                                    )}

                                    {sprint.id && (
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/${slug}/projects/${projectId}/phases/${phaseId}/sprints/${sprint.id}`,
                                                )
                                            }
                                            className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                                        >
                                            View
                                            <ArrowRight size={11} />
                                        </button>
                                    )}
                                </div>

                                {/* Progress bar row */}
                                <div className="flex items-center gap-3 pl-8">
                                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${sprintBarColor(sprint.completionPercent)}`}
                                            style={{
                                                width: `${sprint.completionPercent}%`,
                                            }}
                                        />
                                    </div>
                                    <span
                                        className={`text-xs font-semibold w-8 text-right shrink-0 ${sprintTextColor(sprint.completionPercent)}`}
                                    >
                                        {sprint.completionPercent}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhaseDashboardPage;
