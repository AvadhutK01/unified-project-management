import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    Building2,
    Users,
    ShieldCheck,
    FolderKanbanIcon,
    FileText,
    CreditCard,
    Sparkles,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useStore } from "@/store/store";
import { useOrganizationStore } from "@/store/organization.store";
import { useSubscriptionQuery } from "@/features/subscriptions/hooks/useSubscription";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { isAtLeastPlan } from "@/features/subscriptions/utils/subscriptionHelpers";
import { OrgSwitcher } from "./OrgSwitcher";

interface SubMenuItem {
    label: string;
    path: string;
}

interface MenuItemBase {
    icon: React.ComponentType<{ size: number }>;
    label: string;
    permission?: string;
    ownerOnly?: boolean;
    badge?: string;
}

interface MenuItemWithPath extends MenuItemBase {
    path: string;
    subItems?: never;
}

interface MenuItemWithSubItems extends MenuItemBase {
    subItems: SubMenuItem[];
    path?: never;
}

type MenuItem = MenuItemWithPath | MenuItemWithSubItems;

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const sidebarOpen = useStore((s) => s.sidebarOpen);
    const toggleSidebar = useStore((s) => s.toggleSidebar);
    const mobileSidebarOpen = useStore((s) => s.mobileSidebarOpen);
    const setMobileSidebarOpen = useStore((s) => s.setMobileSidebarOpen);
    const { hasPermission, isOrgOwner } = usePermission();

    const { activeOrganization } = useOrganizationStore();
    const { data: subscription } = useSubscriptionQuery();
    const currentPlan = subscription?.plan ?? "free";
    const isBasicOrAbove = isAtLeastPlan(currentPlan, "basic");

    const contentExpanded = sidebarOpen || mobileSidebarOpen;

    const [activeItem, setActiveItem] = useState("Dashboard");
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const hasJoinedList = hasPermission("members_joined_list");
    const hasInvitedList = hasPermission("members_invited_list");

    const membersMenuItem = (() => {
        if (hasJoinedList && hasInvitedList) {
            return {
                icon: Users,
                label: "Members",
                subItems: [
                    {
                        label: "Joined",
                        path: `/${activeOrganization?.slug}/members/joined`,
                    },
                    {
                        label: "Invited",
                        path: `/${activeOrganization?.slug}/members/invited`,
                    },
                ],
            } as MenuItem;
        } else if (hasJoinedList) {
            return {
                icon: Users,
                label: "Members",
                path: `/${activeOrganization?.slug}/members/joined`,
            } as MenuItem;
        } else if (hasInvitedList) {
            return {
                icon: Users,
                label: "Members",
                path: `/${activeOrganization?.slug}/members/invited`,
            } as MenuItem;
        }
        return null;
    })();

    const menuItems: MenuItem[] = [
        {
            icon: LayoutDashboard,
            label: "Dashboard",
            path: `/${activeOrganization?.slug}/dashboard`,
        },
        {
            icon: Building2,
            label: "Organization Setup",
            path: `/${activeOrganization?.slug}/organization`,
            ownerOnly: true,
        },
        {
            icon: CreditCard,
            label: "Billing & Subscriptions",
            path: `/${activeOrganization?.slug}/billing`,
            ownerOnly: true,
        },
        {
            icon: ShieldCheck,
            label: "Roles",
            path: `/${activeOrganization?.slug}/roles`,
            permission: "roles_list",
        },
        ...(membersMenuItem ? [membersMenuItem] : []),
        {
            icon: FolderKanbanIcon,
            label: "Projects",
            path: `/${activeOrganization?.slug}/projects`,
            permission: "project_list",
        },
        {
            icon: FileText,
            label: "Reports",
            permission: "report_view",
            badge: !isBasicOrAbove ? "BASIC" : undefined,
            ...(isBasicOrAbove
                ? {
                      subItems: [
                          {
                              label: "Project Report",
                              path: `/${activeOrganization?.slug}/reports/project`,
                          },
                          {
                              label: "Phase Report",
                              path: `/${activeOrganization?.slug}/reports/phase`,
                          },
                          {
                              label: "Sprint Report",
                              path: `/${activeOrganization?.slug}/reports/sprint`,
                          },
                          {
                              label: "Member Activity Report",
                              path: `/${activeOrganization?.slug}/reports/member-activity`,
                          },
                      ],
                  }
                : {
                      path: isOrgOwner
                          ? `/${activeOrganization?.slug}/billing`
                          : `/${activeOrganization?.slug}/reports/project`,
                  }),
        },
    ];

    const visibleMenuItems = menuItems.filter((item) => {
        if (item.ownerOnly && !isOrgOwner) return false;
        if (item.permission && !hasPermission(item.permission)) return false;
        return true;
    });

    const toggleExpanded = (label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((item) => item !== label)
                : [...prev, label],
        );
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)");
        const handleChange = (e: MediaQueryListEvent) => {
            if (e.matches) setMobileSidebarOpen(false);
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [setMobileSidebarOpen]);

    useEffect(() => {
        for (const item of visibleMenuItems) {
            if ("subItems" in item) {
                const hasActiveSubItem =
                    (item as unknown as MenuItemWithSubItems).subItems?.some(
                        (sub: SubMenuItem) => pathname.includes(sub.path),
                    ) ?? false;
                if (hasActiveSubItem && !expandedItems.includes(item.label)) {
                    setExpandedItems((prev) => [...prev, item.label]);
                }
            }
            if (
                "path" in item &&
                pathname.includes((item as unknown as MenuItemWithPath).path)
            ) {
                setActiveItem(item.label);
            }
        }
    }, [pathname]);

    const renderMenuItem = (item: MenuItem) => {
        const Icon = item.icon;
        let isActive = activeItem === item.label;
        const isExpanded = expandedItems.includes(item.label);
        const hasSubItems =
            "subItems" in item &&
            ((item as MenuItemWithSubItems).subItems?.length ?? 0) > 0;

        if (hasSubItems && "subItems" in item) {
            const hasActiveSubItem =
                (item as MenuItemWithSubItems).subItems?.some((sub) =>
                    pathname.includes(sub.path),
                ) ?? false;
            isActive = isActive || hasActiveSubItem;
        }

        const handleClick = (e: React.MouseEvent) => {
            if (hasSubItems && contentExpanded) {
                e.preventDefault();
                toggleExpanded(item.label);
            } else if ("path" in item) {
                setActiveItem(item.label);
                navigate((item as unknown as MenuItemWithPath).path);
                setMobileSidebarOpen(false);
            }
        };

        return (
            <div key={item.label} className="space-y-0.5">
                <button
                    onClick={handleClick}
                    className={cn(
                        "w-full flex items-center rounded-lg px-3 py-2 transition-colors cursor-pointer",
                        contentExpanded ? "justify-between" : "justify-center",
                        isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-primary/5",
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center",
                            contentExpanded ? "gap-3" : "gap-0",
                        )}
                    >
                        <Icon size={20} />

                        {contentExpanded && (
                            <span className="font-medium flex items-center gap-2">
                                <span>{item.label}</span>
                                {item.badge && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                                        <Sparkles className="w-2.5 h-2.5 inline" />
                                        {item.badge}
                                    </span>
                                )}
                            </span>
                        )}
                    </div>

                    {contentExpanded && hasSubItems && (
                        <ChevronRight
                            className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isExpanded ? "rotate-90" : "",
                            )}
                        />
                    )}
                </button>

                {contentExpanded && hasSubItems && isExpanded && (
                    <div className="ml-6 space-y-0.5 border-l border-border pl-2">
                        {"subItems" in item &&
                            (item as MenuItemWithSubItems).subItems?.map(
                                (subItem: SubMenuItem) => {
                                    const isSubActive = pathname.includes(
                                        subItem.path,
                                    );
                                    return (
                                        <button
                                            key={subItem.label}
                                            onClick={() => {
                                                setActiveItem(item.label);
                                                navigate(subItem.path);
                                                setMobileSidebarOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center rounded-lg px-3 py-1.5 text-sm transition-colors cursor-pointer",
                                                isSubActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:bg-primary/5",
                                            )}
                                        >
                                            {subItem.label}
                                        </button>
                                    );
                                },
                            )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-60 bg-black/50 md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-70 h-full flex flex-col border-r dark:border-gray-700 bg-background transition-transform duration-300 ease-in-out md:relative md:z-auto md:transition-[width] md:will-change-[width]",
                    mobileSidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full md:translate-x-0",
                    "w-64",
                    sidebarOpen ? "md:w-64" : "md:w-16",
                )}
            >
                <div
                    className={cn(
                        "flex items-center px-3 pt-3 pb-2 shrink-0",
                        contentExpanded ? "gap-2" : "md:justify-center",
                    )}
                >
                    <div className="flex-1 min-w-0">
                        <OrgSwitcher collapsed={!contentExpanded} />
                    </div>

                    <Button
                        onClick={() => setMobileSidebarOpen(false)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 transition md:hidden"
                    >
                        <X className="h-4 w-4" />
                    </Button>

                    <Button
                        onClick={() => toggleSidebar()}
                        className="hidden md:flex absolute top-3.5 -right-3.5 z-10 border border-gray-200 dark:border-gray-600 bg-white dark:bg-black h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        <ChevronLeft
                            className={cn(
                                "h-4 w-4 transition-transform duration-300",
                                !sidebarOpen && "rotate-180",
                            )}
                        />
                    </Button>
                </div>

                <div className="px-2 flex-1 overflow-y-auto">
                    <nav className="space-y-1">
                        {visibleMenuItems.map(renderMenuItem)}
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
