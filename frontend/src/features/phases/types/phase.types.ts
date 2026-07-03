export interface PhaseDashboardSprint {
    id?: string;
    sprintName: string;
    completionPercent: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    sequence?: number;
}

export interface PhaseDashboardData {
    title: string;
    description: string;
    status: "notstarted" | "started" | "completed" | "on_hold";
    startDate: string;
    endDate: string;
    type: string;
    totalSprintsCount: number;
    completedSprintsCount: number;
    activeSprintsCount: number;
    sprints: PhaseDashboardSprint[];
}

export interface PhaseDashboardResponse {
    status: string;
    data: PhaseDashboardData;
}

export interface CreatePhasePayload {
    projectId: string;
    name: string;
    description: string;
    type: string;
    startDate: string;
    endDate: string;
    status: string;
}

export interface UpdatePhasePayload {
    name: string;
    description: string;
    type: string;
    startDate: string;
    endDate: string;
    status: string;
}
