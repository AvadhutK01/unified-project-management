import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// type BadgeVariant =
//     | "default"
//     | "secondary"
//     | "outline"
//     | "success"
//     | "warning"
//     | "info"
//     | "destructive";

interface OrganizationCardProps {
    id: string;
    name: string;
    initials: string;
    color: string;
    role: string;
    memberCount: number;
    lastActive: string;
    isSelected: boolean;
    onClick: () => void;
}

// const ROLE_VARIANT: Record<string, BadgeVariant> = {
//     Owner: "default",
//     Admin: "warning",
//     Member: "secondary",
// };

export function OrganizationCard({
    name,
    initials,
    color,
    role,
    memberCount,
    lastActive,
    isSelected,
    onClick,
}: OrganizationCardProps) {
    return (
        <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick()}
            className={cn(
                "relative flex flex-col gap-4 p-5 rounded-xl border-2 bg-card cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[170px]",
                isSelected
                    ? "border-primary shadow-md shadow-primary/10"
                    : "border-border hover:border-primary/40",
            )}
        >
            {/* Selected checkmark */}
            {isSelected && (
                <div className="absolute top-3 right-3 size-5 rounded-full bg-primary flex items-center justify-center">
                    <svg
                        className="size-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
            )}

            {/* Avatar + Info */}
            <div className="flex items-center gap-3">
                <div
                    className="size-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0"
                    style={{ backgroundColor: color }}
                >
                    {initials}
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="font-semibold text-foreground text-sm truncate">
                        {name}
                    </span>
                    <Badge className="w-fit text-xs">{role}</Badge>
                </div>
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                <div className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    <span>{memberCount} Members</span>
                </div>
                <span>{lastActive}</span>
            </div>
        </div>
    );
}
