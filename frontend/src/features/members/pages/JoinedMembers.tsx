import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Search,
    UserPlus,
    UserMinus,
    Users,
    ChevronLeft,
    ChevronRight,
    Eye,
    Edit,
    MessageSquare,
} from "lucide-react";
import { useDirectChat } from "@/features/chat/context/DirectChatContext";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, useDebounce } from "@/lib/utils";
import { InviteMembersModal } from "../components/InviteMembersModal";
import { EditMemberModal } from "../components/EditMemberModal";
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";
import { useMembersQuery, useRemoveMemberMutation } from "../hooks/useMembers";
import type { Member } from "@/features/members/types/members.types";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";
import { useSubscriptionQuery } from "@/features/subscriptions/hooks/useSubscription";
import { isAtLeastPlan } from "@/features/subscriptions/utils/subscriptionHelpers";
import { useOrganizationStore } from "@/store/organization.store";
import { MemberAvatar } from "@/components/common/MemberAvatar";

const ROLE_STYLES: Record<string, string> = {
    Admin: "bg-primary/10 text-primary border-primary/20",
    Member: "bg-secondary text-secondary-foreground",
    Viewer: "bg-muted text-muted-foreground",
};

const MemberChatButton = ({
    member,
    onOpenChat,
    hasProPlan,
    isOrgOwner,
    billingPath,
}: {
    member: Member;
    onOpenChat: () => void;
    hasProPlan: boolean;
    isOrgOwner: boolean;
    billingPath: string;
}) => {
    const navigate = useNavigate();
    const { unreadCounts } = useDirectChat();

    const memberUserId = (member as any).memberId || member.userId || member.id;

    const unreadCount =
        unreadCounts[memberUserId] || unreadCounts[member.id] || 0;

    const handleClick = () => {
        if (!hasProPlan) {
            if (isOrgOwner) {
                toast.info(
                    "Direct chat requires a Pro or Premium plan. Redirecting to billing page...",
                );
                navigate(billingPath);
            } else {
                toast.info(
                    "Direct chat requires a Pro or Premium plan. Ask your organization owner to upgrade.",
                );
            }
            return;
        }
        onOpenChat();
    };

    return (
        <button
            onClick={handleClick}
            title={`Chat with ${member.name}`}
            className={`relative inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-medium ${
                hasProPlan
                    ? "text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 border-violet-500/20"
                    : "text-muted-foreground hover:bg-muted border-border/60"
            }`}
        >
            <MessageSquare className="size-3.5 text-violet-500 shrink-0" />
            <span className="hidden sm:inline">Chat</span>
            {unreadCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}
        </button>
    );
};

const JoinedMembers = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
        null,
    );
    const [currentPage, setCurrentPage] = useState(1);

    const confirm = useConfirm();
    const { mutate: removeMemberMutation } = useRemoveMemberMutation();
    const { openChatWithMember, closeChat } = useDirectChat();
    const { hasPermission, isOrgOwner } = usePermission();
    const canList = hasPermission(PERMISSIONS.MEMBERS_JOINED.LIST);
    const canView = hasPermission(PERMISSIONS.MEMBERS_JOINED.VIEW);
    const canEdit = hasPermission(PERMISSIONS.MEMBERS_JOINED.EDIT);
    const canDelete = hasPermission(PERMISSIONS.MEMBERS_JOINED.DELETE);
    const hasAnyAction = canView || canEdit || canDelete || canList;

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        return () => {
            closeChat();
        };
    }, [closeChat]);

    useEffect(() => {
        const chatMemberId = searchParams.get("chatMemberId");
        const chatName = searchParams.get("chatName");
        if (chatMemberId) {
            const memberObj = members.find(
                (m) => m.id === chatMemberId || m.userId === chatMemberId,
            );
            const name =
                memberObj?.name ||
                (chatName && chatName !== "Member"
                    ? chatName
                    : memberObj?.email || "Member");
            const email = memberObj?.email;

            openChatWithMember(chatMemberId, name, email);
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("chatMemberId");
            newParams.delete("chatName");
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams, openChatWithMember, members]);

    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );
    const { data: subscription } = useSubscriptionQuery();
    const currentPlan = subscription?.plan || activeOrganization?.plan;
    const hasProPlan = isAtLeastPlan(currentPlan, "pro");
    const billingPath = `/${activeOrganization?.slug}/billing`;

    const { data: joinedMembers, isLoading } = useMembersQuery(
        "joined",
        currentPage,
        debouncedSearch,
    );

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        const mappedMembers: Member[] =
            joinedMembers?.data?.data?.map((item: any) => ({
                id: item.id,
                userId: item.memberId ?? item.userId ?? item.id,
                name: item.username,
                email: item.email,
                role: item.roleName,
                status:
                    item.status === "active"
                        ? "Active"
                        : item.status === "inactive"
                          ? "Inactive"
                          : "On Leave",
                joinedAt: item.createdAt ?? item.joinedAt ?? "",
            })) || [];

        setMembers(mappedMembers);
    }, [joinedMembers]);

    const handleRemove = async (member: Member) => {
        const confirmed = await confirm({
            title: `Remove ${member.name}?`,
            description: `Are you sure you want to remove ${member.name} from the organization? This action cannot be undone.`,
            confirmText: "Remove",
            cancelText: "Cancel",
        });
        if (!confirmed) return;

        removeMemberMutation(member.id, {
            onSuccess: () => {
                toast.success(`${member.name} removed from organization.`);
            },
            onError: (error: any) => {
                toast.error(
                    error?.response?.data?.message ||
                        `Failed to remove ${member.name}. Please try again.`,
                );
            },
        });
    };

    const handleView = (member: Member) => {
        toast.info(`Viewing ${member.name}'s profile.`);
    };

    const handleEdit = (member: Member) => {
        setSelectedMemberId(member.id);
        setEditModalOpen(true);
    };

    const columns = useMemo<DataTableColumn<Member>[]>(
        () => [
            {
                key: "name",
                label: "Member",
                render: (member) => (
                    <div className="flex items-center gap-3 min-w-0">
                        <MemberAvatar
                            name={member.name}
                            status={member.status}
                            memberId={member.userId}
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {member.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {member.email}
                            </p>
                        </div>
                    </div>
                ),
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
            ...(canEdit
                ? [
                      {
                          key: "status" as const,
                          label: "Status",
                          render: (member: Member) => (
                              <div className="flex items-center gap-1.5">
                                  <span
                                      className="size-1.5 rounded-full shrink-0"
                                      style={{
                                          backgroundColor:
                                              member.status === "Active"
                                                  ? "#798c5e"
                                                  : "#a1a1aa",
                                      }}
                                  />
                                  <span
                                      className="text-xs font-medium"
                                      style={{
                                          color:
                                              member.status === "Active"
                                                  ? "#798c5e"
                                                  : "#a1a1aa",
                                      }}
                                  >
                                      {member.status}
                                  </span>
                              </div>
                          ),
                      },
                  ]
                : []),
            {
                key: "joinedAt",
                label: "Joined",
                className: "hidden sm:table-cell",
                render: (member) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(member.joinedAt)}
                    </span>
                ),
            },
            ...(hasAnyAction
                ? [
                      {
                          key: "actions" as const,
                          label: "Actions",
                          className: "w-36 text-right",
                          render: (member: Member) => (
                              <div className="flex items-center justify-end gap-1">
                                  {canList &&
                                      member.email !==
                                          localStorage.getItem("email") && (
                                          <MemberChatButton
                                              member={member}
                                              onOpenChat={() =>
                                                  openChatWithMember(
                                                      member.userId ??
                                                          member.id,
                                                      member.name,
                                                      member.email,
                                                  )
                                              }
                                              hasProPlan={hasProPlan}
                                              isOrgOwner={isOrgOwner}
                                              billingPath={billingPath}
                                          />
                                      )}

                                  {canView && (
                                      <button
                                          title={`View ${member.name}`}
                                          onClick={() => handleView(member)}
                                          className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                      >
                                          <Eye className="size-4" />
                                      </button>
                                  )}
                                  {canEdit && (
                                      <button
                                          title={`Edit ${member.name}`}
                                          onClick={() => handleEdit(member)}
                                          className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                      >
                                          <Edit className="size-4" />
                                      </button>
                                  )}
                                  {canDelete && (
                                      <button
                                          title={`Remove ${member.name}`}
                                          onClick={() => handleRemove(member)}
                                          className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                      >
                                          <UserMinus className="size-4" />
                                      </button>
                                  )}
                              </div>
                          ),
                      },
                  ]
                : []),
        ],
        [
            hasAnyAction,
            canView,
            canEdit,
            canDelete,
            canList,
            hasProPlan,
            isOrgOwner,
            billingPath,
            openChatWithMember,
        ],
    );

    const activeCount = members.filter((m) => m.status === "Active").length;
    const totalMembers = joinedMembers?.data?.pagination?.total ?? 0;
    const totalPages = joinedMembers?.data?.pagination?.totalPages ?? 1;

    return (
        <>
            <div className="p-4 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">
                            Joined Members
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Manage members who are part of this organization.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
                            <Users className="size-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-foreground">
                                {members.length} total
                            </span>
                        </div>
                        {canEdit && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
                                <span
                                    className="size-1.5 rounded-full"
                                    style={{ backgroundColor: "#798c5e" }}
                                />
                                <span className="text-xs font-medium text-foreground">
                                    {activeCount} active
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {hasPermission(PERMISSIONS.MEMBERS_INVITED.ADD) && (
                        <Button
                            onClick={() => setModalOpen(true)}
                            className="w-full gap-1.5 sm:w-auto"
                        >
                            <UserPlus className="size-4" />
                            Invite Members
                        </Button>
                    )}

                    <div className="relative w-full sm:w-auto sm:min-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name, email or role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary transition"
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={members}
                    getRowId={(m) => m.id}
                    hasActiveFilters={search.length > 0}
                    loading={isLoading}
                    showDefaultFooter={false}
                    emptyState={
                        <tr>
                            <td colSpan={hasAnyAction ? 5 : 4}>
                                <div className="flex flex-col items-center justify-center py-16 gap-2">
                                    <Users className="size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">
                                        No members yet
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Invite people to grow your team.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    }
                />

                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                    <p className="text-xs text-muted-foreground px-1">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {members.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                            {totalMembers}
                        </span>{" "}
                        member{totalMembers !== 1 ? "s" : ""}
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
                onClose={() => setModalOpen(false)}
            />
            <EditMemberModal
                open={editModalOpen}
                memberId={selectedMemberId}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedMemberId(null);
                }}
            />
        </>
    );
};

export default JoinedMembers;
