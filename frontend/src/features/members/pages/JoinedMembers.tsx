import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    UserPlus,
    UserMinus,
    Users,
    ChevronLeft,
    ChevronRight,
    Eye,
    Edit,
    Phone,
    Video,
    ChevronDown,
    Sparkles,
} from "lucide-react";
import { useCall } from "@/features/call/context/CallContext";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { getColor, getInitials, formatDate, useDebounce } from "@/lib/utils";
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

const ROLE_STYLES: Record<string, string> = {
    Admin: "bg-primary/10 text-primary border-primary/20",
    Member: "bg-secondary text-secondary-foreground",
    Viewer: "bg-muted text-muted-foreground",
};

const MemberCallButton = ({
    member,
    onInitiateCall,
    hasProPlan,
    isOrgOwner,
    billingPath,
}: {
    member: Member;
    onInitiateCall: (type: "voice" | "video") => void;
    hasProPlan: boolean;
    isOrgOwner: boolean;
    billingPath: string;
}) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleLockedClick = () => {
        setOpen(false);
        if (isOrgOwner) {
            navigate(billingPath);
        } else {
            toast.info(
                "Member calling requires a Pro or Premium plan. Ask your organization owner to upgrade.",
            );
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    title={`Call ${member.name}`}
                    className={`inline-flex items-center gap-0.5 px-2 py-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-medium ${
                        hasProPlan
                            ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20"
                            : "text-muted-foreground hover:bg-muted border-border/60"
                    }`}
                >
                    <Phone className="size-3.5" />
                    <ChevronDown className="size-3 opacity-70" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-44 p-1 bg-card border-border shadow-lg"
            >
                {!hasProPlan && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 mb-1 rounded-md bg-violet-500/10 border border-violet-500/20">
                        <Sparkles className="size-3 text-violet-500 shrink-0" />
                        <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                            Pro Plan Required
                        </span>
                    </div>
                )}
                <button
                    onClick={() => {
                        if (!hasProPlan) {
                            handleLockedClick();
                            return;
                        }
                        setOpen(false);
                        onInitiateCall("voice");
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        hasProPlan
                            ? "text-foreground hover:bg-muted"
                            : "text-muted-foreground hover:bg-muted/60"
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <Phone className="size-3.5 text-emerald-500" />
                        Voice Call
                    </span>
                    {!hasProPlan && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/20 text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                            Pro
                        </span>
                    )}
                </button>
                <button
                    onClick={() => {
                        if (!hasProPlan) {
                            handleLockedClick();
                            return;
                        }
                        setOpen(false);
                        onInitiateCall("video");
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        hasProPlan
                            ? "text-foreground hover:bg-muted"
                            : "text-muted-foreground hover:bg-muted/60"
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <Video className="size-3.5 text-blue-500" />
                        Video Call
                    </span>
                    {!hasProPlan && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/20 text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                            Pro
                        </span>
                    )}
                </button>
            </PopoverContent>
        </Popover>
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
    const { initiateCall } = useCall();
    const { hasPermission, isOrgOwner } = usePermission();
    const canList = hasPermission(PERMISSIONS.MEMBERS_JOINED.LIST);
    const canView = hasPermission(PERMISSIONS.MEMBERS_JOINED.VIEW);
    const canEdit = hasPermission(PERMISSIONS.MEMBERS_JOINED.EDIT);
    const canDelete = hasPermission(PERMISSIONS.MEMBERS_JOINED.DELETE);
    const hasAnyAction = canView || canEdit || canDelete || canList;

    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );
    const { data: subscription } = useSubscriptionQuery();
    const hasProPlan = isAtLeastPlan(subscription?.plan, "pro");
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
                key: "status",
                label: "Status",
                render: (member) => (
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
            {
                key: "joinedAt",
                label: "Joined",
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
                          className: "w-28 text-right",
                          render: (member: Member) => (
                              <div className="flex items-center justify-end gap-1">
                                  {canList &&
                                      member.email !==
                                          localStorage.getItem("email") && (
                                          <MemberCallButton
                                              member={member}
                                              onInitiateCall={(type) =>
                                                  initiateCall(
                                                      member.userId ??
                                                          member.id,
                                                      member.name,
                                                      type,
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
        [hasAnyAction, canView, canEdit, canDelete],
    );

    const activeCount = members.filter((m) => m.status === "Active").length;
    const totalMembers = joinedMembers?.data?.pagination?.total ?? 0;
    const totalPages = joinedMembers?.data?.pagination?.totalPages ?? 1;

    return (
        <>
            <div className="p-6 space-y-5">
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
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
                            <span
                                className="size-1.5 rounded-full"
                                style={{ backgroundColor: "#798c5e" }}
                            />
                            <span className="text-xs font-medium text-foreground">
                                {activeCount} active
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    {hasPermission(PERMISSIONS.MEMBERS_INVITED.ADD) && (
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

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
