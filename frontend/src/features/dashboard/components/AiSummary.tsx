import {
    LayoutGrid,
    BarChart2,
    Users,
    ListChecks,
    ArrowRight,
} from "lucide-react";
import type { DashboardData } from "../types/dashboard.types";

interface Props {
    data: DashboardData;
}

const AiSummary = ({ data }: Props) => {
    const active = data.activeProjectsCount;
    const completed = data.completedProjectsCount;
    const total = data.totalProjectsCount;
    const members = data.totalMembersCount;

    const inFlight = data.projects.filter(
        (p) => p.completionPercent > 0 && p.completionPercent < 100,
    );
    const avgProgress =
        inFlight.length > 0
            ? Math.round(
                  inFlight.reduce((s, p) => s + p.completionPercent, 0) /
                      inFlight.length,
              )
            : 0;

    const totalWorkItems = data.recentWorkItems.length;
    const bugs = data.recentWorkItems.filter((w) => w.type === "bug").length;
    const tasks = totalWorkItems - bugs;

    const cards = [
        {
            icon: LayoutGrid,
            title: `${total} Project${total !== 1 ? "s" : ""}`,
            description: `${active} active and ${completed} completed across your organization.`,
            action: "View Projects",
            color: "#da7756",
            bgColor: "rgba(218,119,86,0.12)",
        },
        {
            icon: BarChart2,
            title: `${avgProgress}% Avg Progress`,
            description:
                inFlight.length > 0
                    ? `Average completion across ${inFlight.length} in-progress project${inFlight.length !== 1 ? "s" : ""}.`
                    : "No in-progress projects at the moment.",
            action: "View Details",
            color: "#6b9bcc",
            bgColor: "rgba(107,155,204,0.12)",
        },
        {
            icon: Users,
            title: `${members} Member${members !== 1 ? "s" : ""}`,
            description:
                total > 0 && members > 0
                    ? `${(total / members).toFixed(1)} projects per member on average across the org.`
                    : "No members added to the organization yet.",
            action: "View Team",
            color: "#9ec8ba",
            bgColor: "rgba(158,200,186,0.15)",
        },
        {
            icon: ListChecks,
            title: `${totalWorkItems} Work Item${totalWorkItems !== 1 ? "s" : ""}`,
            description:
                totalWorkItems > 0
                    ? `${tasks} task${tasks !== 1 ? "s" : ""} and ${bugs} bug${bugs !== 1 ? "s" : ""} recently assigned to team members.`
                    : "No work items have been assigned recently.",
            action: "View Items",
            color: "#798c5e",
            bgColor: "rgba(121,140,94,0.12)",
        },
    ];

    return (
        <div className="overflow-hidden rounded-xl bg-linear-to-br from-primary/[0.07] via-accent/50 to-secondary/60 ring-1 ring-primary/15">
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-primary/10 px-5 py-3.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                    <LayoutGrid size={13} />
                </div>
                <span className="text-sm font-semibold text-foreground">
                    Summary
                </span>
                <span className="text-xs text-muted-foreground">
                    — Quick overview of your organization
                </span>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-3 p-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.title}
                            className="flex flex-col gap-2 rounded-lg border border-border/50 bg-card p-3.5"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                    <div
                                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                                        style={{
                                            backgroundColor: card.bgColor,
                                            color: card.color,
                                        }}
                                    >
                                        <Icon size={12} />
                                    </div>
                                    <span className="truncate text-sm font-semibold text-foreground">
                                        {card.title}
                                    </span>
                                </div>
                                <button
                                    className="flex shrink-0 items-center gap-0.5 text-[11px] font-medium transition-opacity hover:opacity-70"
                                    style={{ color: card.color }}
                                >
                                    {card.action}
                                    <ArrowRight size={11} />
                                </button>
                            </div>
                            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                {card.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AiSummary;
