import type { SprintDetailsCardProps } from "../types/sprint.types";

const SprintDetailsCard = ({
    sprint,
    project,
    phaseId,
}: SprintDetailsCardProps) => {
    return (
        <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-3">
                Details
            </h3>

            <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">
                        Project
                    </span>
                    <span className="font-semibold text-foreground/90">
                        {project?.name || "Loading..."}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">
                        Phase
                    </span>
                    <span className="font-semibold text-foreground/90 bg-secondary/40 px-2 py-0.5 rounded text-[10px] truncate max-w-[150px]">
                        {phaseId}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">
                        Sequence
                    </span>
                    <span className="font-semibold text-foreground/90 bg-secondary/40 px-2 py-0.5 rounded text-[10px]">
                        {sprint.sequence ?? 0}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">
                        Sprint ID
                    </span>
                    <span
                        className="font-mono text-[10px] text-muted-foreground/80 truncate max-w-[140px]"
                        title={sprint.id}
                    >
                        {sprint.id}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SprintDetailsCard;
