import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SprintDetailsErrorProps } from "../types/sprint.types";

const SprintDetailsError = ({
    slug,
    projectId,
    phaseId,
    sprintError,
}: SprintDetailsErrorProps) => {
    return (
        <div className="p-6 max-w-2xl mx-auto mt-12 text-center bg-card/60 backdrop-blur-md rounded-2xl border border-destructive/20 shadow-lg">
            <AlertCircle className="size-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-bold text-foreground">
                Failed to Load Sprint
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
                {sprintError instanceof Error
                    ? sprintError.message
                    : "The requested sprint details could not be loaded."}
            </p>
            <div className="mt-6">
                <Button asChild variant="outline">
                    <Link
                        to={`/${slug}/projects/${projectId}/phases/${phaseId}/sprints`}
                    >
                        <ArrowLeft className="mr-2 size-4" />
                        Back to Sprints
                    </Link>
                </Button>
            </div>
        </div>
    );
};

export default SprintDetailsError;
