import { FileText, History, MessageSquare, Paperclip } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

function Count({ value }: { value: number }) {
    if (value <= 0) return null;
    return (
        <span className="tabular rounded-full bg-foreground/[0.07] px-1.5 py-px text-[11px] font-medium text-muted-foreground dark:bg-foreground/10">
            {value}
        </span>
    );
}

/** Overview / Comments / Attachments / Activity tab bar for detail pages. */
export function DetailTabsList({
    commentCount,
    attachmentCount,
}: {
    commentCount: number;
    attachmentCount: number;
}) {
    return (
        <TabsList variant="line">
            <TabsTrigger value="overview">
                <FileText />
                Overview
            </TabsTrigger>
            <TabsTrigger value="comments">
                <MessageSquare />
                Comments
                <Count value={commentCount} />
            </TabsTrigger>
            <TabsTrigger value="attachments">
                <Paperclip />
                Attachments
                <Count value={attachmentCount} />
            </TabsTrigger>
            <TabsTrigger value="activities">
                <History />
                Activity
            </TabsTrigger>
        </TabsList>
    );
}
