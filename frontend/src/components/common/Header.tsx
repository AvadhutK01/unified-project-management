import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganizationStore } from "@/store/organization.store";
import { Switch } from "@/components/ui/switch";
import { useToggleLeaveMutation } from "@/features/members/hooks/useMembers";
import { useStore } from "@/store/store";
import NotificationBell from "./NotificationBell";
import NotificationPanel from "./NotificationPanel";
import { useNotificationStore } from "@/store/notification.store";

import { Menu, Sparkles } from "lucide-react";
import { useSubscriptionQuery } from "@/features/subscriptions/hooks/useSubscription";

import { MemberAvatar } from "@/components/common/MemberAvatar";
import { useSocket } from "@/hooks/useSocket";
import { usePresenceStore } from "@/features/presence/store/presence.store";

interface User {
    name: string;
    email: string;
}

const Header = () => {
    const navigate = useNavigate();
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
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [showOrgDropdown, setShowOrgDropdown] = useState(false);
    const profilePanelRef = useRef<HTMLDivElement>(null);
    const profileButtonRef = useRef<HTMLDivElement>(null);
    const orgDropdownRef = useRef<HTMLDivElement>(null);
    const orgButtonRef = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showProfilePanel &&
                profilePanelRef.current &&
                profileButtonRef.current &&
                !profilePanelRef.current.contains(event.target as Node) &&
                !profileButtonRef.current.contains(event.target as Node)
            ) {
                setShowProfilePanel(false);
            }

            if (
                showOrgDropdown &&
                orgDropdownRef.current &&
                orgButtonRef.current &&
                !orgDropdownRef.current.contains(event.target as Node) &&
                !orgButtonRef.current.contains(event.target as Node)
            ) {
                setShowOrgDropdown(false);
            }

            if (panelOpen) {
                const target = event.target as Node;
                const bellContainer =
                    target instanceof HTMLElement
                        ? target.closest("[data-notification-bell]")
                        : null;
                if (!bellContainer) {
                    setPanelOpen(false);
                }
            }
        };

        if (showProfilePanel || showOrgDropdown || panelOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showProfilePanel, showOrgDropdown, panelOpen, setPanelOpen]);

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

    return (
        <div className="bg-card h-16 px-3 sm:pr-4 sm:pl-6 flex items-center justify-between gap-2 shadow-sm border-b dark:border-gray-700">
            <button
                onClick={() => toggleMobileSidebar()}
                className="flex md:hidden items-center justify-center h-9 w-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Toggle sidebar"
            >
                <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                {!isPremium && isOrgOwner && activeOrganization && (
                    <button
                        onClick={() =>
                            navigate(`/${activeOrganization.slug}/billing`)
                        }
                        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-sm transition-all cursor-pointer"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Upgrade Plan</span>
                    </button>
                )}

                <div className="relative" data-notification-bell>
                    <NotificationBell />
                    <NotificationPanel />
                </div>

                <div className="relative" ref={profileButtonRef}>
                    <button
                        onClick={() => setShowProfilePanel(!showProfilePanel)}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <MemberAvatar
                            name={user.name || "User"}
                            userId={currentUserId || undefined}
                            status={isOnLeave ? "onleave" : "active"}
                        />
                    </button>

                    {showProfilePanel && (
                        <div
                            ref={profilePanelRef}
                            className="absolute right-0 top-full mt-2 w-64 bg-card rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                        >
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-primary/15 to-accent/15 text-primary text-xs font-bold hover:from-primary/25 hover:to-accent/25 transition-all duration-200 ring-1 ring-primary/10">
                                        <span className="text-xl font-semibold text-pink-700">
                                            {user.name
                                                ?.split(" ")
                                                .filter((word: string) =>
                                                    Boolean(word),
                                                )
                                                .map((word: string) => word[0])
                                                .slice(0, 2)
                                                .join("")
                                                .toUpperCase() || "AK"}
                                        </span>
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">
                                            {user.name || "Atharv Karnekar"}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user.email ||
                                                "atharvkarnekar2003@gmail.com"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* On Leave toggle */}
                            {!isOrgOwner && (
                                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`h-2 w-2 rounded-full shrink-0 ${isOnLeave ? "bg-amber-400" : "bg-emerald-500"}`}
                                            />
                                            <div>
                                                <p className="text-xs font-medium text-gray-700 dark:text-gray-200 leading-none">
                                                    {isOnLeave
                                                        ? "On Leave"
                                                        : "Available"}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">
                                                    {isOnLeave
                                                        ? "You are marked as on leave"
                                                        : "You are active"}
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={isOnLeave}
                                            onCheckedChange={handleToggleLeave}
                                            className="data-[state=checked]:bg-amber-400"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="py-2">
                                <button
                                    className="w-full cursor-pointer px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
                                    onClick={() => {
                                        navigate("/profile");
                                        setShowProfilePanel(false);
                                    }}
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    <span>View Profile</span>
                                </button>

                                <button
                                    onClick={() => {
                                        navigate("/settings");
                                        setShowProfilePanel(false);
                                    }}
                                    className="w-full cursor-pointer px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    <span>Settings</span>
                                </button>
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full cursor-pointer px-4 py-2.5 text-left text-sm hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors flex items-center gap-3 rounded"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    <span>Log out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
