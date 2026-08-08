import React, { useState, useEffect } from "react";
import {
    X,
    Search,
    Send,
    CheckSquare,
    Square,
    Users,
    Sparkles,
} from "lucide-react";
import { api } from "@/lib/axios";
import { useOrganizationStore } from "@/store/organization.store";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { toast } from "sonner";

interface Member {
    id: string;
    userId?: string;
    name: string;
    email: string;
    roleName?: string;
}

interface ForwardModalProps {
    isOpen: boolean;
    selectedMessagesCount: number;
    activeRecipientId?: string | null;
    onClose: () => void;
    onConfirmForward: (recipientIds: string[]) => Promise<void>;
}

export const ForwardModal: React.FC<ForwardModalProps> = ({
    isOpen,
    selectedMessagesCount,
    activeRecipientId,
    onClose,
    onConfirmForward,
}) => {
    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );
    const orgId = activeOrganization?.id;

    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUserEmail = localStorage.getItem("email")?.toLowerCase();

    useEffect(() => {
        if (isOpen && orgId) {
            fetchMembers();
            setSelectedMemberIds([]);
            setSearch("");
        }
    }, [isOpen, orgId]);

    const fetchMembers = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(
                `/organizations/members?type=joined&page=1&limit=50`,
                {
                    headers: { "x-organization-id": orgId },
                },
            );

            if (res.data?.status === "success") {
                const rawList = res.data.data?.data || [];
                const parsedList: Member[] = rawList.map((m: any) => {
                    const actualUserId = m.memberId || m.userId || m.id;
                    return {
                        id: actualUserId,
                        userId: actualUserId,
                        name: m.name || m.username || "Member",
                        email: m.email || "",
                        roleName: m.roleName || "",
                    };
                });

                const availableMembers = parsedList.filter(
                    (m) =>
                        m.email?.toLowerCase() !== currentUserEmail &&
                        m.id !== activeRecipientId &&
                        m.userId !== activeRecipientId,
                );

                setMembers(availableMembers);
            }
        } catch (err: any) {
            console.error("Failed to fetch members for forwarding:", err);
            toast.error("Failed to load members list.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelectMember = (id: string) => {
        setSelectedMemberIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const handleConfirm = async () => {
        if (!selectedMemberIds.length || isSubmitting) return;
        try {
            setIsSubmitting(true);
            await onConfirmForward(selectedMemberIds);
            onClose();
        } catch (err: any) {
            toast.error(err?.message || "Failed to forward messages.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const filteredMembers = members.filter(
        (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/80 backdrop-blur-md">
                    <div>
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Send className="size-4 text-primary" />
                            Forward Message
                            {selectedMessagesCount > 1 ? "s" : ""}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Forwarding {selectedMessagesCount} selected message
                            {selectedMessagesCount > 1 ? "s" : ""}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        <X className="size-4" />
                    </button>
                </div>
                <div className="p-4 border-b border-border bg-background/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search members by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-[220px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center gap-1">
                            <Sparkles className="size-6 text-muted-foreground/40" />
                            <p className="text-xs text-muted-foreground">
                                No other members available to forward
                            </p>
                        </div>
                    ) : (
                        filteredMembers.map((member) => {
                            const isSelected = selectedMemberIds.includes(
                                member.id,
                            );
                            return (
                                <div
                                    key={member.id}
                                    onClick={() =>
                                        toggleSelectMember(member.id)
                                    }
                                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                                        isSelected
                                            ? "bg-primary/10 border border-primary/20"
                                            : "hover:bg-muted/70"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <MemberAvatar
                                            name={member.name}
                                            size="sm"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-foreground truncate">
                                                {member.name}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground truncate">
                                                {member.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-primary shrink-0 pl-2">
                                        {isSelected ? (
                                            <CheckSquare className="size-5" />
                                        ) : (
                                            <Square className="size-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="p-4 border-t border-border bg-card flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                        {selectedMemberIds.length} recipient
                        {selectedMemberIds.length !== 1 ? "s" : ""} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-3.5 py-1.5 text-xs font-medium rounded-xl border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedMemberIds.length || isSubmitting}
                            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                            {isSubmitting ? (
                                <div className="size-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send className="size-3.5" />
                            )}
                            <span>Send Forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
