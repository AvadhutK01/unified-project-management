import { useEffect, useMemo, useState } from "react";
import {
    Search,
    UserPlus,
    Mail,
    XCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getColor, getInitials, formatDate, useDebounce } from "@/lib/utils";
import { InviteMembersModal } from "../components/InviteMembersModal";
import { toast } from "sonner";
import {
    useMembersQuery,
    useRevokeInvitationMutation,
} from "../hooks/useMembers";
import { useConfirm } from "@/providers/ConfirmProvider";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";

type InviteStatus = "Pending" | "Accepted" | "Rejected" | "Revoked";

interface InvitedMember {
    id: string;
    name: string;
    email: string;
    role: string;
    invitedBy: string;
    status: InviteStatus;
    invitedAt: string;
}

const STATUS_CONFIG: Record<
    InviteStatus,
    { color: string; bg: string; label: string }
> = {
    Pending: { color: "#d97706", bg: "#fef3c7", label: "Pending" },
    Accepted: { color: "#798c5e", bg: "#f0f4eb", label: "Accepted" },
    Rejected: { color: "#e7848e", bg: "#fdf2f3", label: "Rejected" },
    Revoked: { color: "#a1a1aa", bg: "#f4f4f5", label: "Revoked" },
};

const ROLE_STYLES: Record<string, string> = {
    Admin: "bg-primary/10 text-primary border-primary/20",
    Member: "bg-secondary text-secondary-foreground",
    Viewer: "bg-muted text-muted-foreground",
};

const InvitedMembers = () => {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const [modalOpen, setModalOpen] = useState(false);
    const [reInviteMode, setReInviteMode] = useState(false);
    const [reInviteEmail, setReInviteEmail] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [invites, setInvites] = useState<InvitedMember[]>([]);
    const confirm = useConfirm();
    const { mutate: revokeInvitationMutation } = useRevokeInvitationMutation();
    const { hasPermission } = usePermission();
    const canDelete = hasPermission(PERMISSIONS.MEMBERS.DELETE);

    const { data: invitedMembers, isLoading } = useMembersQuery(
        "invited",
        currentPage,
        debouncedSearch,
    );

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        const mappedInvites: InvitedMember[] =
            invitedMembers?.data?.data?.map((item: any) => ({
                id: item.id,
                name: item.username,
                email: item.email,
                role: item.roleName,
                invitedBy: item.invitedByName ?? "-",
                status:
                    item.status === "pending"
                        ? "Pending"
                        : item.status === "accepted"
                          ? "Accepted"
                          : item.status === "rejected"
                            ? "Rejected"
                            : "Revoked",
                invitedAt: item.createdAt,
            })) || [];

        setInvites(mappedInvites);
    }, [invitedMembers]);

    const handleRevoke = async (invite: InvitedMember) => {
        const confirmed = await confirm({
            title: `Revoke invitation for ${invite.name}?`,
            description: `This will cancel the invitation for ${invite.email}.`,
            confirmText: "Revoke",
            cancelText: "Cancel",
        });

        if (!confirmed) {
            return;
        }

        revokeInvitationMutation(invite.id, {
            onSuccess: () => {
                setInvites((prev) => prev.filter((m) => m.id !== invite.id));
                toast.success(`Invitation to ${invite.name} revoked.`);
            },
            onError: () => {
                toast.error(`Failed to revoke invitation for ${invite.name}.`);
            },
        });
    };

    const columns = useMemo<DataTableColumn<InvitedMember>[]>(
        () => [
            {
                key: "name",
                label: "Invited Person",
                render: (member) => {
                    const color = getColor(member.name);
                    const initials = getInitials(member.name);
                    return (
                        <div className="flex items-center gap-3 min-w-0">
                            <div
                                className="size-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 select-none"
                                style={{ backgroundColor: color }}
                            >
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {member.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {member.email}
                                </p>
                            </div>
                        </div>
                    );
                },
            },
            {
                key: "role",
                label: "Role",
                render: (member) => (
                    <Badge
                        variant="outline"
                        className={ROLE_STYLES[member.role] ?? ""}
                    >
                        {member.role}
                    </Badge>
                ),
            },
            {
                key: "invitedBy",
                label: "Invited By",
                render: (member) => {
                    const color = getColor(member.invitedBy);
                    const initials = getInitials(member.invitedBy);
                    return (
                        <div className="flex items-center gap-2">
                            <div
                                className="size-5 rounded-full flex items-center justify-center text-white shrink-0 select-none"
                                style={{
                                    backgroundColor: color,
                                    fontSize: "9px",
                                    fontWeight: 700,
                                }}
                            >
                                {initials}
                            </div>
                            <span className="text-sm text-foreground truncate">
                                {member.invitedBy}
                            </span>
                        </div>
                    );
                },
            },
            {
                key: "status",
                label: "Status",
                render: (member) => {
                    const cfg = STATUS_CONFIG[member.status];
                    return (
                        <div className="flex items-center gap-1.5">
                            <span
                                className="size-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: cfg.color }}
                            />
                            <span
                                className="text-xs font-medium"
                                style={{ color: cfg.color }}
                            >
                                {cfg.label}
                            </span>
                        </div>
                    );
                },
            },
            {
                key: "invitedAt",
                label: "Invited",
                render: (member) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(member.invitedAt)}
                    </span>
                ),
            },
            ...(canDelete
                ? [
                      {
                          key: "actions" as const,
                          label: "Actions",
                          className: "w-20 text-right",
                          render: (member: InvitedMember) => (
                              <div className="flex items-center justify-center gap-1">
                                  {member.status === "Pending" && (
                                      <button
                                          title="Revoke invitation"
                                          onClick={() => handleRevoke(member)}
                                          className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                      >
                                          <XCircle className="size-4" />
                                      </button>
                                  )}
                              </div>
                          ),
                      },
                  ]
                : []),
        ],
        [canDelete],
    );

    const totalInvites = invitedMembers?.data?.pagination?.total ?? 0;
    const totalPages = invitedMembers?.data?.pagination?.totalPages ?? 1;

    return (
        <>
            <div className="p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">
                            Invited Members
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Track and manage pending invitations sent to your
                            team.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    {hasPermission(PERMISSIONS.MEMBERS.ADD) && (
                        <Button
                            onClick={() => setModalOpen(true)}
                            className="gap-1.5"
                        >
                            <UserPlus className="size-4" />
                            Invite Members
                        </Button>
                    )}

                    <div className="relative min-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name, email, role or status..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary transition"
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={invites}
                    getRowId={(m) => m.id}
                    hasActiveFilters={search.length > 0}
                    loading={isLoading}
                    showDefaultFooter={false}
                    emptyState={
                        <tr>
                            <td colSpan={canDelete ? 6 : 5}>
                                <div className="flex flex-col items-center justify-center py-16 gap-2">
                                    <Mail className="size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">
                                        No invitations sent yet
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Invite people to grow your team.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    }
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground px-1">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {invites.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                            {totalInvites}
                        </span>{" "}
                        invitation{totalInvites !== 1 ? "s" : ""}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                setCurrentPage((page) => Math.max(1, page - 1))
                            }
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-muted-foreground px-2">
                            Page{" "}
                            <span className="font-medium text-foreground">
                                {currentPage}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-foreground">
                                {totalPages}
                            </span>
                        </span>
                        <button
                            onClick={() =>
                                setCurrentPage((page) =>
                                    Math.min(totalPages, page + 1),
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <InviteMembersModal
                open={modalOpen}
                reInviteMode={reInviteMode}
                initialEmail={reInviteEmail}
                onClose={() => {
                    setModalOpen(false);
                    setReInviteMode(false);
                    setReInviteEmail("");
                }}
            />
        </>
    );
};

export default InvitedMembers;
