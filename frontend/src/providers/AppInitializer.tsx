import { useEffect, useRef, type ReactNode } from "react";
import { useOrganizationStore } from "@/store/organization.store";
import { useStore } from "@/store/store";
import { Loading } from "@/components/common/Loading";

interface AppInitializerProps {
    children: ReactNode;
}

export const AppInitializer = ({ children }: AppInitializerProps) => {
    const activeOrganization = useOrganizationStore(
        (state) => state.activeOrganization,
    );
    const permissionsLoaded = useStore((s) => s.permissionsLoaded);
    const permissionsError = useStore((s) => s.permissionsError);
    const initializePermissions = useStore((s) => s.initializePermissions);
    const clearPermissions = useStore((s) => s.clearPermissions);
    const setPermissions = useStore((s) => s.setPermissions);

    const initializedOrgRef = useRef<string | null>(null);

    useEffect(() => {
        const orgId = activeOrganization?.id ?? null;

        if (initializedOrgRef.current === orgId && permissionsLoaded) {
            return;
        }

        initializedOrgRef.current = orgId;

        if (orgId) {
            initializePermissions(orgId);
        } else {
            setPermissions([], false);
        }
    }, [
        activeOrganization?.id,
        initializePermissions,
        setPermissions,
        permissionsLoaded,
    ]);

    useEffect(() => {
        if (!activeOrganization) {
            initializedOrgRef.current = null;
        }
    }, [activeOrganization]);

    if (!permissionsLoaded) {
        return <Loading />;
    }

    if (permissionsError) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <p className="text-sm text-muted-foreground">
                    Failed to load permissions. Please try again.
                </p>
                <button
                    type="button"
                    onClick={() => {
                        clearPermissions();
                        initializedOrgRef.current = null;
                    }}
                    className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return <>{children}</>;
};
