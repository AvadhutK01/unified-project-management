import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    Building2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { store } from "@/store/store";
import { useOrganizationStore } from "@/store/organization.store";

interface SubMenuItem {
    label: string;
    path: string;
}

interface MenuItemBase {
    icon: React.ComponentType<{ size: number }>;
    label: string;
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

const isMenuItemWithPath = (item: MenuItem): item is MenuItemWithPath => {
    return "path" in item;
};

const isMenuItemWithSubItems = (
    item: MenuItem,
): item is MenuItemWithSubItems => {
    return "subItems" in item;
};

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const sidebarOpen = store((s) => s.sidebarOpen);
    const toggleSidebar = store((s) => s.toggleSidebar);

    const { activeOrganization } = useOrganizationStore();

    const [activeItem, setActiveItem] = useState("Dashboard");
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const menuItems = [
        {
            icon: LayoutDashboard,
            label: "Dashboard",
            path: `/${activeOrganization?.slug}/dashboard`,
        },
        {
            icon: Building2,
            label: "Organization",
            subItems: [
                {
                    label: "Organization Setup",
                    path: `/${activeOrganization?.slug}/organizations`,
                },
                { label: "Roles", path: `/${activeOrganization?.slug}/roles` },
            ],
        },
    ];

    // const secondMenuItems = [
    //     { icon: DollarSign, label: "Finance", path: `finance` },
    //     { icon: Calendar, label: "Calendar", path: `calendar` },
    //     { icon: MessageSquare, label: "Messages", path: `messages` },
    //     { icon: FileText, label: "Files", path: `files` },
    //     { icon: ChartColumn, label: "Reports", path: `reports` },
    // ];

    const toggleExpanded = (label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((item) => item !== label)
                : [...prev, label],
        );
    };

    useEffect(() => {
        const allItems = [
            ...menuItems,
            // ...secondMenuItems
        ];
        for (const item of allItems) {
            if (isMenuItemWithSubItems(item)) {
                const hasActiveSubItem = item.subItems.some(
                    (sub: SubMenuItem) => pathname.includes(sub.path),
                );
                if (hasActiveSubItem && !expandedItems.includes(item.label)) {
                    setExpandedItems((prev) => [...prev, item.label]);
                }
            }
            if (isMenuItemWithPath(item) && pathname.includes(item.path)) {
                setActiveItem(item.label);
            }
        }
    }, [pathname]);

    const renderMenuItem = (item: MenuItem) => {
        const Icon = item.icon;
        let isActive = activeItem === item.label;
        const isExpanded = expandedItems.includes(item.label);
        const hasSubItems =
            isMenuItemWithSubItems(item) && item.subItems.length > 0;

        // For parent items with sub-items, check if any sub-item is active
        if (hasSubItems && isMenuItemWithSubItems(item)) {
            const hasActiveSubItem = item.subItems.some((sub) =>
                pathname.includes(sub.path),
            );
            isActive = isActive || hasActiveSubItem;
        }

        const handleClick = (e: React.MouseEvent) => {
            if (hasSubItems && sidebarOpen) {
                e.preventDefault();
                toggleExpanded(item.label);
            } else if (isMenuItemWithPath(item)) {
                setActiveItem(item.label);
                navigate(item.path);
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
                        {isMenuItemWithSubItems(item) &&
                            item.subItems.map((subItem: SubMenuItem) => {
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
                            })}
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
            {/* Header */}
            <div className="flex h-14 items-center px-3 shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
                        A
                    </div>

                    {sidebarOpen && (
                        <span className="text-sm font-bold tracking-tight whitespace-nowrap">
                            AgencyOS
                        </span>
                    )}
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

            {/* Menu */}
            <div className="px-2 flex-1 overflow-y-auto">
                <nav className="space-y-1 mt-7">
                    {menuItems.map(renderMenuItem)}
                </nav>

                {/* <Separator className="bg-sidebar-border my-2" />

                <nav className="space-y-1">{secondMenuItems.map(renderMenuItem)}</nav> */}
            </div>
        </div>
    );
};

export default Sidebar;
