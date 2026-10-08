import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganizationsQuery } from "../hooks/useOrganizations";
import { useOrganizationStore } from "@/store/organization.store";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "../components/OnboardingShell";

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
            <OnboardingShell>
                <ErrorState
                    title="We couldn't load your organizations"
                    description="Please check your connection and try again."
                    action={
                        <Button
                            onClick={() => navigate("/", { replace: true })}
                        >
                            Go home
                        </Button>
                    }
                />
            </OnboardingShell>
        );
    }

    return <Loading />;
};

export default OrganizationLoader;
