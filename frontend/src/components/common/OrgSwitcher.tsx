import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronsUpDown, Plus, LayoutGrid } from "lucide-react";
import { cn, getColor, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useOrganizationStore } from "@/store/organization.store";
import { useOrganizationsQuery } from "@/features/organization/hooks/useOrganizations";
import type { Organization } from "@/features/organization/types/organization.types";

interface OrgSwitcherProps {
    collapsed: boolean;
}

function OrganizationAvatar({
    organization,
    color,
    initials,
    className,
}: {
    organization?: Pick<Organization, "name" | "logoUrl"> | null;
    color: string;
    initials: string;
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
                className={cn("object-cover", className)}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-lg bg-muted text-white text-xs font-bold shadow-sm select-none",
                className,
            )}
            style={{ backgroundColor: color }}
        >
            {initials}
        </div>
    );
}

export function OrgSwitcher({ collapsed }: OrgSwitcherProps) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { activeOrganization, setActiveOrganization } =
        useOrganizationStore();
    const { data: response } = useOrganizationsQuery();
    const organizations: Organization[] = response?.data?.organizations ?? [];

    const activeColor = getColor(activeOrganization?.slug ?? "");
    const activeInitials = getInitials(activeOrganization?.name ?? "");

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
                        "w-full flex items-center gap-2.5 rounded-lg px-2 py-2 transition-all duration-200 cursor-pointer border border-transparent",
                        "hover:bg-primary/5 hover:border-border/60",
                        open && "bg-primary/5 border-border/60",
                        collapsed ? "justify-center" : "justify-between",
                    )}
                    aria-label="Switch organization"
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        {/* Org avatar */}
                        <OrganizationAvatar
                            organization={activeOrganization}
                            color={activeColor}
                            initials={activeInitials}
                            className="size-7 shrink-0 rounded-lg"
                        />

                        {!collapsed && (
                            <div className="flex flex-col items-start min-w-0">
                                <span className="text-xs font-semibold text-foreground truncate max-w-[130px] leading-tight">
                                    {activeOrganization?.name ?? "No workspace"}
                                </span>
                                <span className="text-[10px] text-muted-foreground leading-tight">
                                    Switch workspace
                                </span>
                            </div>
                        )}
                    </div>

                    {!collapsed && (
                        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground/70" />
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                side="right"
                sideOffset={8}
                className="w-64 p-2 shadow-xl rounded-xl border border-border/80"
            >
                {/* Header */}
                <div className="px-2 py-1.5 mb-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Your Workspaces
                    </p>
                </div>

                {/* Org list */}
                <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
                    {organizations.map((org) => {
                        const color = getColor(org.slug);
                        const initials = getInitials(org.name);
                        const isActive = org.id === activeOrganization?.id;

                        return (
                            <button
                                key={org.id}
                                onClick={() => handleSwitch(org)}
                                className={cn(
                                    "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all duration-150 cursor-pointer",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "hover:bg-muted/60 text-foreground",
                                )}
                            >
                                {/* Avatar */}
                                <OrganizationAvatar
                                    organization={org}
                                    color={color}
                                    initials={initials}
                                    className="size-7 shrink-0 rounded-lg"
                                />

                                {/* Name */}
                                <span className="flex-1 text-sm font-medium truncate">
                                    {org.name}
                                </span>

                                {/* Active check */}
                                {isActive && (
                                    <Check className="size-3.5 shrink-0 text-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <Separator className="my-2" />

                {/* Footer actions */}
                <div className="flex flex-col gap-0.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            navigate("/org-setup/select");
                            setOpen(false);
                        }}
                    >
                        <LayoutGrid className="size-3.5" />
                        All workspaces
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            navigate("/org-setup/create");
                            setOpen(false);
                        }}
                    >
                        <Plus className="size-3.5" />
                        Create new workspace
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
