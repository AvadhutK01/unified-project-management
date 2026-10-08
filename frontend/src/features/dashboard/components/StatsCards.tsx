import { FolderKanban, Activity, CheckCircle2, Users } from "lucide-react";
import { StatCard, StatGrid } from "@/components/common/StatCard";

interface Props {
    totalProjectsCount: number;
    activeProjectsCount: number;
    completedProjectsCount: number;
    totalMembersCount: number;
}

const pct = (part: number, whole: number) =>
    whole > 0 ? Math.round((part / whole) * 100) : 0;

const StatsCards = ({
    totalProjectsCount,
    activeProjectsCount,
    completedProjectsCount,
    totalMembersCount,
}: Props) => {
    return (
        <StatGrid columns={4}>
            <StatCard
                label="Total Projects"
                value={totalProjectsCount}
                icon={FolderKanban}
                tone="primary"
                hint="Across this workspace"
            />
            <StatCard
                label="Active Projects"
                value={activeProjectsCount}
                icon={Activity}
                tone="info"
                hint={
                    totalProjectsCount > 0
                        ? `${pct(activeProjectsCount, totalProjectsCount)}% of all projects`
                        : "Currently in progress"
                }
            />
            <StatCard
                label="Completed Projects"
                value={completedProjectsCount}
                icon={CheckCircle2}
                tone="success"
                hint={
                    totalProjectsCount > 0
                        ? `${pct(completedProjectsCount, totalProjectsCount)}% of all projects`
                        : "Delivered work"
                }
            />
            <StatCard
                label="Team Members"
                value={totalMembersCount}
                icon={Users}
                tone="violet"
                hint="In this organization"
            />
        </StatGrid>
    );
};

export default StatsCards;
