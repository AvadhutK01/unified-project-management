import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganizationsQuery } from "../hooks/useOrganizations";
import Spinner from "@/components/common/Spinner";
import { useOrganizationStore } from "@/store/organization.store";

const OrganizationLoader = () => {
    const navigate = useNavigate();
    const { data: response, isLoading, isError } = useOrganizationsQuery();
    const { setActiveOrganization } = useOrganizationStore();

    const data = response?.data;

    useEffect(() => {
        if (isLoading || !data) return;

        const organizationCount = data.organizations?.length || 0;

        if (organizationCount === 0) {
            navigate("/org-setup", { replace: true });
        } else if (organizationCount === 1) {
            const organization = data.organizations?.[0];
            setActiveOrganization(organization);
            navigate(`/${organization?.slug}/dashboard`, { replace: true });
        } else {
            navigate("/org-setup/select", { replace: true });
        }
    }, [data, isLoading, navigate, setActiveOrganization]);

    if (isError) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">
                        Failed to load organizations
                    </p>
                    <button
                        onClick={() => navigate("/", { replace: true })}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    // Show loading spinner while fetching
    return (
        <div className="flex h-screen items-center justify-center">
            <Spinner />
        </div>
    );
};

export default OrganizationLoader;
