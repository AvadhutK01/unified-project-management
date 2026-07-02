export interface ProjectOverviewItem {
    id: string;
    title: string;
    status: "notstarted" | "started" | "completed" | "on_hold";
    startDate: string;
    endDate: string;
    createdAt: string;
    phaseCount: number;
    memberCount: number;
}

export interface ProjectOverviewResponse {
    status: string;
    data: {
        data: ProjectOverviewItem[];
    };
}

export interface SprintPerformanceItem {
    id: string;
    title: string;
    status: "new" | "active" | "closed" | "removed" | "onhold";
    startDate: string;
    endDate: string;
    createdAt: string;
    projectName: string;
    phaseName: string;
    totalWorkitems: number;
    statusCounts: {
        new: number;
        active: number;
        resolved: number;
        closed: number;
        removed: number;
        onhold: number;
    };
}

export interface SprintPerformanceResponse {
    status: string;
    data: {
        data: SprintPerformanceItem[];
    };
}

export interface PhaseOverviewItem {
    id: string;
    projectId: string;
    projectName: string;
    name: string;
    status: "notstarted" | "started" | "on_hold" | "completed";
    type: string;
    startDate: string;
    endDate: string;
    sprintCount: number;
    createdAt: string;
}

export interface PhaseOverviewResponse {
    status: string;
    data: {
        data: PhaseOverviewItem[];
    };
}

export interface MemberActivityItem {
    memberName: string;
    projectName: string;
    phaseName: string;
    sprintName: string;
    totalWorkitems: number;
    statusCounts: {
        new: number;
        active: number;
        resolved: number;
        closed: number;
        removed: number;
        onhold: number;
    };
    totalWorkedTime: number;
}

export interface MemberActivityResponse {
    status: string;
    data: {
        data: MemberActivityItem[];
    };
}
