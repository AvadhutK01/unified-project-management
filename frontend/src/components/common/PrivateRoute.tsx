import { useOrganizationStore } from "@/store/organization.store";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");
    const location = useLocation();
    const activeOrganization = useOrganizationStore(
        (state) => state.activeOrganization,
    );

    if (!token) {
        toast.dismiss();
        toast.error("Please login to continue");
        return <Navigate to="/login" replace />;
    }

    const allowedPaths = [
        "/organization-loader",
        "/org-setup",
        "/org-setup/create",
        "/org-setup/join",
        "/org-setup/select",
        "/org-setup/success",
    ];
    const isAllowedPath = allowedPaths.some(
        (path) =>
            location.pathname === path || location.pathname.startsWith(path),
    );

    if (!activeOrganization && !isAllowedPath) {
        return <Navigate to="/organization-loader" replace />;
    }

    return <>{children}</>;
};
