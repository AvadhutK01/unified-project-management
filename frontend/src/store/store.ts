import { create } from "zustand";

interface Store {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
}

export const store = create<Store>((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
