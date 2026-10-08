import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    UserPlus,
    UserMinus,
    Users,
    Eye,
    Pencil,
    MessageSquare,
    Lock,
} from "lucide-react";
import { useDirectChat } from "@/features/chat/context/DirectChatContext";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { cn, formatDate, useDebounce } from "@/lib/utils";
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
import { usePresenceStore } from "@/features/presence/store/presence.store";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import {
    IconAction,
    Pagination,
    SearchInput,
    Toolbar,
} from "@/components/common/Toolbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { SimpleTooltip } from "@/components/ui/tooltip";
import type { Tone } from "@/lib/tones";
import { MembersNav } from "../components/MembersNav";

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
        <SimpleTooltip
            label={
                hasProPlan
                    ? `Message ${member.name}`
                    : "Direct chat is available on Pro and Premium"
            }
        >
            <button
                onClick={handleClick}
                aria-label={`Chat with ${member.name}`}
                className={cn(
                    "relative inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors",
                    hasProPlan
                        ? "border-border bg-card text-foreground hover:bg-accent"
                        : "border-dashed border-border text-muted-foreground hover:bg-accent",
                )}
            >
                {hasProPlan ? (
                    <MessageSquare className="size-3.5 text-primary" />
                ) : (
                    <Lock className="size-3.5" />
                )}
                <span className="hidden sm:inline">Chat</span>
                {unreadCount > 0 && (
                    <span className="tabular inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>
        </SimpleTooltip>
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
    const canInvite = hasPermission(PERMISSIONS.MEMBERS_INVITED.ADD);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const presenceMap = usePresenceStore((s) => s.presenceMap);

    const columns = useMemo<DataTableColumn<Member>[]>(
        () => [
            {
                key: "name",
                label: "Member",
                render: (member) => (
                    <div className="flex max-w-[20rem] min-w-0 items-center gap-3">
                        <MemberAvatar
                            name={member.name}
                            status={member.status}
                            memberId={member.userId ?? member.id}
                            userId={member.userId}
                        />
                        <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                                {member.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
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
                    <span className="inline-flex h-5.5 items-center rounded-md border border-border bg-muted/60 px-2 text-xs font-medium text-foreground">
                        {member.role}
                    </span>
                ),
            },
            ...(canEdit
                ? [
                      {
                          key: "status" as const,
                          label: "Status",
                          render: (member: Member) => {
                              const effectiveId = member.userId || member.id;
                              const realTimePresence = effectiveId
                                  ? (presenceMap[effectiveId] as
                                        | string
                                        | undefined)
                                  : undefined;
                              const dbStatusLower = (
                                  member.status || ""
                              ).toLowerCase();

                              let tone: Tone = "neutral";
                              let label = "Offline";

                              if (
                                  realTimePresence === "onleave" ||
                                  realTimePresence === "on_leave" ||
                                  dbStatusLower === "on leave" ||
                                  dbStatusLower === "onleave"
                              ) {
                                  tone = "warning";
                                  label = "On Leave";
                              } else if (realTimePresence === "away") {
                                  tone = "violet";
                                  label = "Away";
                              } else if (
                                  realTimePresence === "active" ||
                                  realTimePresence === "online"
                              ) {
                                  tone = "success";
                                  label = "Online";
                              }

                              return (
                                  <StatusBadge tone={tone}>{label}</StatusBadge>
                              );
                          },
                      },
                  ]
                : []),
            {
                key: "joinedAt",
                label: "Joined",
                className: "hidden sm:table-cell",
                render: (member) => (
                    <span className="tabular text-[13px] text-muted-foreground">
                        {member.joinedAt ? formatDate(member.joinedAt) : "—"}
                    </span>
                ),
            },
            ...(hasAnyAction
                ? [
                      {
                          key: "actions" as const,
                          label: "",
                          className: "w-px text-right",
                          render: (member: Member) => (
                              <div className="flex items-center justify-end gap-0.5">
                                  {canList &&
                                      member.email !==
                                          localStorage.getItem("email") && (
                                          <span className="mr-1">
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
                                          </span>
                                      )}
                                  {canView && (
                                      <IconAction
                                          label={`View ${member.name}`}
                                          icon={Eye}
                                          onClick={() => handleView(member)}
                                      />
                                  )}
                                  {canEdit && (
                                      <IconAction
                                          label={`Edit ${member.name}`}
                                          icon={Pencil}
                                          onClick={() => handleEdit(member)}
                                      />
                                  )}
                                  {canDelete && (
                                      <IconAction
                                          label={`Remove ${member.name}`}
                                          icon={UserMinus}
                                          tone="danger"
                                          onClick={() => handleRemove(member)}
                                      />
                                  )}
                              </div>
                          ),
                      },
                  ]
                : []),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            presenceMap,
        ],
    );

    const activeCount = members.filter((m) => m.status === "Active").length;
    const totalMembers = joinedMembers?.data?.pagination?.total ?? 0;
    const totalPages = joinedMembers?.data?.pagination?.totalPages ?? 1;

    return (
        <>
            <PageContainer>
                <PageHeader
                    title="Members"
                    description="People who have joined this organization, their roles and availability."
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
                        placeholder="Search by name, email or role…"
                        containerClassName="sm:w-80"
                    />
                    {!isLoading && (
                        <span className="tabular text-[13px] text-muted-foreground sm:ml-1">
                            {totalMembers} member{totalMembers !== 1 ? "s" : ""}
                            {canEdit && ` · ${activeCount} active on this page`}
                        </span>
                    )}
                </Toolbar>

                <DataTable
                    columns={columns}
                    data={members}
                    getRowId={(m) => m.id}
                    hasActiveFilters={search.length > 0}
                    loading={isLoading}
                    showDefaultFooter={false}
                    emptyState={
                        <EmptyState
                            icon={Users}
                            title="No members yet"
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

                {members.length > 0 && (
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
                        shown={members.length}
                        total={totalMembers}
                        noun="member"
                    />
                )}
            </PageContainer>

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
