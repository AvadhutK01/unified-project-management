import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    ArrowRight,
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
import { Separator } from "@/components/ui/separator";
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
    const [selectedId, setSelectedId] = useState<string | null>(null);

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

    const selectedOrg = organizationCards.find((o) => o.id === selectedId);

    const handleOrgClick = (orgId: string, original: unknown) => {
        setSelectedId(selectedId === orgId ? null : orgId);
        setActiveOrganization(
            original as Parameters<typeof setActiveOrganization>[0],
        );
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
        <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-3xl space-y-10">
                <div className="text-center space-y-3">
                    <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-1">
                        <Building2 className="size-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            Select Your Workspace
                        </h1>
                        <p className="mt-2 text-muted-foreground max-w-sm mx-auto leading-relaxed text-sm sm:text-base">
                            Choose which organization you'd like to continue
                            with, or accept a pending invitation.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-0.5">
                        <h2 className="text-sm font-semibold text-foreground">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {organizationCards.map((org) => (
                            <OrganizationCard
                                key={org.id}
                                {...org}
                                isSelected={selectedId === org.id}
                                onClick={() =>
                                    handleOrgClick(org.id, org.__original)
                                }
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
                            className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-dashed border-border bg-card cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all duration-200 min-h-37 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                                <Plus className="size-5 text-muted-foreground" />
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

                    <div className="flex flex-col items-center gap-2 pt-2">
                        {selectedOrg && (
                            <p className="text-sm text-muted-foreground">
                                Continuing as{" "}
                                <span className="font-semibold text-foreground">
                                    {selectedOrg.role}
                                </span>{" "}
                                in{" "}
                                <span className="font-semibold text-foreground">
                                    {selectedOrg.name}
                                </span>
                            </p>
                        )}
                        <Button
                            className="w-full sm:w-auto sm:min-w-56"
                            size="lg"
                            disabled={!selectedId}
                            onClick={() =>
                                navigate(
                                    `/${selectedOrg?.slug.toLowerCase()}/dashboard`,
                                )
                            }
                        >
                            Continue to Dashboard
                            <ArrowRight className="size-4" />
                        </Button>
                        {!selectedId && (
                            <p className="text-xs text-muted-foreground">
                                Select a workspace above to continue
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.25em] px-1">
                        or
                    </span>
                    <Separator className="flex-1" />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-0.5">
                        <div className="flex items-center gap-2">
                            <MailOpen className="size-4 text-foreground" />
                            <h2 className="text-sm font-semibold text-foreground">
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
                        <div className="space-y-2.5">
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
                        <div className="text-center py-8 px-6 rounded-2xl border border-dashed border-border bg-card/50">
                            <div className="inline-flex size-12 items-center justify-center rounded-xl bg-muted/50 mb-2">
                                <Inbox className="size-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                No pending invitations
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                You'll see org invitations here when someone
                                invites you.
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-center text-sm text-muted-foreground">
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
        <Card className="border hover:border-primary/35 hover:shadow-md transition-all duration-200 bg-card">
            <CardContent className="p-5">
                <div className="flex items-start gap-4">
                    {/* Org avatar */}
                    <div
                        className="size-11 shrink-0 rounded-xl flex items-center justify-center text-white text-sm font-bold select-none"
                        style={{ backgroundColor: orgColor }}
                    >
                        {orgInitials}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Top: org name + role badge */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h4 className="font-semibold text-foreground text-sm truncate">
                                    {invitation.orgName}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div
                                        className="size-4 shrink-0 rounded-full flex items-center justify-center text-white font-bold select-none"
                                        style={{
                                            backgroundColor: inviterColor,
                                            fontSize: "8px",
                                        }}
                                    >
                                        {inviterInitials}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        Invited by{" "}
                                        <span className="font-medium text-foreground">
                                            {invitation.invitedBy}
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <Badge
                                variant="secondary"
                                className="shrink-0 text-xs gap-1 h-6 px-2"
                            >
                                <Shield className="size-3" />
                                {invitation.role}
                            </Badge>
                        </div>

                        {/* Bottom: date + actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-border/40">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="size-3 shrink-0" />
                                <span>{formatDate(invitation.invitedAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onDecline}
                                    className="flex-1 sm:flex-none h-8 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
                                >
                                    <X className="size-3.5" />
                                    Decline
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={onAccept}
                                    className="flex-1 sm:flex-none h-8 text-xs"
                                >
                                    <CheckCircle2 className="size-3.5" />
                                    Accept Invitation
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
