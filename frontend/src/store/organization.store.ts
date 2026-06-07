import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Organization {
    id: string;
    name: string;
    description?: string;
    slug: string;
}

interface OrgStore {
    activeOrganization: Organization | null;
    setActiveOrganization: (organization: Organization | null) => void;
    clearActiveOrganization: () => void;
}

export const useOrganizationStore = create<OrgStore>()(
    persist(
        (set) => ({
            activeOrganization: null,
            setActiveOrganization: (organization) =>
                set({ activeOrganization: organization }),
            clearActiveOrganization: () => set({ activeOrganization: null }),
        }),
        {
            name: "organization-storage",
        },
    ),
);
