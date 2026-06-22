import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WorkItemView = "list" | "kanban";

interface WorkItemViewStore {
    view: WorkItemView;
    setView: (view: WorkItemView) => void;
}

export const useWorkItemViewStore = create<WorkItemViewStore>()(
    persist(
        (set) => ({
            view: "kanban",
            setView: (view) => set({ view }),
        }),
        { name: "workitem-view" },
    ),
);
