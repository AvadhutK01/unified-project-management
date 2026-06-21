import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SprintView = "list" | "kanban";

interface SprintViewStore {
    view: SprintView;
    setView: (view: SprintView) => void;
}

export const useSprintViewStore = create<SprintViewStore>()(
    persist(
        (set) => ({
            view: "kanban",
            setView: (view) => set({ view }),
        }),
        {
            name: "sprint-view",
        },
    ),
);
