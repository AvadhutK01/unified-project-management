import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";
import { useOrganizationStore } from "@/store/organization.store";

/** Joined / Invited switcher shown when the viewer can see both lists. */
export function MembersNav() {
    const { hasPermission } = usePermission();
    const slug = useOrganizationStore((s) => s.activeOrganization?.slug);
    const canJoined = hasPermission(PERMISSIONS.MEMBERS_JOINED.LIST);
    const canInvited = hasPermission(PERMISSIONS.MEMBERS_INVITED.LIST);
    if (!canJoined || !canInvited) return null;

    const tab = ({ isActive }: { isActive: boolean }) =>
        cn(
            "relative inline-flex h-10 items-center px-0.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            isActive
                ? "text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary"
                : "text-muted-foreground hover:text-foreground",
        );

    return (
        <nav
            aria-label="Members"
            className="flex items-center gap-5 border-b border-border"
        >
            <NavLink to={`/${slug}/members/joined`} className={tab}>
                Joined
            </NavLink>
            <NavLink to={`/${slug}/members/invited`} className={tab}>
                Invited
            </NavLink>
        </nav>
    );
}
