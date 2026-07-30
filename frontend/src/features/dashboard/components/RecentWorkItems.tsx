import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Clock, ArrowRight } from "lucide-react";
import { getColor, getInitials, formatDate } from "@/lib/utils";
import type { DashboardWorkItem } from "../types/dashboard.types";

interface Props {
    workItems: DashboardWorkItem[];
}

const RecentWorkItems = ({ workItems }: Props) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ListChecks size={18} className="text-muted-foreground" />
                    Recently Assigned Work Items
                </CardTitle>
                <CardAction>
                    <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                        View All
                        <ArrowRight size={12} />
                    </button>
                </CardAction>
            </CardHeader>
            <CardContent className="space-y-2">
                {workItems.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        No work items assigned yet
                    </p>
                ) : (
                    workItems.map((item) => {
                        const name =
                            item.assignedToName ||
                            item.assignedTo ||
                            "Unassigned";
                        const color = getColor(name);
                        return (
                            <div
                                key={item.id}
                                className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/30 p-3 transition-colors hover:bg-accent/60 hover:border-border"
                            >
                                <div
                                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                    style={{ backgroundColor: color }}
                                >
                                    {getInitials(name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">
                                        {item.title}
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {name}
                                        </span>
                                        <Badge
                                            variant={
                                                item.type === "bug"
                                                    ? "destructive"
                                                    : "secondary"
                                            }
                                            className="capitalize"
                                        >
                                            {item.type}
                                        </Badge>
                                        {item.status && (
                                            <Badge
                                                variant="outline"
                                                className="capitalize"
                                            >
                                                {item.status}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock size={12} />
                                    {item.createdAt
                                        ? formatDate(item.createdAt)
                                        : ""}
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
};

export default RecentWorkItems;
