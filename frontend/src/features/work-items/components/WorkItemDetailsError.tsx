import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    workItemError,
}: WorkItemDetailsErrorProps) => {
    return (
        <div className="p-6 max-w-2xl mx-auto mt-12 text-center bg-card/60 backdrop-blur-md rounded-2xl border border-destructive/20 shadow-lg">
            <AlertCircle className="size-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-bold text-foreground">
                Failed to Load Work Item
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
                {workItemError instanceof Error
                    ? workItemError.message
                    : "The requested work item details could not be loaded."}
            </p>
            <div className="mt-6">
                <Button asChild variant="outline">
                    <Link
                        to={`/${slug}/projects/${projectId}/phases/${phaseId}/sprints/${sprintId}/work-items`}
                    >
                        <ArrowLeft className="mr-2 size-4" />
                        Back to Work Items
                    </Link>
                </Button>
            </div>
        </div>
    );
};

export default WorkItemDetailsError;
