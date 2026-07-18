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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useStore } from "@/store/store";
import { useOrganizationStore } from "@/store/organization.store";
import { usePermission } from "@/features/rbac/hooks/usePermission";
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
    const { hasPermission, isOrgOwner } = usePermission();

    const { activeOrganization } = useOrganizationStore();

    const [activeItem, setActiveItem] = useState("Dashboard");
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

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
            icon: ShieldCheck,
            label: "Roles",
            path: `/${activeOrganization?.slug}/roles`,
            permission: "roles_list",
        },
        {
            icon: Users,
            label: "Members",
            permission: "members_list",
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
        },
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
            if (hasSubItems && sidebarOpen) {
                e.preventDefault();
                toggleExpanded(item.label);
            } else if ("path" in item) {
                setActiveItem(item.label);
                navigate((item as unknown as MenuItemWithPath).path);
            }
        };

        return (
            <div key={item.label} className="space-y-0.5">
                <button
                    onClick={handleClick}
                    className={cn(
                        "w-full flex items-center rounded-lg px-3 py-2 transition-colors cursor-pointer",
                        sidebarOpen ? "justify-between" : "justify-center",
                        isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-primary/5",
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center",
                            sidebarOpen ? "gap-3" : "gap-0",
                        )}
                    >
                        <Icon size={20} />

                        {sidebarOpen && (
                            <span className="font-medium">{item.label}</span>
                        )}
                    </div>

                    {sidebarOpen && hasSubItems && (
                        <ChevronRight
                            className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isExpanded ? "rotate-90" : "",
                            )}
                        />
                    )}
                </button>

                {sidebarOpen && hasSubItems && isExpanded && (
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
        <div
            className={cn(
                "relative h-full flex flex-col border-r dark:border-gray-700 bg-background transition-[width] duration-300 ease-in-out will-change-[width]",
                sidebarOpen ? "w-64" : "w-16",
            )}
        >
            {/* Top: Org Switcher */}
            <div
                className={cn(
                    "flex items-center px-3 pt-3 pb-2 shrink-0",
                    sidebarOpen ? "gap-2" : "justify-center",
                )}
            >
                <div className="flex-1 min-w-0">
                    <OrgSwitcher collapsed={!sidebarOpen} />
                </div>

                <Button
                    onClick={() => toggleSidebar()}
                    className="absolute top-3.5 -right-3.5 z-10 border border-gray-200 dark:border-gray-600 bg-white dark:bg-black flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 transition"
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
    );
};

export default Sidebar;
