export interface GroupData {
    memberName: string;
    projectName: string;
    phaseName: string;
    sprintName: string;
    totalWorkitems: number;
    statusCounts: Record<string, number>;
    totalWorkedTime: number;
}
