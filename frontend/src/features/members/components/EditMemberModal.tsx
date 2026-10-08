import { useEffect, useState } from "react";
import { X, UserCog, Loader2, User, Phone } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useFetchRolesQuery } from "@/features/role/hooks/useRoles";
import {
    useMemberByIdQuery,
    useUpdateMemberMutation,
} from "@/features/members/hooks/useMembers";
import type { RoleOption } from "@/features/members/types/members.types";

interface EditMemberModalProps {
    open: boolean;
    memberId: string | null;
    onClose: () => void;
}

export function EditMemberModal({
    open,
    memberId,
    onClose,
}: EditMemberModalProps) {
    const { data: roles } = useFetchRolesQuery();
    const roleOptions: RoleOption[] = roles?.data?.data ?? [];

    const { data: memberData, isLoading: isLoadingMember } =
        useMemberByIdQuery(memberId);
    const { mutate: updateMemberMutation, isPending: isUpdating } =
        useUpdateMemberMutation();

    const [roleId, setRoleId] = useState("");
    const [status, setStatus] = useState("active");

    const member = memberData?.data;

    useEffect(() => {
        if (member) {
            setRoleId(member.roleId ?? "");
            setStatus(member.status === "active" ? "active" : "inactive");
        }
    }, [member]);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    const handleClose = () => {
        setRoleId("");
        setStatus("Active");
        onClose();
    };

    const handleSave = () => {
        if (!memberId) return;

        updateMemberMutation(
            { id: memberId, roleId, status: status.toLowerCase() },
            {
                onSuccess: () => {
                    toast.success(
                        `${member?.username ?? "Member"} updated successfully.`,
                    );
                    handleClose();
                },
                onError: (error: any) => {
                    toast.error(
                        error?.response?.data?.message ||
                            "Failed to update member.",
                    );
                },
            },
        );
    };

    if (!open) return null;

    const initials = member?.username
        ? member.username
              .split(" ")
              .map((n: string) => n.charAt(0))
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "??";

    return (
        <Dialog open onOpenChange={(o) => !o && handleClose()}>
            <DialogContent
                showCloseButton={false}
                className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg sm:p-0"
            >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UserCog className="size-[18px]" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle>Edit Member</DialogTitle>
                            <DialogDescription className="mt-0.5">
                                Update member role and status.
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

                {isLoadingMember ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : member ? (
                    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
                        <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/40 p-4">
                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {member.username}
                                    </p>
                                </div>
                                <p className="text-sm text-muted-foreground truncate mt-0.5">
                                    {member.email}
                                </p>
                                {member.phoneNumber && (
                                    <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5 mt-1">
                                        <Phone className="size-3" />
                                        {member.phoneNumber}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="edit-role"
                                className="text-xs font-medium text-muted-foreground"
                            >
                                Role
                            </Label>
                            <Select value={roleId} onValueChange={setRoleId}>
                                <SelectTrigger
                                    id="edit-role"
                                    className="w-full"
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
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="edit-status"
                                className="text-xs font-medium text-muted-foreground"
                            >
                                Status
                            </Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger
                                    id="edit-status"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        <span className="flex items-center gap-2">
                                            <span className="size-2 shrink-0 rounded-full bg-success" />
                                            Active
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        <span className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-muted-foreground shrink-0" />
                                            Inactive
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="onleave">
                                        <span className="flex items-center gap-2">
                                            <span className="size-2 shrink-0 rounded-full bg-warning" />
                                            On Leave
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                        <User className="size-8 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                            Member not found.
                        </p>
                    </div>
                )}

                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3.5 sm:px-6">
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
                        onClick={handleSave}
                        disabled={isUpdating || isLoadingMember || !member}
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="size-3.5 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
