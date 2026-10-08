import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronsUpDown, Plus, LayoutGrid } from "lucide-react";
import { cn, getColor, getInitials } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useOrganizationStore } from "@/store/organization.store";
import { useOrganizationsQuery } from "@/features/organization/hooks/useOrganizations";
import { useSubscriptionQuery } from "@/features/subscriptions/hooks/useSubscription";
import {
    PLAN_LABELS,
    type SubscriptionPlan,
} from "@/features/subscriptions/utils/subscriptionHelpers";
import type { Organization } from "@/features/organization/types/organization.types";

interface OrgSwitcherProps {
    collapsed: boolean;
}

/** Organization logo with deterministic initials fallback. */
export function OrganizationAvatar({
    organization,
    color,
    initials,
    className,
}: {
    organization?: Pick<Organization, "name" | "logoUrl"> | null;
    color?: string;
    initials?: string;
    className?: string;
}) {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [organization?.logoUrl]);

    if (organization?.logoUrl && !imageError) {
        return (
            <img
                src={organization.logoUrl}
                alt={`${organization.name} logo`}
                className={cn(
                    "rounded-md object-cover ring-1 ring-border",
                    className,
                )}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div
            aria-hidden="true"
            className={cn(
                "flex items-center justify-center rounded-md text-[11px] font-semibold text-white select-none",
                className,
            )}
            style={{
                backgroundColor: color ?? getColor(organization?.name ?? ""),
            }}
        >
            {initials ?? getInitials(organization?.name ?? "")}
        </div>
    );
}

export function OrgSwitcher({ collapsed }: OrgSwitcherProps) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { activeOrganization, setActiveOrganization } =
        useOrganizationStore();
    const { data: response } = useOrganizationsQuery();
    const { data: subscription } = useSubscriptionQuery();
    const organizations: Organization[] = response?.data?.organizations ?? [];

    const activeColor = getColor(activeOrganization?.slug ?? "");
    const activeInitials = getInitials(activeOrganization?.name ?? "");
    const planLabel = subscription?.plan
        ? PLAN_LABELS[subscription.plan as SubscriptionPlan]
        : null;

    const handleSwitch = (org: Organization) => {
        setActiveOrganization(org);
        navigate(`/${org.slug.toLowerCase()}/dashboard`);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                        open && "bg-sidebar-accent",
                        collapsed && "w-auto justify-center",
                    )}
                    aria-label={`Switch workspace — current: ${activeOrganization?.name ?? "none"}`}
                >
                    <OrganizationAvatar
                        organization={activeOrganization}
                        color={activeColor}
                        initials={activeInitials}
                        className="size-7 shrink-0"
                    />

                    {!collapsed && (
                        <>
                            <span className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate text-[13px] leading-tight font-semibold text-foreground">
                                    {activeOrganization?.name ?? "No workspace"}
                                </span>
                                <span className="truncate text-[11px] leading-tight text-muted-foreground">
                                    {planLabel
                                        ? `${planLabel} plan`
                                        : "Workspace"}
                                </span>
                            </span>
                            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
                        </>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                side="bottom"
                sideOffset={6}
                className="z-[80] w-64 rounded-lg border border-border p-1 shadow-elevated"
            >
                <p className="px-2 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">
                    Workspaces
                </p>

                <div
                    role="listbox"
                    aria-label="Workspaces"
                    className="flex max-h-60 flex-col gap-px overflow-y-auto"
                >
                    {organizations.map((org) => {
                        const isActive = org.id === activeOrganization?.id;
                        return (
                            <button
                                key={org.id}
                                role="option"
                                aria-selected={isActive}
                                onClick={() => handleSwitch(org)}
                                className={cn(
                                    "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors outline-none hover:bg-accent focus-visible:bg-accent",
                                    isActive && "bg-accent",
                                )}
                            >
                                <OrganizationAvatar
                                    organization={org}
                                    color={getColor(org.slug)}
                                    initials={getInitials(org.name)}
                                    className="size-6 shrink-0 text-[10px]"
                                />
                                <span className="flex-1 truncate text-[13px] font-medium text-foreground">
                                    {org.name}
                                </span>
                                {isActive && (
                                    <Check className="size-4 shrink-0 text-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="-mx-1 my-1 h-px bg-border" />

                <div className="flex flex-col gap-px">
                    <button
                        className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:bg-accent"
                        onClick={() => {
                            navigate("/org-setup/select");
                            setOpen(false);
                        }}
                    >
                        <LayoutGrid className="size-4" />
                        All workspaces
                    </button>
                    <button
                        className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:bg-accent"
                        onClick={() => {
                            navigate("/org-setup/create");
                            setOpen(false);
                        }}
                    >
                        <Plus className="size-4" />
                        Create workspace
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
