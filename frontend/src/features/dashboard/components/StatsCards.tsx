import { FolderKanban, PlayCircle, CheckCircle2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
    totalProjectsCount: number;
    activeProjectsCount: number;
    completedProjectsCount: number;
    totalMembersCount: number;
}

const stats = [
    {
        key: "total" as const,
        label: "Total Projects",
        icon: FolderKanban,
        iconColor: "#da7756",
        bgColor: "rgba(218, 119, 86, 0.12)",
    },
    {
        key: "active" as const,
        label: "Active Projects",
        icon: PlayCircle,
        iconColor: "#798c5e",
        bgColor: "rgba(121, 140, 94, 0.12)",
    },
    {
        key: "completed" as const,
        label: "Completed Projects",
        icon: CheckCircle2,
        iconColor: "#6b9bcc",
        bgColor: "rgba(107, 155, 204, 0.12)",
    },
    {
        key: "members" as const,
        label: "Total Members",
        icon: Users,
        iconColor: "#9ec8ba",
        bgColor: "rgba(158, 200, 186, 0.15)",
    },
];

const valueMap: Record<(typeof stats)[number]["key"], keyof Props> = {
    total: "totalProjectsCount",
    active: "activeProjectsCount",
    completed: "completedProjectsCount",
    members: "totalMembersCount",
};

const StatsCards = (props: Props) => {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                const value = props[valueMap[stat.key]];
                return (
                    <Card
                        key={stat.label}
                        size="sm"
                        className="group relative transition-shadow hover:shadow-sm"
                    >
                        <div
                            className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl"
                            style={{ backgroundColor: stat.iconColor }}
                        />
                        <CardContent className="flex items-center gap-3 p-4">
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                                style={{
                                    backgroundColor: stat.bgColor,
                                    color: stat.iconColor,
                                }}
                            >
                                <Icon size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {value}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {stat.label}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default StatsCards;
