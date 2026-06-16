import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { usePermission } from "../hooks/usePermission";
import { useOrganizationStore } from "@/store/organization.store";

interface ProtectedRouteProps {
    permission: string;
    children: ReactNode;
    redirectTo?: string;
}

export const ProtectedRoute = ({
    permission,
    children,
    redirectTo,
}: ProtectedRouteProps) => {
    const { hasPermission } = usePermission();
    const { activeOrganization } = useOrganizationStore();

    if (!hasPermission(permission)) {
        const fallback = redirectTo ?? `/${activeOrganization?.slug}/dashboard`;
        return <Navigate to={fallback} replace />;
    }

    return <>{children}</>;
};
