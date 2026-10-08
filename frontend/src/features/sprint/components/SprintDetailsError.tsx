import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/EmptyState";
import { PageContainer } from "@/components/common/PageHeader";
import type { SprintDetailsErrorProps } from "../types/sprint.types";

const SprintDetailsError = ({
    slug,
    projectId,
    phaseId,
}: SprintDetailsErrorProps) => {
    return (
        <PageContainer>
            <ErrorState
                title="We couldn't load this sprint"
                description="It may have been removed, or there was a problem reaching the server."
                action={
                    <Button asChild variant="outline" size="sm">
                        <Link
                            to={`/${slug}/projects/${projectId}/phases/${phaseId}/sprints`}
                        >
                            <ArrowLeft />
                            Back to sprints
                        </Link>
                    </Button>
                }
            />
        </PageContainer>
    );
};

export default SprintDetailsError;
