import { create } from "zustand";
import type { Notification } from "@/features/notifications/types/notification.types";

interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
    panelOpen: boolean;
    setInitial: (notifications: Notification[]) => void;
    addNotification: (notification: Notification) => void;
    markRead: (id: string) => void;
    markAllRead: () => void;
    togglePanel: () => void;
    setPanelOpen: (open: boolean) => void;
    reset: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    unreadCount: 0,
    panelOpen: false,

    setInitial: (notifications) =>
        set({
            notifications,
            unreadCount: notifications.filter((n) => !n.isRead).length,
        }),

    addNotification: (notification) =>
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
        })),

    markRead: (id) =>
        set((state) => {
            const target = state.notifications.find((n) => n.id === id);
            if (!target || target.isRead) return state;
            return {
                notifications: state.notifications.map((n) =>
                    n.id === id ? { ...n, isRead: true } : n,
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            };
        }),

    markAllRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({
                ...n,
                isRead: true,
            })),
            unreadCount: 0,
        })),

    togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
    setPanelOpen: (open) => set({ panelOpen: open }),

    reset: () => set({ notifications: [], unreadCount: 0, panelOpen: false }),
}));
