import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { getColor, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MemberAvatarProps {
    name: string;
    status?: string;
    size?: "default" | "sm" | "lg";
    className?: string;
}

/**
 * Reusable avatar component for organization/project members.
 * Displays initials with a consistent background color and a status indicator dot.
 */
export const MemberAvatar = ({
    name,
    status = "active",
    size = "default",
    className,
}: MemberAvatarProps) => {
    const initials = getInitials(name);
    const bgColor = getColor(name);

    const statusLower = status.toLowerCase();
    let statusColor = "#a1a1aa";

    if (statusLower === "active") {
        statusColor = "#10b981";
    } else if (statusLower === "on leave" || statusLower === "onleave") {
        statusColor = "#f59e0b";
    } else if (statusLower === "pending") {
        statusColor = "#d97706";
    }

    return (
        <Avatar
            size={size}
            className={cn("shadow-inner shrink-0 select-none", className)}
            style={{ backgroundColor: bgColor }}
        >
            <AvatarFallback className="font-bold text-white bg-transparent">
                {initials}
            </AvatarFallback>
            <AvatarBadge
                style={{ backgroundColor: statusColor }}
                className="ring-2 ring-background border-none"
            />
        </Avatar>
    );
};
