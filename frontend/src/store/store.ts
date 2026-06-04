import { create } from "zustand";

interface Store {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
}

export const store = create<Store>((set) => ({
    sidebarOpen: false,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
