import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Menu,
    Sparkles,
    UserRound,
    Settings,
    LogOut,
    Palmtree,
    SunMoon,
    LayoutDashboard,
    FolderKanban,
    Users,
    ShieldCheck,
    BarChart3,
    Building2,
    CreditCard,
} from "lucide-react";
import { useOrganizationStore } from "@/store/organization.store";
import { Switch } from "@/components/ui/switch";
import { useToggleLeaveMutation } from "@/features/members/hooks/useMembers";
import { useStore } from "@/store/store";
import NotificationBell from "./NotificationBell";
import NotificationPanel from "./NotificationPanel";
import { useNotificationStore } from "@/store/notification.store";
import { useSubscriptionQuery } from "@/features/subscriptions/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getColor, getInitials } from "@/lib/utils";
import { ThemeRadioItems, ThemeToggle } from "./ThemeToggle";
import { BrandMark } from "./BrandLogo";

import { MemberAvatar } from "@/components/common/MemberAvatar";
import { useSocket } from "@/hooks/useSocket";
import { usePresenceStore } from "@/features/presence/store/presence.store";

interface User {
    name: string;
    email: string;
}

/** Top-level section of the current route, for the header context label. */
const SECTIONS: Record<
    string,
    { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
    dashboard: { label: "Dashboard", icon: LayoutDashboard },
    projects: { label: "Projects", icon: FolderKanban },
    members: { label: "Members", icon: Users },
    roles: { label: "Roles", icon: ShieldCheck },
    reports: { label: "Reports", icon: BarChart3 },
    organization: { label: "Organization", icon: Building2 },
    billing: { label: "Billing", icon: CreditCard },
};

const Header = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const socket = useSocket();
    const setPresence = usePresenceStore((s) => s.setPresence);
    const { activeOrganization, clearActiveOrganization } =
        useOrganizationStore();
    const { data: subscription } = useSubscriptionQuery();
    const isPremium = subscription?.isPremium ?? false;
    const getUserIdFromToken = (): string => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return "";
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.id || payload.userId || payload.sub || "";
        } catch {
            return "";
        }
    };

    const currentUserId =
        typeof window !== "undefined"
            ? localStorage.getItem("userId") || getUserIdFromToken()
            : "";

    const [user, setUser] = useState<User>({
        name: "",
        email: "",
    });
    const { isOrgOwner, memberStatus, setMemberStatus } = useStore();
    const toggleMobileSidebar = useStore((s) => s.toggleMobileSidebar);
    const [isOnLeave, setIsOnLeave] = useState(
        () => memberStatus === "onleave",
    );
    const toggleLeaveMutation = useToggleLeaveMutation();

    useEffect(() => {
        setIsOnLeave(memberStatus === "onleave");
    }, [memberStatus]);
    const panelOpen = useNotificationStore((s) => s.panelOpen);
    const setPanelOpen = useNotificationStore((s) => s.setPanelOpen);
    const resetNotifications = useNotificationStore((s) => s.reset);

    useEffect(() => {
        const storedUser = {
            name: localStorage.getItem("name")!,
            email: localStorage.getItem("email")!,
        };
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    // Close the notification panel on outside click / Escape.
    useEffect(() => {
        if (!panelOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const bellContainer =
                target instanceof HTMLElement
                    ? target.closest("[data-notification-bell]")
                    : null;
            if (!bellContainer) setPanelOpen(false);
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setPanelOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKey);
        };
    }, [panelOpen, setPanelOpen]);

    const handleToggleLeave = (checked: boolean) => {
        setIsOnLeave(checked);
        setMemberStatus(checked ? "onleave" : "available");
        const targetStatus = checked ? "onleave" : "active";
        if (currentUserId) {
            setPresence(currentUserId, targetStatus);
        }
        if (socket) {
            socket.emit("user:status_change", { status: targetStatus });
        }
        toggleLeaveMutation.mutate();
    };

    const handleLogout = async () => {
        resetNotifications();
        clearActiveOrganization();
        localStorage.clear();
        navigate("/login");
    };

    const displayName = user.name || "Your account";
    const initials = user.name ? getInitials(user.name) : "?";
    const avatarColor = getColor(user.name || user.email || "");

    const sectionKey = pathname.split("/")[2] ?? "";
    const section = SECTIONS[sectionKey];
    const SectionIcon = section?.icon;

    return (
        <header className="relative z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-3 sm:px-5">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleMobileSidebar()}
                className="md:hidden"
                aria-label="Open navigation"
            >
                <Menu className="size-5" />
            </Button>

            {/* Context */}
            <div className="flex min-w-0 items-center gap-2">
                <BrandMark className="size-6 rounded-md md:hidden" />
                <span className="truncate text-sm font-semibold text-foreground md:hidden">
                    {activeOrganization?.name ?? "Unified"}
                </span>
                {section && SectionIcon && (
                    <span className="hidden items-center gap-2 text-sm font-medium text-muted-foreground md:inline-flex">
                        <SectionIcon className="size-4" />
                        {section.label}
                    </span>
                )}
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
                {!isPremium && isOrgOwner && activeOrganization && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            navigate(`/${activeOrganization.slug}/billing`)
                        }
                        className="mr-1 border-primary/25 text-primary hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                        aria-label="Upgrade plan"
                    >
                        <Sparkles className="size-3.5" />
                        <span className="hidden sm:inline">Upgrade</span>
                    </Button>
                )}

                <div className="hidden sm:block">
                    <ThemeToggle />
                </div>

                <div className="relative" data-notification-bell>
                    <NotificationBell />
                    <NotificationPanel />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="ml-1 flex items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                            aria-label="Open account menu"
                        >
                            <MemberAvatar
                                name={user.name || "User"}
                                userId={currentUserId || undefined}
                                status={isOnLeave ? "onleave" : "active"}
                            />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-64">
                        <div className="flex items-center gap-3 px-2 py-2">
                            <span
                                className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                                style={{ backgroundColor: avatarColor }}
                            >
                                {initials}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {displayName}
                                </p>
                                {user.email && (
                                    <p className="truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {!isOrgOwner && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        handleToggleLeave(!isOnLeave);
                                    }}
                                    className="gap-2.5"
                                    aria-label={
                                        isOnLeave
                                            ? "Mark as available"
                                            : "Mark as on leave"
                                    }
                                >
                                    <Palmtree />
                                    <span className="flex-1">
                                        <span className="block">On leave</span>
                                        <span className="block text-xs text-muted-foreground">
                                            {isOnLeave
                                                ? "You are marked as on leave"
                                                : "You are available"}
                                        </span>
                                    </span>
                                    <Switch
                                        checked={isOnLeave}
                                        tabIndex={-1}
                                        aria-hidden="true"
                                        className="pointer-events-none data-[state=checked]:bg-warning"
                                    />
                                </DropdownMenuItem>
                            </>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onSelect={() => navigate("/profile")}
                            >
                                <UserRound />
                                View profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => navigate("/settings")}
                            >
                                <Settings />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <SunMoon />
                                    Theme
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <ThemeRadioItems />
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={handleLogout}
                        >
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default Header;
