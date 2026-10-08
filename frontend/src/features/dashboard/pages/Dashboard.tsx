import { Globe, AtSign } from "lucide-react";
import {
    useDashboardQuery,
    useDashboardSummaryMutation,
} from "../hooks/useDashboard";
import StatsCards from "../components/StatsCards";
import AiSummary from "../components/AiSummary";
import ProjectProgressList from "../components/ProjectProgressList";
import RecentWorkItems from "../components/RecentWorkItems";
import {
    MetaItem,
    PageContainer,
    PageHeader,
} from "@/components/common/PageHeader";
import { PageSkeleton } from "@/components/common/Skeletons";
import { ErrorState } from "@/components/common/EmptyState";
import { OrganizationAvatar } from "@/components/common/OrgSwitcher";
import { getColor } from "@/lib/utils";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
}

const Dashboard = () => {
    const { data, isLoading, isError, refetch } = useDashboardQuery();
    const summaryMutation = useDashboardSummaryMutation();
    const { hasPermission } = usePermission();

    if (isLoading) {
        return <PageSkeleton stats={4} variant="dashboard" />;
    }

    if (isError || !data) {
        return (
            <PageContainer>
                <ErrorState
                    title="We couldn't load your dashboard"
                    description="Your workspace overview is temporarily unavailable. Please try again."
                    onRetry={() => refetch()}
                />
            </PageContainer>
        );
    }

    const firstName = (localStorage.getItem("name") || "").split(" ")[0];
    const websiteHref = data.websiteUrl
        ? /^https?:\/\//i.test(data.websiteUrl)
            ? data.websiteUrl
            : `https://${data.websiteUrl}`
        : null;

    return (
        <PageContainer>
            <div>
                <p className="mb-3 text-[13px] text-muted-foreground">
                    {greeting()}
                    {firstName ? `, ${firstName}` : ""} — here's what's
                    happening across your workspace.
                </p>
                <PageHeader
                    media={
                        <OrganizationAvatar
                            organization={{
                                name: data.title,
                                logoUrl: data.logoUrl,
                            }}
                            color={getColor(data.slug)}
                            className="size-11 rounded-lg text-sm"
                        />
                    }
                    title={data.title}
                    description={
                        data.description ? (
                            <span className="line-clamp-1">
                                {data.description}
                            </span>
                        ) : undefined
                    }
                    details={
                        <>
                            <MetaItem icon={AtSign}>{data.slug}</MetaItem>
                            {websiteHref && (
                                <a
                                    href={websiteHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-w-0 items-center gap-1.5 transition-colors hover:text-foreground"
                                >
                                    <Globe className="size-3.5 shrink-0" />
                                    <span className="truncate">
                                        {data.websiteUrl}
                                    </span>
                                </a>
                            )}
                        </>
                    }
                />
            </div>

            <StatsCards
                totalProjectsCount={data.totalProjectsCount}
                activeProjectsCount={data.activeProjectsCount}
                completedProjectsCount={data.completedProjectsCount}
                totalMembersCount={data.totalMembersCount}
            />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-5 xl:gap-6">
                <div className="xl:col-span-3">
                    <ProjectProgressList
                        projects={data.projects}
                        viewAllHref={
                            hasPermission(PERMISSIONS.PROJECTS.LIST)
                                ? `/${data.slug}/projects`
                                : undefined
                        }
                    />
                </div>
                <AiSummary
                    data={data}
                    summary={summaryMutation.data}
                    isPending={summaryMutation.isPending}
                    onGenerate={() => summaryMutation.mutate()}
                    title="AI Workspace Insights"
                    subject="workspace"
                    className="self-start xl:col-span-2"
                />
            </div>

            <RecentWorkItems workItems={data.recentWorkItems} />
        </PageContainer>
    );
};

export default Dashboard;
