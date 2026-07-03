import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganizationStore } from "@/store/organization.store";
import { Switch } from "@/components/ui/switch";
import { useToggleLeaveMutation } from "@/features/members/hooks/useMembers";
import { useStore } from "@/store/store";

interface User {
    name: string;
    email: string;
}

const Header = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState<User>({
        name: "",
        email: "",
    });
    const { isOrgOwner, memberStatus, setMemberStatus } = useStore();
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
        };

        if (showProfilePanel || showOrgDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showProfilePanel, showOrgDropdown]);

    const handleToggleLeave = (checked: boolean) => {
        setIsOnLeave(checked);
        setMemberStatus(checked ? "onleave" : "available");
        toggleLeaveMutation.mutate();
    };

    const { clearActiveOrganization } = useOrganizationStore();

    const handleLogout = async () => {
        clearActiveOrganization();
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="bg-card h-16 pr-4 pl-6 flex items-center justify-end shadow-sm border-b dark:border-gray-700">
            <div className="flex items-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center transition-colors cursor-pointer">
                    <Bell className="w-5 h-5 text-foreground" />
                </button>

                <div className="relative" ref={profileButtonRef}>
                    <button
                        onClick={() => setShowProfilePanel(!showProfilePanel)}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-primary/15 to-accent/15 text-primary text-xs font-bold hover:from-primary/25 hover:to-accent/25 transition-all duration-200 ring-1 ring-primary/10">
                            <span className="text-lg font-semibold text-pink-700">
                                {user.name
                                    ?.split(" ")
                                    .filter((word: string) => Boolean(word))
                                    .map((word: string) => word[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase() || "AK"}
                            </span>
                            {/* Status dot */}
                            <span
                                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${isOnLeave ? "bg-amber-400" : "bg-emerald-500"}`}
                            />
                        </span>
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
