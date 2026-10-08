import { useEffect, useMemo, useState } from "react";
import { UserPlus, Mail, XCircle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { formatDate, useDebounce } from "@/lib/utils";
import { InviteMembersModal } from "../components/InviteMembersModal";
import { toast } from "sonner";
import {
    useMembersQuery,
    useRevokeInvitationMutation,
} from "../hooks/useMembers";
import { useConfirm } from "@/providers/ConfirmProvider";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import {
    IconAction,
    Pagination,
    SearchInput,
    Toolbar,
} from "@/components/common/Toolbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { getColor, getInitials } from "@/lib/utils";
import type { Tone } from "@/lib/tones";
import { MembersNav } from "../components/MembersNav";

type InviteStatus = "Pending" | "Accepted" | "Rejected" | "Revoked";

interface InvitedMember {
    id: string;
    name: string;
    email: string;
    role: string;
    invitedBy: string;
    invitedByUserId: string;
    memberId: string;
    status: InviteStatus;
    invitedAt: string;
}

const STATUS_TONE: Record<InviteStatus, Tone> = {
    Pending: "warning",
    Accepted: "success",
    Rejected: "danger",
    Revoked: "neutral",
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
    const canDelete = hasPermission(PERMISSIONS.MEMBERS_INVITED.DELETE);
    const canInvite = hasPermission(PERMISSIONS.MEMBERS_INVITED.ADD);

    const { data: invitedMembers, isLoading } = useMembersQuery(
        "invited",
        currentPage,
        debouncedSearch,
    );

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    useEffect(() => {
        const mappedInvites: InvitedMember[] =
            invitedMembers?.data?.data?.map((item: any) => ({
                id: item.id,
                name: item.username,
                email: item.email,
                role: item.roleName,
                invitedBy: item.invitedByName ?? "-",
                invitedByUserId: item.invitedByUserId ?? "",
                memberId: item.memberId,
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
                label: "Person",
                render: (member) => (
                    <div className="flex max-w-[20rem] min-w-0 items-center gap-3">
                        {member.name ? (
                            <MemberAvatar
                                name={member.name}
                                status={member.status}
                                memberId={member.memberId}
                            />
                        ) : (
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                                <Mail className="size-3.5" />
                            </span>
                        )}
                        <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                                {member.name || member.email}
                            </p>
                            {member.name && (
                                <p className="truncate text-xs text-muted-foreground">
                                    {member.email}
                                </p>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                key: "role",
                label: "Role",
                render: (member) => (
                    <span className="inline-flex h-5.5 items-center rounded-md border border-border bg-muted/60 px-2 text-xs font-medium text-foreground">
                        {member.role}
                    </span>
                ),
            },
            {
                key: "invitedBy",
                label: "Invited by",
                className: "hidden md:table-cell",
                render: (member) => (
                    <div className="flex min-w-0 items-center gap-2">
                        <span
                            aria-hidden="true"
                            className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                            style={{
                                backgroundColor: getColor(member.invitedBy),
                            }}
                        >
                            {getInitials(member.invitedBy)}
                        </span>
                        <span className="truncate text-[13px] text-foreground">
                            {member.invitedBy}
                        </span>
                    </div>
                ),
            },
            {
                key: "status",
                label: "Status",
                render: (member) => (
                    <StatusBadge tone={STATUS_TONE[member.status]}>
                        {member.status}
                    </StatusBadge>
                ),
            },
            {
                key: "invitedAt",
                label: "Invited",
                className: "hidden sm:table-cell",
                render: (member) => (
                    <span className="tabular text-[13px] text-muted-foreground">
                        {member.invitedAt ? formatDate(member.invitedAt) : "—"}
                    </span>
                ),
            },
            ...(canDelete
                ? [
                      {
                          key: "actions" as const,
                          label: "",
                          className: "w-px text-right",
                          render: (member: InvitedMember) =>
                              member.status === "Pending" ? (
                                  <div className="flex justify-end">
                                      <IconAction
                                          label={`Revoke invitation for ${member.email}`}
                                          icon={XCircle}
                                          tone="danger"
                                          onClick={() => handleRevoke(member)}
                                      />
                                  </div>
                              ) : null,
                      },
                  ]
                : []),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [canDelete],
    );

    const totalInvites = invitedMembers?.data?.pagination?.total ?? 0;
    const totalPages = invitedMembers?.data?.pagination?.totalPages ?? 1;

    return (
        <>
            <PageContainer>
                <PageHeader
                    title="Members"
                    description="Track and manage invitations sent to your team."
                    actions={
                        canInvite && (
                            <Button onClick={() => setModalOpen(true)}>
                                <UserPlus />
                                Invite members
                            </Button>
                        )
                    }
                />

                <MembersNav />

                <Toolbar>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search by name, email, role or status…"
                        containerClassName="sm:w-80"
                    />
                    {!isLoading && (
                        <span className="tabular text-[13px] text-muted-foreground sm:ml-1">
                            {totalInvites} invitation
                            {totalInvites !== 1 ? "s" : ""}
                        </span>
                    )}
                </Toolbar>

                <DataTable
                    columns={columns}
                    data={invites}
                    getRowId={(m) => m.id}
                    hasActiveFilters={search.length > 0}
                    loading={isLoading}
                    showDefaultFooter={false}
                    emptyState={
                        <EmptyState
                            icon={Mail}
                            title="No invitations sent yet"
                            description="Invite your team to collaborate on projects."
                            action={
                                canInvite ? (
                                    <Button
                                        size="sm"
                                        onClick={() => setModalOpen(true)}
                                    >
                                        <UserPlus />
                                        Invite members
                                    </Button>
                                ) : undefined
                            }
                        />
                    }
                />

                {invites.length > 0 && (
                    <Pagination
                        page={currentPage}
                        totalPages={totalPages}
                        onPrevious={() =>
                            setCurrentPage((page) => Math.max(1, page - 1))
                        }
                        onNext={() =>
                            setCurrentPage((page) =>
                                Math.min(totalPages, page + 1),
                            )
                        }
                        shown={invites.length}
                        total={totalInvites}
                        noun="invitation"
                    />
                )}
            </PageContainer>

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
