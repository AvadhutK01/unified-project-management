export interface Project {
    id: string;
    name: string;
    status: "notstarted" | "started" | "completed" | "on_hold";
    manager: string;
    startDate: string;
    endDate: string;
    logo?: string;
}
