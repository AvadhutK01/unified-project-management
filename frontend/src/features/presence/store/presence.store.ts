import { create } from "zustand";

interface PresenceState {
    presenceMap: Record<string, "active" | "away" | "offline">;
    setPresence: (
        memberId: string,
        status: "active" | "away" | "offline",
    ) => void;
    syncPresence: (map: Record<string, "active" | "away" | "offline">) => void;
    clearPresence: () => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
    presenceMap: {},
    setPresence: (memberId, status) =>
        set((state) => ({
            presenceMap: { ...state.presenceMap, [memberId]: status },
        })),
    syncPresence: (map) => set({ presenceMap: map }),
    clearPresence: () => set({ presenceMap: {} }),
}));
