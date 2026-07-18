import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Building2,
    MailOpen,
    CheckCircle2,
    X,
    Clock,
    Shield,
    Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrganizationCard } from "@/features/organization/components/OrganizationCard";
import { useOrganizationsQuery } from "../hooks/useOrganizations";
import { getColor, getInitials, formatDate } from "@/lib/utils";
import { useOrganizationStore } from "@/store/organization.store";
import { toast } from "sonner";
import { useFetchInvitationsQuery } from "@/features/members/hooks/useMembers";
import { useUpdateInvitationStatusMutation } from "@/features/members/hooks/useMembers";

type Invitation = {
    id: string;
    orgName: string;
    invitedBy: string;
    role: string;
    invitedAt: string;
};

export default function OrganizationSelector() {
    const navigate = useNavigate();

    const { data: response } = useOrganizationsQuery();
    const { data: invitationData } = useFetchInvitationsQuery();
    const { setActiveOrganization } = useOrganizationStore();
    const { mutate: updateInvitationStatus } =
        useUpdateInvitationStatusMutation();
    const organizations = response?.data?.organizations ?? [];

    const mappedInvitations = useMemo<Invitation[]>(() => {
        return (
            invitationData?.data?.data?.map((item: any) => ({
                id: item.id,
                orgName: item.organizationName,
                invitedBy: item.invitedByName,
                role: item.roleName,
                invitedAt: item.createdAt,
            })) || []
        );
    }, [invitationData]);

    const [invitations, setInvitations] = useState<Invitation[]>([]);

    useEffect(() => {
        setInvitations(mappedInvitations);
    }, [mappedInvitations]);

    const organizationCards = useMemo(
        () =>
            organizations.map((org) => ({
                id: org.id,
                name: org.name,
                initials: getInitials(org.name),
                color: getColor(org.slug),
                role: "Member",
                memberCount: 1,
                slug: org.slug,
                lastActive: formatDate(org.updatedAt),
                __original: org,
            })),
        [organizations],
    );

    const handleOrgClick = (org: (typeof organizationCards)[number]) => {
        setActiveOrganization(
            org.__original as Parameters<typeof setActiveOrganization>[0],
        );
        navigate(`/${org.slug.toLowerCase()}/dashboard`);
    };

    const handleAccept = (id: string, orgName: string) => {
        updateInvitationStatus(
            { id, status: "accepted" },
            {
                onSuccess: () => {
                    setInvitations((prev) =>
                        prev.filter((inv) => inv.id !== id),
                    );
                    toast.success(`Joined ${orgName} successfully!`);
                },
                onError: () => {
                    toast.error(`Failed to accept invitation from ${orgName}.`);
                },
            },
        );
    };

    const handleDecline = (id: string, orgName: string) => {
        updateInvitationStatus(
            { id, status: "rejected" },
            {
                onSuccess: () => {
                    setInvitations((prev) =>
                        prev.filter((inv) => inv.id !== id),
                    );
                    toast.info(`Declined invitation from ${orgName}.`);
                },
                onError: () => {
                    toast.error(
                        `Failed to decline invitation from ${orgName}.`,
                    );
                },
            },
        );
    };

    return (
        <div className="min-h-screen bg-background flex justify-center px-8 py-12">
            <div className="flex flex-col gap-5 w-full">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <Building2 className="size-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground leading-tight">
                            Select Your Workspace
                        </h1>
                        <p className="text-xs text-muted-foreground leading-snug">
                            Choose an organization or accept a pending
                            invitation.
                        </p>
                    </div>
                </div>

                {/* Two-column body */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
                    {/* LEFT — Organizations */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Your Organizations
                            </h2>
                            <Badge
                                variant="secondary"
                                className="text-xs font-medium"
                            >
                                {organizationCards.length}{" "}
                                {organizationCards.length === 1
                                    ? "workspace"
                                    : "workspaces"}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {organizationCards.map((org) => (
                                <OrganizationCard
                                    key={org.id}
                                    {...org}
                                    isSelected={false}
                                    onClick={() => handleOrgClick(org)}
                                />
                            ))}

                            <div
                                onClick={() => navigate("/org-setup/create")}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    navigate("/org-setup/create")
                                }
                                className="group flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border-2 border-dashed border-border bg-card/50 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all duration-200 min-h-[170px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <div className="size-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors duration-200">
                                    <Plus className="size-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-foreground">
                                        Create New
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Start a fresh workspace
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — Invitations */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <MailOpen className="size-3.5 text-muted-foreground" />
                                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Pending Invitations
                                </h2>
                            </div>
                            {invitations.length > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="bg-primary/12 text-primary border border-primary/20 font-semibold text-xs"
                                >
                                    {invitations.length}{" "}
                                    {invitations.length === 1
                                        ? "invitation"
                                        : "invitations"}
                                </Badge>
                            )}
                        </div>

                        {invitations.length > 0 ? (
                            <div className="flex flex-col gap-2 max-h-105 overflow-y-auto pr-0.5 scrollbar-thin">
                                {invitations.map((inv) => (
                                    <InvitationCard
                                        key={inv.id}
                                        invitation={inv}
                                        onAccept={() =>
                                            handleAccept(inv.id, inv.orgName)
                                        }
                                        onDecline={() =>
                                            handleDecline(inv.id, inv.orgName)
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 px-5 rounded-xl border border-dashed border-border bg-card/50 flex flex-col items-center gap-2">
                                <div className="inline-flex size-10 items-center justify-center rounded-xl bg-muted/50">
                                    <Inbox className="size-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        No pending invitations
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        You'll see org invitations here when
                                        someone invites you.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground">
                    Need help?{" "}
                    <a
                        href="#"
                        className="text-primary hover:underline font-medium"
                    >
                        Contact support
                    </a>
                </p>
            </div>
        </div>
    );
}

type InvitationCardProps = {
    invitation: Invitation;
    onAccept: () => void;
    onDecline: () => void;
};

function InvitationCard({
    invitation,
    onAccept,
    onDecline,
}: InvitationCardProps) {
    const orgColor = getColor(invitation.orgName);
    const orgInitials = getInitials(invitation.orgName);
    const inviterInitials = getInitials(invitation.invitedBy);
    const inviterColor = getColor(invitation.invitedBy);

    return (
        <Card className="border hover:border-primary/35 hover:shadow-sm transition-all duration-200 bg-card">
            <CardContent className="p-4">
                {/* Top row: avatar + info + role badge */}
                <div className="flex items-start gap-3">
                    {/* Org avatar */}
                    <div
                        className="size-10 shrink-0 rounded-xl flex items-center justify-center text-white text-sm font-bold select-none"
                        style={{ backgroundColor: orgColor }}
                    >
                        {orgInitials}
                    </div>

                    {/* Name + inviter */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <h4 className="font-semibold text-foreground text-sm leading-tight truncate">
                            {invitation.orgName}
                        </h4>
                        <div className="flex items-center gap-1 mt-1">
                            <div
                                className="size-4 shrink-0 rounded-full flex items-center justify-center text-white font-bold select-none"
                                style={{
                                    backgroundColor: inviterColor,
                                    fontSize: "8px",
                                }}
                            >
                                {inviterInitials}
                            </div>
                            <span className="text-xs text-muted-foreground truncate">
                                by{" "}
                                <span className="font-medium text-foreground">
                                    {invitation.invitedBy}
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Role badge */}
                    <Badge
                        variant="secondary"
                        className="shrink-0 text-xs gap-1 h-6 px-2 mt-0.5"
                    >
                        <Shield className="size-3" />
                        {invitation.role}
                    </Badge>
                </div>

                {/* Bottom row: date + actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="size-3 shrink-0" />
                        <span className="whitespace-nowrap">
                            {formatDate(invitation.invitedAt)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDecline}
                            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
                        >
                            <X className="size-3" />
                            Decline
                        </Button>
                        <Button
                            size="sm"
                            onClick={onAccept}
                            className="h-7 px-2.5 text-xs"
                        >
                            <CheckCircle2 className="size-3" />
                            Accept
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
