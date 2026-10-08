import { useState, useEffect } from "react";
import { X, Plus, Send, Trash2, UserPlus, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { inviteMembersSchema } from "@/features/members/schema/members.schema";
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
        <Dialog open onOpenChange={(o) => !o && handleClose()}>
            <DialogContent
                showCloseButton={false}
                className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg sm:p-0"
            >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UserPlus className="size-[18px]" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle>
                                {reInviteMode
                                    ? "Re-invite Team Member"
                                    : "Invite Team Members"}
                            </DialogTitle>
                            <DialogDescription className="mt-0.5">
                                {reInviteMode
                                    ? "Change the role and resend the invitation."
                                    : "Send invitations to multiple people at once."}
                            </DialogDescription>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        aria-label="Close"
                        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-2.5">
                    <div className="hidden sm:flex items-center gap-2 px-0.5 mb-1">
                        <span className="flex-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Email Address
                        </span>
                        <span className="w-36 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Role
                        </span>
                        <span className="size-8 shrink-0" />
                    </div>

                    {entries.map((entry, idx) => {
                        const errors = entryErrors[entry.id] ?? {};
                        return (
                            <div key={entry.id} className="flex flex-col gap-1">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                                                "h-9 w-full rounded-md border bg-card pr-3 pl-9 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/80 focus-visible:ring-3 dark:bg-input/20",
                                                reInviteMode &&
                                                    "cursor-not-allowed opacity-60",
                                                errors.email
                                                    ? "border-destructive focus-visible:ring-destructive/20"
                                                    : "border-input focus-visible:border-ring focus-visible:ring-ring/25",
                                            )}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={entry.role}
                                            onValueChange={(v) =>
                                                updateRole(entry.id, v)
                                            }
                                        >
                                            <SelectTrigger
                                                className={cn(
                                                    "w-full sm:w-36 shrink-0",
                                                    errors.role
                                                        ? "border-destructive"
                                                        : "border-border",
                                                )}
                                            >
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roleOptions.map(
                                                    (roleOption) => (
                                                        <SelectItem
                                                            key={roleOption.id}
                                                            value={
                                                                roleOption.id
                                                            }
                                                        >
                                                            {roleOption.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>

                                        <button
                                            onClick={() =>
                                                removeEntry(entry.id)
                                            }
                                            disabled={
                                                entries.length === 1 ||
                                                reInviteMode
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

                    {!reInviteMode && (
                        <button
                            onClick={addEntry}
                            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors pt-1"
                        >
                            <Plus className="size-3.5" />
                            Add another member
                        </button>
                    )}
                </div>

                <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-border bg-muted/30 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p className="text-xs text-muted-foreground text-center sm:text-left">
                        {reInviteMode
                            ? "Re-invite 1 member"
                            : `${entries.length} ${entries.length === 1 ? "invite" : "invites"} ready`}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="flex-1 sm:flex-none"
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
            </DialogContent>
        </Dialog>
    );
}
