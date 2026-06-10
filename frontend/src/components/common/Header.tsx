import { Bell, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganizationsQuery } from "@/features/organization/hooks/useOrganizations";
import { useOrganizationStore } from "@/store/organization.store";
import type { Organization } from "@/features/organization/types/organization.types";

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
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [showOrgDropdown, setShowOrgDropdown] = useState(false);
    const profilePanelRef = useRef<HTMLDivElement>(null);
    const profileButtonRef = useRef<HTMLDivElement>(null);
    const orgDropdownRef = useRef<HTMLDivElement>(null);
    const orgButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
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

    const activeOrganization = useOrganizationStore(
        (state) => state.activeOrganization,
    );
    const { setActiveOrganization, clearActiveOrganization } =
        useOrganizationStore();

    const { data: organizationResponse } = useOrganizationsQuery();
    const organizations = organizationResponse?.data.organizations ?? [];

    const handleSelectOrganization = (organization: Organization) => {
        const isOrganizationChanged =
            organization.id !== activeOrganization?.id;

        setActiveOrganization(organization);
        setShowOrgDropdown(false);
        navigate(`/${organization.slug}/dashboard`);

        if (isOrganizationChanged) {
            window.location.reload();
        }
    };

    const handleLogout = async () => {
        clearActiveOrganization();
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="bg-card h-16 pr-4 pl-6 flex items-center justify-end shadow-sm border-b dark:border-gray-700">
            {/* Right side - Actions and Profile */}
            <div className="flex items-center gap-2">
                {/* Organization selector */}
                <div className="relative" ref={orgButtonRef}>
                    <button
                        type="button"
                        onClick={() => setShowOrgDropdown((value) => !value)}
                        className="inline-flex items-center gap-2 bg-card px-3 py-2 text-sm text-foreground cursor-pointer group"
                    >
                        <span className="truncate max-w-40 text-sm text-foreground group-hover:text-primary">
                            {activeOrganization?.name || "Select organization"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </button>
                    {showOrgDropdown && (
                        <div
                            ref={orgDropdownRef}
                            className="absolute right-0 top-full w-40 overflow-hidden rounded-md border border-border bg-card shadow-lg z-50"
                        >
                            <div className="max-h-72 overflow-y-auto">
                                {organizations.length === 0 ? (
                                    <div className="p-4 text-sm text-muted-foreground">
                                        No organizations found
                                    </div>
                                ) : (
                                    organizations.map((organization) => {
                                        const isActive =
                                            organization.id ===
                                            activeOrganization?.id;
                                        return (
                                            <button
                                                key={organization.id}
                                                type="button"
                                                onClick={() =>
                                                    handleSelectOrganization(
                                                        organization,
                                                    )
                                                }
                                                className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                                                    isActive
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-foreground hover:bg-muted/70"
                                                }`}
                                            >
                                                <div
                                                    className={`font-medium ${isActive ? "text-primary" : ""}`}
                                                >
                                                    {organization.name}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Notification button */}
                <button className="w-10 h-10 flex items-center justify-center transition-colors cursor-pointer">
                    <Bell className="w-5 h-5 text-foreground" />
                </button>

                {/* User Profile */}
                <div className="relative" ref={profileButtonRef}>
                    <button
                        onClick={() => setShowProfilePanel(!showProfilePanel)}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-primary/15 to-accent/15 text-primary text-xs font-bold hover:from-primary/25 hover:to-accent/25 transition-all duration-200 ring-1 ring-primary/10">
                            <span className="text-lg font-semibold text-pink-700">
                                {user.name
                                    ?.split(" ")
                                    .filter((word: string) => Boolean(word))
                                    .map((word: string) => word[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase() || "AK"}
                            </span>
                        </span>
                    </button>

                    {/* Profile Dropdown Panel */}
                    {showProfilePanel && (
                        <div
                            ref={profilePanelRef}
                            className="absolute right-0 top-full mt-2 w-64 bg-card rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                        >
                            {/* Profile Header */}
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

                            {/* Menu Options */}
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

                                {/* <button
                                    onClick={() => {
                                        router.push("/profile");
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
                                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span>Help & Support</span>
                                </button> */}
                            </div>

                            {/* Logout Button */}
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
