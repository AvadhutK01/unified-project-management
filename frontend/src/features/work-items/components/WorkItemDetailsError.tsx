import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/EmptyState";
import { PageContainer } from "@/components/common/PageHeader";

interface WorkItemDetailsErrorProps {
    slug: string;
    projectId: string;
    phaseId: string;
    sprintId: string;
    workItemError: any;
}

const WorkItemDetailsError = ({
    slug,
    projectId,
    phaseId,
    sprintId,
}: WorkItemDetailsErrorProps) => {
    return (
        <PageContainer>
            <ErrorState
                title="We couldn't load this work item"
                description="It may have been removed, or there was a problem reaching the server."
                action={
                    <Button asChild variant="outline" size="sm">
                        <Link
                            to={`/${slug}/projects/${projectId}/phases/${phaseId}/sprints/${sprintId}/work-items`}
                        >
                            <ArrowLeft />
                            Back to work items
                        </Link>
                    </Button>
                }
            />
        </PageContainer>
    );
};

export default WorkItemDetailsError;
