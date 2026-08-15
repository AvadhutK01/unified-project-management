import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { getColor, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { usePresenceStore } from "@/features/presence/store/presence.store";

interface MemberAvatarProps {
    name: string;
    status?: string;
    size?: "default" | "sm" | "lg";
    className?: string;
    memberId?: string;
}

/**
 * Reusable avatar component for organization/project members.
 * Displays initials with a consistent background color and a status indicator dot.
 * The badge color reflects real-time presence for active members.
 */
export const MemberAvatar = ({
    name,
    status = "active",
    size = "default",
    className,
    memberId,
}: MemberAvatarProps) => {
    const initials = getInitials(name);
    const bgColor = getColor(name);

    const presenceMap = usePresenceStore((s) => s.presenceMap);
    const presence = memberId ? presenceMap[memberId] : undefined;

    const statusLower = status.toLowerCase();
    let statusColor = "#a1a1aa";
    let statusLabel = "Inactive";

    if (statusLower === "active") {
        if (presence === "away") {
            statusColor = "#8b5cf6";
            statusLabel = "Away";
        } else if (presence === "active") {
            statusColor = "#10b981";
            statusLabel = "Online";
        } else {
            statusColor = "#94a3b8";
            statusLabel = "Offline";
        }
    } else if (statusLower === "on leave" || statusLower === "onleave") {
        statusColor = "#f59e0b";
        statusLabel = "On Leave";
    } else if (statusLower === "pending") {
        statusColor = "#d97706";
        statusLabel = "Pending";
    } else if (statusLower === "inactive") {
        statusColor = "#a1a1aa";
        statusLabel = "Inactive";
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
                title={statusLabel}
                style={{ backgroundColor: statusColor }}
                className="ring-2 ring-background border-none cursor-default"
            ></AvatarBadge>
        </Avatar>
    );
};
