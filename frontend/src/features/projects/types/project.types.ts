export interface Project {
    id: string;
    name: string;
    status: "notstarted" | "started" | "completed" | "on_hold";
    manager: string;
    startDate: string;
    endDate: string;
    logo?: string;
}

export interface ProjectDashboardPhase {
    phaseName: string;
    completionPercent: number;
}

export interface ProjectDashboardTeamMember {
    id: string;
    name: string;
}

export interface ProjectDashboardData {
    title: string;
    description: string;
    logoUrl: string | null;
    clientName: string;
    status: "notstarted" | "started" | "completed" | "on_hold";
    startDate: string;
    endDate: string;
    totalMembersCount: number;
    teamMembers: ProjectDashboardTeamMember[];
    totalPhasesCount: number;
    completedPhasesCount: number;
    activePhasesCount: number;
    phases: ProjectDashboardPhase[];
}

export interface ProjectDashboardResponse {
    status: string;
    data: ProjectDashboardData;
}
