import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    Layers,
    CheckCircle2,
    Activity,
    FolderKanban,
    AlertCircle,
    Loader2,
    Building2,
    CalendarDays,
} from "lucide-react";
import {
    useProjectDashboardQuery,
    useProjectSummaryMutation,
} from "../hooks/useProjects";
import AiSummary from "@/features/dashboard/components/AiSummary";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { STATUS_STYLES, STATUS_LABELS } from "../constants/projects.constants";

function getLogoUrl(logoPath: string | null): string {
    if (!logoPath) return "";
    if (logoPath.startsWith("http://") || logoPath.startsWith("https://"))
        return logoPath;
    const apiBase = import.meta.env.VITE_PUBLIC_API_BASE_URL || "";
    const root = apiBase.replace("/api/v1", "");
    return `${root}${logoPath.startsWith("/") ? "" : "/"}${logoPath}`;
}

function phaseBarColor(pct: number) {
    if (pct >= 75) return "bg-emerald-500";
    if (pct >= 25) return "bg-amber-500";
    return "bg-red-500";
}

function phaseTextColor(pct: number) {
    if (pct >= 75) return "text-emerald-600 dark:text-emerald-400";
    if (pct >= 25) return "text-amber-600 dark:text-amber-400";
    return "text-red-500 dark:text-red-400";
}

function overallColor(pct: number) {
    if (pct >= 75) return { ring: "#10b981", text: "text-emerald-500" };
    if (pct >= 25) return { ring: "#f59e0b", text: "text-amber-500" };
    return { ring: "#ef4444", text: "text-red-500" };
}

const AVATAR_COLORS = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
];

function avatarColor(name: string) {
    const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
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
        key: "totalMembersCount",
        label: "Members",
        icon: Users,
        bg: "bg-blue-50 dark:bg-blue-950/30",
        iconBg: "bg-blue-100 dark:bg-blue-900/40",
        iconColor: "text-blue-600 dark:text-blue-400",
        valueColor: "text-blue-700 dark:text-blue-300",
    },
    {
        key: "totalPhasesCount",
        label: "Total Phases",
        icon: Layers,
        bg: "bg-violet-50 dark:bg-violet-950/30",
        iconBg: "bg-violet-100 dark:bg-violet-900/40",
        iconColor: "text-violet-600 dark:text-violet-400",
        valueColor: "text-violet-700 dark:text-violet-300",
    },
    {
        key: "completedPhasesCount",
        label: "Completed",
        icon: CheckCircle2,
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        valueColor: "text-emerald-700 dark:text-emerald-300",
    },
    {
        key: "activePhasesCount",
        label: "Active Phases",
        icon: Activity,
        bg: "bg-orange-50 dark:bg-orange-950/30",
        iconBg: "bg-orange-100 dark:bg-orange-900/40",
        iconColor: "text-orange-600 dark:text-orange-400",
        valueColor: "text-orange-700 dark:text-orange-300",
    },
] as const;

const ProjectDashboardPage = () => {
    const { id, slug } = useParams<{ id: string; slug: string }>();
    const navigate = useNavigate();

    const { data, isLoading, isError } = useProjectDashboardQuery(id);
    const summaryMutation = useProjectSummaryMutation();

    const overallPct =
        data && data.phases.length > 0
            ? Math.round(
                  data.phases.reduce((s, p) => s + p.completionPercent, 0) /
                      data.phases.length,
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
                <p className="text-sm">Failed to load project details</p>
            </div>
        );
    }

    const logoUrl = getLogoUrl(data.logoUrl);

    return (
        <div className="p-6 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => navigate(`/${slug}/projects`)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={15} />
                    Projects
                </button>
                <span className="text-muted-foreground/40 text-sm">/</span>
                <span className="text-sm font-medium text-foreground truncate max-w-xs">
                    {data.title}
                </span>
            </div>

            {/* Hero card */}
            <div className="rounded-xl border bg-card shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    {/* Logo */}
                    <div className="size-16 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={data.title}
                                className="size-full object-cover"
                            />
                        ) : (
                            <FolderKanban size={28} className="text-primary" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl font-semibold text-foreground leading-tight">
                                {data.title}
                            </h1>
                            <Badge
                                variant="outline"
                                className={STATUS_STYLES[data.status] ?? ""}
                            >
                                {STATUS_LABELS[data.status] ?? data.status}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Building2 size={13} className="shrink-0" />
                                <span>{data.clientName}</span>
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                onGenerate={() => summaryMutation.mutate(id!)}
            />

            {/* Bottom grid: Phase Progress + Team Members */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Phase Progress — spans 2 cols */}
                {data.phases.length > 0 && (
                    <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                <Layers size={14} className="text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground">
                                Phase Progress
                            </h2>
                            <span className="ml-auto text-xs text-muted-foreground">
                                {data.completedPhasesCount}/
                                {data.totalPhasesCount} completed
                            </span>
                        </div>

                        <div className="divide-y">
                            {data.phases.map((phase, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 px-5 py-4"
                                >
                                    <span className="text-xs font-medium text-muted-foreground w-5 shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="text-sm font-medium text-foreground w-36 truncate shrink-0">
                                        {phase.phaseName}
                                    </span>
                                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${phaseBarColor(phase.completionPercent)}`}
                                            style={{
                                                width: `${phase.completionPercent}%`,
                                            }}
                                        />
                                    </div>
                                    <span
                                        className={`text-sm font-semibold w-10 text-right shrink-0 ${phaseTextColor(phase.completionPercent)}`}
                                    >
                                        {phase.completionPercent}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Team Members */}
                {data.teamMembers.length > 0 && (
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                <Users size={14} className="text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground">
                                Team Members
                            </h2>
                            <span className="ml-auto text-xs text-muted-foreground">
                                {data.totalMembersCount} total
                            </span>
                        </div>

                        <div className="divide-y">
                            {data.teamMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-3 px-5 py-3.5"
                                >
                                    <div
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold ${avatarColor(member.name)}`}
                                    >
                                        {getInitials(member.name)}
                                    </div>
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {member.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDashboardPage;
