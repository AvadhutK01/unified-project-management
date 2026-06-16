import { useState, useEffect } from "react";
import { X, Plus, Send, Trash2, UserPlus, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFetchRolesQuery } from "@/features/role/hooks/useRoles";
import {
    useInviteMembersMutation,
    useReInviteMembersMutation,
} from "@/features/members/hooks/useMembers";
import { inviteMembersSchema } from "@/features/members/schemas/members.schema";
import type {
    InviteEntry,
    InviteEntryErrors,
    InviteMembersModalProps,
    RoleOption,
} from "@/features/members/types/members.types";

const genId = () => Math.random().toString(36).slice(2, 9);
const newEntry = (email = ""): InviteEntry => ({
    id: genId(),
    email,
    role: "",
});

export function InviteMembersModal({
    open,
    onClose,
    reInviteMode = false,
    initialEmail = "",
}: InviteMembersModalProps) {
    const { data: roles } = useFetchRolesQuery();
    const roleOptions: RoleOption[] = roles?.data?.data ?? [];

    const { mutate: inviteMembers, isPending: isInviting } =
        useInviteMembersMutation();
    const { mutate: reInvite, isPending: isReInviting } =
        useReInviteMembersMutation();

    const [entries, setEntries] = useState<InviteEntry[]>(
        reInviteMode ? [newEntry(initialEmail)] : [newEntry()],
    );
    const [entryErrors, setEntryErrors] = useState<
        Record<string, InviteEntryErrors>
    >({});

    useEffect(() => {
        if (reInviteMode && initialEmail) {
            setEntries([newEntry(initialEmail)]);
        }
    }, [reInviteMode, initialEmail]);

    if (!open) return null;

    const updateEmail = (id: string, email: string) => {
        setEntries((prev) =>
            prev.map((e) => (e.id === id ? { ...e, email } : e)),
        );

        setEntryErrors((prev) => {
            const next = { ...prev };
            if (next[id]?.email) {
                const { email: _, ...rest } = next[id];
                if (Object.keys(rest).length > 0) {
                    next[id] = rest;
                } else {
                    delete next[id];
                }
            }
            return next;
        });
    };

    const updateRole = (id: string, role: string) => {
        setEntries((prev) =>
            prev.map((e) => (e.id === id ? { ...e, role } : e)),
        );

        setEntryErrors((prev) => {
            const next = { ...prev };
            if (next[id]?.role) {
                const { role: _, ...rest } = next[id];
                if (Object.keys(rest).length > 0) {
                    next[id] = rest;
                } else {
                    delete next[id];
                }
            }
            return next;
        });
    };

    const addEntry = () => setEntries((prev) => [...prev, newEntry()]);

    const removeEntry = (id: string) => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        setEntryErrors((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const handleClose = () => {
        setEntries([newEntry()]);
        setEntryErrors({});
        onClose();
    };

    const handleSubmit = () => {
        setEntryErrors({});

        if (reInviteMode) {
            const entry = entries[0];
            if (!entry.email || !entry.role) {
                const nextErrors: Record<string, InviteEntryErrors> = {};
                if (!entry.email)
                    nextErrors[entry.id] = { email: "Email is required" };
                if (!entry.role) {
                    nextErrors[entry.id] = {
                        ...nextErrors[entry.id],
                        role: "Role is required",
                    };
                }
                setEntryErrors(nextErrors);
                return;
            }

            reInvite(
                {
                    email: entry.email,
                    roleId: entry.role,
                },
                {
                    onSuccess: () => {
                        toast.success(`Re-invitation sent to ${entry.email}!`);
                        handleClose();
                    },
                    onError: (error: any) => {
                        const message =
                            error?.response?.data?.message ||
                            "Failed to send re-invitation.";
                        toast.error(message);
                    },
                },
            );
            return;
        }

        const parsed = inviteMembersSchema.safeParse({
            entries: entries.map(({ email, role }) => ({ email, role })),
        });

        if (!parsed.success) {
            const nextErrors: Record<string, InviteEntryErrors> = {};

            parsed.error.issues.forEach((issue) => {
                const [_, index, field] = issue.path;
                if (typeof index !== "number" || typeof field !== "string") {
                    return;
                }

                const entry = entries[index];
                if (!entry) return;

                nextErrors[entry.id] = {
                    ...nextErrors[entry.id],
                    [field]: issue.message,
                };
            });

            setEntryErrors(nextErrors);
            return;
        }

        inviteMembers(
            {
                invitations: entries.map(({ email, role }) => ({
                    email,
                    roleId: role,
                })),
            },
            {
                onSuccess: () => {
                    const count = entries.length;
                    toast.success(
                        `${count} invitation${count > 1 ? "s" : ""} sent successfully!`,
                    );
                    handleClose();
                },
                onError: (error: any) => {
                    const message =
                        error?.response?.data?.message ||
                        "Failed to send invitations.";
                    toast.error(message);
                },
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            <div className="relative z-10 w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
                <div className="flex items-start justify-between p-6 pb-5">
                    <div className="flex items-start gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <UserPlus className="size-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                {reInviteMode
                                    ? "Re-invite Team Member"
                                    : "Invite Team Members"}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {reInviteMode
                                    ? "Change the role and resend the invitation."
                                    : "Send invitations to multiple people at once."}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="h-px bg-border mx-6" />

                <div className="p-6 space-y-2.5 max-h-72 overflow-y-auto">
                    <div className="flex items-center gap-2 px-0.5 mb-1">
                        <span className="flex-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Email Address
                        </span>
                        <span className="w-30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Role
                        </span>
                        <span className="size-8 shrink-0" />
                    </div>

                    {entries.map((entry, idx) => {
                        const errors = entryErrors[entry.id] ?? {};
                        return (
                            <div key={entry.id} className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                                        <input
                                            type="email"
                                            placeholder="name@company.com"
                                            value={entry.email}
                                            onChange={(e) =>
                                                !reInviteMode &&
                                                updateEmail(
                                                    entry.id,
                                                    e.target.value,
                                                )
                                            }
                                            readOnly={reInviteMode}
                                            className={cn(
                                                "w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition",
                                                reInviteMode &&
                                                    "cursor-not-allowed opacity-60",
                                                errors.email
                                                    ? "border-destructive focus:ring-destructive/30 focus:border-destructive"
                                                    : "border-border focus:ring-ring/40 focus:border-primary",
                                            )}
                                        />
                                    </div>

                                    <Select
                                        value={entry.role}
                                        onValueChange={(v) =>
                                            updateRole(entry.id, v)
                                        }
                                    >
                                        <SelectTrigger
                                            className={cn(
                                                "w-36 shrink-0",
                                                errors.role
                                                    ? "border-destructive"
                                                    : "border-border",
                                            )}
                                        >
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roleOptions.map((roleOption) => (
                                                <SelectItem
                                                    key={roleOption.id}
                                                    value={roleOption.id}
                                                >
                                                    {roleOption.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <button
                                        onClick={() => removeEntry(entry.id)}
                                        disabled={
                                            entries.length === 1 || reInviteMode
                                        }
                                        title={
                                            reInviteMode
                                                ? "Cannot remove in re-invite mode"
                                                : entries.length === 1
                                                  ? "Need at least one entry"
                                                  : `Remove row ${idx + 1}`
                                        }
                                        className="size-8 shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>

                                {(errors.email || errors.role) && (
                                    <div className="flex flex-col gap-1 px-1">
                                        {errors.email && (
                                            <p className="text-xs text-destructive">
                                                {errors.email}
                                            </p>
                                        )}
                                        {errors.role && (
                                            <p className="text-xs text-destructive">
                                                {errors.role}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="px-6 pb-1">
                    {!reInviteMode && (
                        <button
                            onClick={addEntry}
                            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            <Plus className="size-3.5" />
                            Add another member
                        </button>
                    )}
                </div>

                <div className="h-px bg-border mx-6 mt-5" />

                <div className="flex items-center justify-between p-6 pt-4">
                    <p className="text-xs text-muted-foreground">
                        {reInviteMode
                            ? "Re-invite 1 member"
                            : `${entries.length} ${entries.length === 1 ? "invite" : "invites"} ready`}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={isInviting || isReInviting}
                        >
                            {isInviting || isReInviting ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    {reInviteMode
                                        ? "Re-inviting..."
                                        : "Sending..."}
                                </>
                            ) : (
                                <>
                                    <Send className="size-3.5" />
                                    {reInviteMode
                                        ? "Re-invite"
                                        : `Send ${entries.length > 1 ? `${entries.length} Invitations` : "Invitation"}`}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
