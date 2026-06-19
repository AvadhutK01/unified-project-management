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
