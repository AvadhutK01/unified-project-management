import { create } from "zustand";

/** Presence states emitted by the realtime server. */
export type PresenceStatus =
    | "active"
    | "online"
    | "away"
    | "offline"
    | "onleave"
    | "on_leave";

interface PresenceState {
    presenceMap: Record<string, PresenceStatus>;
    setPresence: (memberId: string, status: PresenceStatus) => void;
    syncPresence: (map: Record<string, PresenceStatus>) => void;
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
