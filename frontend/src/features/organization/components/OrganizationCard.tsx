import { ArrowRight, Clock, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrganizationAvatar } from "@/components/common/OrgSwitcher";

interface OrganizationCardProps {
    id: string;
    name: string;
    initials: string;
    color: string;
    role?: string;
    memberCount?: number;
    lastActive: string;
    slug?: string;
    logoUrl?: string | null;
    isSelected: boolean;
    onClick: () => void;
}

export function OrganizationCard({
    name,
    initials,
    color,
    role,
    memberCount,
    lastActive,
    slug,
    logoUrl,
    isSelected,
    onClick,
}: OrganizationCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "group flex w-full flex-col gap-4 rounded-xl border bg-card p-4 text-left shadow-card transition-[border-color,box-shadow] outline-none hover:shadow-elevated focus-visible:ring-3 focus-visible:ring-ring/40",
                isSelected
                    ? "border-primary"
                    : "border-border hover:border-primary/40",
            )}
        >
            <div className="flex items-center gap-3">
                <OrganizationAvatar
                    organization={{ name, logoUrl: logoUrl ?? null }}
                    color={color}
                    initials={initials}
                    className="size-11 rounded-lg text-sm"
                />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                        {name}
                    </p>
                    {slug && (
                        <p className="truncate text-xs text-muted-foreground">
                            /{slug}
                        </p>
                    )}
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100" />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                {role && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-1.5 py-0.5 font-medium text-foreground">
                        <Shield className="size-3" />
                        {role}
                    </span>
                )}
                {memberCount !== undefined && (
                    <span className="tabular inline-flex items-center gap-1">
                        <Users className="size-3.5" />
                        {memberCount} member{memberCount === 1 ? "" : "s"}
                    </span>
                )}
                <span className="inline-flex items-center gap-1 sm:ml-auto">
                    <Clock className="size-3.5" />
                    {lastActive}
                </span>
            </div>
        </button>
    );
}
