import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    Users,
    ShieldCheck,
    FolderKanban,
    CreditCard,
    Sparkles,
    X,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    FileBarChart2,
    Layers,
    Timer,
    Activity,
    BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "@/store/store";
import { useOrganizationStore } from "@/store/organization.store";
import { useSubscriptionQuery } from "@/features/subscriptions/hooks/useSubscription";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { isAtLeastPlan } from "@/features/subscriptions/utils/subscriptionHelpers";
import { OrgSwitcher } from "./OrgSwitcher";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrandMark } from "./BrandLogo";

type IconType = React.ComponentType<{ className?: string }>;

interface SubMenuItem {
    label: string;
    path: string;
}

interface MenuItemBase {
    icon: IconType;
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

interface MenuGroup {
    label: string;
    items: MenuItem[];
}

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

    /** Labels and text are visible (desktop expanded, or mobile drawer). */
    const contentExpanded = sidebarOpen || mobileSidebarOpen;

    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const slug = activeOrganization?.slug;
    const hasJoinedList = hasPermission("members_joined_list");
    const hasInvitedList = hasPermission("members_invited_list");

    const membersMenuItem: MenuItem | null = (() => {
        if (hasJoinedList && hasInvitedList) {
            return {
                icon: Users,
                label: "Members",
                subItems: [
                    { label: "Joined", path: `/${slug}/members/joined` },
                    { label: "Invited", path: `/${slug}/members/invited` },
                ],
            };
        } else if (hasJoinedList) {
            return {
                icon: Users,
                label: "Members",
                path: `/${slug}/members/joined`,
            };
        } else if (hasInvitedList) {
            return {
                icon: Users,
                label: "Members",
                path: `/${slug}/members/invited`,
            };
        }
        return null;
    })();

    // Reporting: when the plan includes reports, each report is a direct
    // link. Otherwise a single locked entry keeps the original behaviour
    // (owners are taken to billing, others to the report page gate).
    const reportItems: MenuItem[] = isBasicOrAbove
        ? [
              {
                  icon: FileBarChart2,
                  label: "Project Reports",
                  path: `/${slug}/reports/project`,
                  permission: "report_view",
              },
              {
                  icon: Layers,
                  label: "Phase Reports",
                  path: `/${slug}/reports/phase`,
                  permission: "report_view",
              },
              {
                  icon: Timer,
                  label: "Sprint Reports",
                  path: `/${slug}/reports/sprint`,
                  permission: "report_view",
              },
              {
                  icon: Activity,
                  label: "Member Activity",
                  path: `/${slug}/reports/member-activity`,
                  permission: "report_view",
              },
          ]
        : [
              {
                  icon: BarChart3,
                  label: "Reports",
                  permission: "report_view",
                  badge: "Basic",
                  path: isOrgOwner
                      ? `/${slug}/billing`
                      : `/${slug}/reports/project`,
              },
          ];

    const groups: MenuGroup[] = [
        {
            label: "Workspace",
            items: [
                {
                    icon: LayoutDashboard,
                    label: "Dashboard",
                    path: `/${slug}/dashboard`,
                },
                {
                    icon: FolderKanban,
                    label: "Projects",
                    path: `/${slug}/projects`,
                    permission: "project_list",
                },
            ],
        },
        {
            label: "Management",
            items: [
                ...(membersMenuItem ? [membersMenuItem] : []),
                {
                    icon: ShieldCheck,
                    label: "Roles",
                    path: `/${slug}/roles`,
                    permission: "roles_list",
                },
            ],
        },
        { label: "Reporting", items: reportItems },
        {
            label: "Organization",
            items: [
                {
                    icon: Building2,
                    label: "Organization",
                    path: `/${slug}/organization`,
                    ownerOnly: true,
                },
                {
                    icon: CreditCard,
                    label: "Billing",
                    path: `/${slug}/billing`,
                    ownerOnly: true,
                },
            ],
        },
    ];

    const isVisible = (item: MenuItem) => {
        if (item.ownerOnly && !isOrgOwner) return false;
        if (item.permission && !hasPermission(item.permission)) return false;
        return true;
    };

    const visibleGroups = groups
        .map((g) => ({ ...g, items: g.items.filter(isVisible) }))
        .filter((g) => g.items.length > 0);

    const isPathActive = (path: string) =>
        pathname === path || pathname.startsWith(`${path}/`);

    const isItemActive = (item: MenuItem) => {
        // Locked upsell links should not light up as the current page.
        if (item.badge) return false;
        if (item.subItems)
            return item.subItems.some((sub) => isPathActive(sub.path));
        return isPathActive(item.path);
    };

    const toggleExpanded = (label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((item) => item !== label)
                : [...prev, label],
        );
    };

    const go = (path: string) => {
        navigate(path);
        setMobileSidebarOpen(false);
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)");
        const handleChange = (e: MediaQueryListEvent) => {
            if (e.matches) setMobileSidebarOpen(false);
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [setMobileSidebarOpen]);

    // Auto-expand a parent whose child route is active.
    useEffect(() => {
        for (const group of visibleGroups) {
            for (const item of group.items) {
                if (
                    item.subItems?.some((sub) => isPathActive(sub.path)) &&
                    !expandedItems.includes(item.label)
                ) {
                    setExpandedItems((prev) => [...prev, item.label]);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // Close the mobile drawer with Escape.
    useEffect(() => {
        if (!mobileSidebarOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMobileSidebarOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [mobileSidebarOpen, setMobileSidebarOpen]);

    const itemClass = (active: boolean) =>
        cn(
            "group/nav relative flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
            !contentExpanded && "justify-center px-0",
        );

    const iconClass = (active: boolean) =>
        cn(
            "size-4 shrink-0 transition-colors",
            active
                ? "text-sidebar-primary"
                : "text-muted-foreground group-hover/nav:text-sidebar-accent-foreground",
        );

    const withTooltip = (label: string, node: React.ReactElement) =>
        contentExpanded ? (
            node
        ) : (
            <Tooltip>
                <TooltipTrigger asChild>{node}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
        );

    const renderMenuItem = (item: MenuItem) => {
        const Icon = item.icon;
        const active = isItemActive(item);
        const isExpanded = expandedItems.includes(item.label);
        const subItems = item.subItems ?? [];
        const hasSubItems = subItems.length > 0;

        // Collapsed rail: children open in a flyout menu.
        if (hasSubItems && !contentExpanded) {
            return (
                <li key={item.label}>
                    <DropdownMenu>
                        {withTooltip(
                            item.label,
                            <DropdownMenuTrigger
                                className={itemClass(active)}
                                aria-label={item.label}
                            >
                                <Icon className={iconClass(active)} />
                            </DropdownMenuTrigger>,
                        )}
                        <DropdownMenuContent side="right" align="start">
                            <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
                            {subItems.map((sub) => (
                                <DropdownMenuItem
                                    key={sub.path}
                                    onSelect={() => go(sub.path)}
                                    className={cn(
                                        isPathActive(sub.path) &&
                                            "bg-accent font-medium",
                                    )}
                                >
                                    {sub.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </li>
            );
        }

        const button = (
            <button
                type="button"
                onClick={() => {
                    if (hasSubItems) toggleExpanded(item.label);
                    else if (item.path) go(item.path);
                }}
                aria-current={active && !hasSubItems ? "page" : undefined}
                aria-expanded={hasSubItems ? isExpanded : undefined}
                aria-label={!contentExpanded ? item.label : undefined}
                className={itemClass(active && !(hasSubItems && isExpanded))}
            >
                <Icon className={iconClass(active)} />
                {contentExpanded && (
                    <>
                        <span className="flex-1 truncate text-left">
                            {item.label}
                        </span>
                        {item.badge && (
                            <span className="inline-flex items-center gap-0.5 rounded border border-warning/25 bg-warning/10 px-1.5 py-px text-[10px] font-semibold text-warning">
                                <Sparkles className="size-2.5" />
                                {item.badge}
                            </span>
                        )}
                        {hasSubItems && (
                            <ChevronRight
                                className={cn(
                                    "size-3.5 text-muted-foreground transition-transform duration-200",
                                    isExpanded && "rotate-90",
                                )}
                            />
                        )}
                    </>
                )}
            </button>
        );

        return (
            <li key={item.label}>
                {withTooltip(item.label, button)}
                {contentExpanded && hasSubItems && isExpanded && (
                    <ul className="mt-0.5 ml-[18px] space-y-0.5 border-l border-sidebar-border pl-2.5">
                        {subItems.map((subItem) => {
                            const isSubActive = isPathActive(subItem.path);
                            return (
                                <li key={subItem.label}>
                                    <button
                                        type="button"
                                        onClick={() => go(subItem.path)}
                                        aria-current={
                                            isSubActive ? "page" : undefined
                                        }
                                        className={cn(
                                            "flex h-7 w-full items-center rounded-md px-2.5 text-[13px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                                            isSubActive
                                                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                                                : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                                        )}
                                    >
                                        {subItem.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <>
            {/* Mobile scrim */}
            <div
                aria-hidden="true"
                onClick={() => setMobileSidebarOpen(false)}
                className={cn(
                    "fixed inset-0 z-[60] bg-black/40 transition-opacity duration-200 md:hidden dark:bg-black/60",
                    mobileSidebarOpen
                        ? "opacity-100"
                        : "pointer-events-none opacity-0",
                )}
            />

            <aside
                aria-label="Primary navigation"
                className={cn(
                    "fixed inset-y-0 left-0 z-[70] flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 ease-out",
                    "md:relative md:z-auto md:translate-x-0 md:transition-[width] md:duration-200",
                    mobileSidebarOpen
                        ? "translate-x-0 shadow-elevated"
                        : "-translate-x-full",
                    sidebarOpen ? "md:w-60" : "md:w-[60px]",
                )}
            >
                {/* Workspace selector */}
                <div
                    className={cn(
                        "flex h-14 shrink-0 items-center gap-1 border-b border-sidebar-border px-2.5",
                        !contentExpanded && "md:justify-center md:px-0",
                    )}
                >
                    <div className="min-w-0 flex-1">
                        <OrgSwitcher collapsed={!contentExpanded} />
                    </div>
                    <button
                        type="button"
                        onClick={() => setMobileSidebarOpen(false)}
                        aria-label="Close navigation"
                        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground md:hidden"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-x-hidden overflow-y-auto px-2.5 py-3">
                    <div className="space-y-4">
                        {visibleGroups.map((group, gi) => (
                            <div key={group.label}>
                                {contentExpanded ? (
                                    <p className="mb-1 px-2.5 text-[11px] font-medium tracking-wide text-muted-foreground/80 uppercase">
                                        {group.label}
                                    </p>
                                ) : (
                                    gi > 0 && (
                                        <div className="mx-2 mb-3 h-px bg-sidebar-border" />
                                    )
                                )}
                                <ul className="space-y-0.5">
                                    {group.items.map(renderMenuItem)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Footer */}
                <div
                    className={cn(
                        "hidden shrink-0 items-center border-t border-sidebar-border p-2.5 md:flex",
                        contentExpanded ? "justify-between" : "justify-center",
                    )}
                >
                    {contentExpanded && (
                        <span className="flex items-center gap-2 pl-1.5 text-xs font-medium text-muted-foreground">
                            <BrandMark className="size-5 rounded-md" />
                            Unified
                        </span>
                    )}
                    {withTooltip(
                        "Expand sidebar",
                        <button
                            type="button"
                            onClick={() => toggleSidebar()}
                            aria-label={
                                sidebarOpen
                                    ? "Collapse sidebar"
                                    : "Expand sidebar"
                            }
                            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                        >
                            {sidebarOpen ? (
                                <PanelLeftClose className="size-4" />
                            ) : (
                                <PanelLeftOpen className="size-4" />
                            )}
                        </button>,
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
