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
    let statusColor: string;
    let statusLabel: string;

    if (realTimePresence === "onleave" || realTimePresence === "on_leave") {
        statusColor = "var(--warning)";
        statusLabel = "On Leave";
    } else if (realTimePresence === "away") {
        statusColor = "var(--violet)";
        statusLabel = "Away";
    } else if (realTimePresence === "active" || realTimePresence === "online") {
        statusColor = "var(--success)";
        statusLabel = "Online";
    } else if (
        statusLower === "on leave" ||
        statusLower === "onleave" ||
        statusLower === "on_leave"
    ) {
        statusColor = "var(--warning)";
        statusLabel = "On Leave";
    } else if (statusLower === "pending") {
        statusColor = "var(--warning)";
        statusLabel = "Pending";
    } else {
        statusColor = "var(--neutral)";
        statusLabel = "Offline";
    }

    return (
        <Avatar
            size={size}
            className={cn("shrink-0 select-none", className)}
            style={{ backgroundColor: bgColor }}
            title={name}
        >
            <AvatarFallback className="bg-transparent text-[11px] font-semibold text-white group-data-[size=lg]/avatar:text-sm group-data-[size=sm]/avatar:text-[10px]">
                {initials}
            </AvatarFallback>
            <AvatarBadge
                title={statusLabel}
                aria-label={statusLabel}
                role="img"
                style={{ backgroundColor: statusColor }}
                className="cursor-default border-none ring-2 ring-card"
            ></AvatarBadge>
        </Avatar>
    );
};
