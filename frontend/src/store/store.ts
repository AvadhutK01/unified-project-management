import { create } from "zustand";
import { api } from "@/lib/axios";

export interface PermissionItem {
    codename: string;
}

interface Store {
    sidebarOpen: boolean;
    toggleSidebar: () => void;

    mobileSidebarOpen: boolean;
    toggleMobileSidebar: () => void;
    setMobileSidebarOpen: (open: boolean) => void;

    permissions: string[];
    isOrgOwner: boolean;
    memberStatus: string;
    permissionsLoaded: boolean;
    permissionsError: string | null;
    setPermissions: (
        permissions: PermissionItem[],
        isOrgOwner: boolean,
    ) => void;
    clearPermissions: () => void;
    initializePermissions: (orgId: string) => Promise<void>;
    setMemberStatus: (status: string) => void;
}

export const useStore = create<Store>((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    mobileSidebarOpen: false,
    toggleMobileSidebar: () =>
        set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
    setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

    permissions: [],
    isOrgOwner: false,
    memberStatus: "",
    permissionsLoaded: false,
    permissionsError: null,
    setPermissions: (permissions, isOrgOwner) =>
        set({
            permissions: permissions.map((p) => p.codename),
            isOrgOwner,
            permissionsLoaded: true,
            permissionsError: null,
        }),
    clearPermissions: () =>
        set({
            permissions: [],
            isOrgOwner: false,
            memberStatus: "",
            permissionsLoaded: false,
            permissionsError: null,
        }),
    setMemberStatus: (status) => set({ memberStatus: status }),
    initializePermissions: async (_orgId: string) => {
        set({ permissionsLoaded: false, permissionsError: null });
        try {
            const res = await api.get("/organizations/members/me/role");
            const data = res?.data?.data ?? {};
            const permissions: PermissionItem[] = data.permissions ?? [];
            const isOrgOwner: boolean = data.is_org_owner ?? false;
            const memberStatus: string = data.status ?? "";
            set({
                permissions: permissions.map((p) => p.codename),
                isOrgOwner,
                memberStatus,
                permissionsLoaded: true,
                permissionsError: null,
            });
        } catch (error) {
            set({
                permissions: [],
                isOrgOwner: false,
                memberStatus: "",
                permissionsLoaded: true,
                permissionsError:
                    error instanceof Error
                        ? error.message
                        : "Failed to load permissions",
            });
        }
    },
}));
