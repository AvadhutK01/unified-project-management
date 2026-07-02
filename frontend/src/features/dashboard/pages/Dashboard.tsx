import { LayoutDashboard, Loader2, AlertCircle } from "lucide-react";
import { useDashboardQuery } from "../hooks/useDashboard";
import OrganizationInfo from "../components/OrganizationInfo";
import StatsCards from "../components/StatsCards";
import AiSummary from "../components/AiSummary";
import ProjectProgressList from "../components/ProjectProgressList";
import RecentWorkItems from "../components/RecentWorkItems";

const Dashboard = () => {
    const { data, isLoading, isError, error } = useDashboardQuery();

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
                <p className="text-sm">
                    {error instanceof Error
                        ? error.message
                        : "Failed to load dashboard"}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <LayoutDashboard size={18} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-foreground leading-tight">
                        Dashboard
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Overview of your organization
                    </p>
                </div>
            </div>

            <OrganizationInfo
                title={data.title}
                slug={data.slug}
                logoUrl={data.logoUrl}
                websiteUrl={data.websiteUrl}
                description={data.description}
            />

            <StatsCards
                totalProjectsCount={data.totalProjectsCount}
                activeProjectsCount={data.activeProjectsCount}
                completedProjectsCount={data.completedProjectsCount}
                totalMembersCount={data.totalMembersCount}
            />

            <AiSummary data={data} />

            <div className="grid grid-cols-2 gap-6">
                <ProjectProgressList projects={data.projects} />
                <RecentWorkItems workItems={data.recentWorkItems} />
            </div>
        </div>
    );
};

export default Dashboard;
