import { FolderKanban, Hash, Info, Layers } from "lucide-react";
import { DetailRow, SectionCard } from "@/components/common/SectionCard";
import type { SprintDetailsCardProps } from "../types/sprint.types";

const SprintDetailsCard = ({ sprint }: SprintDetailsCardProps) => {
    return (
        <SectionCard title="Details" icon={Info}>
            <div className="divide-y divide-border">
                <DetailRow label="Project" icon={FolderKanban}>
                    {sprint?.projectTitle || "—"}
                </DetailRow>
                <DetailRow label="Phase" icon={Layers}>
                    {sprint.phaseTitle || "—"}
                </DetailRow>
                <DetailRow label="Sequence" icon={Hash}>
                    {sprint.sequence ?? 0}
                </DetailRow>
            </div>
        </SectionCard>
    );
};

export default SprintDetailsCard;
