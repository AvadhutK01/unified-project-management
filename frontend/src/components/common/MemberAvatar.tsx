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
    userId?: string;
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
    userId,
}: MemberAvatarProps) => {
    const initials = getInitials(name);
    const bgColor = getColor(name);

    const presenceMap = usePresenceStore((s) => s.presenceMap);
    const effectiveId = memberId || userId;
    const realTimePresence = effectiveId ? presenceMap[effectiveId] : undefined;

    const statusLower = (status || "").toLowerCase();
    let statusColor = "#94a3b8";
    let statusLabel = "Offline";

    if (realTimePresence === "onleave" || realTimePresence === "on_leave") {
        statusColor = "#f59e0b";
        statusLabel = "On Leave";
    } else if (realTimePresence === "away") {
        statusColor = "#8b5cf6";
        statusLabel = "Away";
    } else if (realTimePresence === "active" || realTimePresence === "online") {
        statusColor = "#10b981";
        statusLabel = "Online";
    } else if (
        statusLower === "on leave" ||
        statusLower === "onleave" ||
        statusLower === "on_leave"
    ) {
        statusColor = "#f59e0b";
        statusLabel = "On Leave";
    } else if (statusLower === "pending") {
        statusColor = "#d97706";
        statusLabel = "Pending";
    } else {
        statusColor = "#94a3b8";
        statusLabel = "Offline";
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
