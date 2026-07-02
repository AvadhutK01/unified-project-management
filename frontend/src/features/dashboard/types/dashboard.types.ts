export interface DashboardProject {
    projectName: string;
    completionPercent: number;
}

export interface DashboardWorkItem {
    id: string;
    title: string;
    type: string;
    status: string;
    assignedTo: string | null;
    assignedToName: string | null;
    createdAt: string;
}

export interface DashboardData {
    title: string;
    slug: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    description: string;
    totalMembersCount: number;
    totalProjectsCount: number;
    completedProjectsCount: number;
    activeProjectsCount: number;
    projects: DashboardProject[];
    recentWorkItems: DashboardWorkItem[];
}

export interface DashboardResponse {
    status: string;
    data: DashboardData;
}
