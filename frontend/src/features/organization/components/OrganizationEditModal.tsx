import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type FormState = {
    name: string;
    slug: string;
    websiteUrl: string;
    description: string;
    status: string;
};

const STATUS_OPTIONS = [
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending" },
    { label: "Archived", value: "archived" },
];

interface OrganizationEditModalProps {
    formState: FormState;
    errors: Partial<Record<keyof FormState, string>>;
    isSaving: boolean;
    onFieldChange: (field: keyof FormState, value: string) => void;
    onClose: () => void;
    onSave: () => void;
}

export function OrganizationEditModal({
    formState,
    errors,
    isSaving,
    onFieldChange,
    onClose,
    onSave,
}: OrganizationEditModalProps) {
    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl sm:p-0">
                <DialogHeader className="border-b border-border px-5 py-4 sm:px-6">
                    <DialogTitle>Edit organization</DialogTitle>
                    <DialogDescription>
                        Update your organization's profile details.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="flex min-h-0 flex-1 flex-col"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSave();
                    }}
                >
                    <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="org-name">
                                    Organization name
                                </Label>
                                <Input
                                    id="org-name"
                                    value={formState.name}
                                    onChange={(e) =>
                                        onFieldChange("name", e.target.value)
                                    }
                                    aria-invalid={!!errors.name}
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="org-slug">Slug</Label>
                                <Input
                                    id="org-slug"
                                    value={formState.slug}
                                    onChange={(e) =>
                                        onFieldChange("slug", e.target.value)
                                    }
                                    aria-invalid={!!errors.slug}
                                />
                                {errors.slug ? (
                                    <p className="text-xs text-destructive">
                                        {errors.slug}
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Used in your workspace URL.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="org-website">Website URL</Label>
                                <Input
                                    id="org-website"
                                    placeholder="https://"
                                    value={formState.websiteUrl}
                                    onChange={(e) =>
                                        onFieldChange(
                                            "websiteUrl",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="org-status">Status</Label>
                                <Select
                                    value={formState.status}
                                    onValueChange={(v) =>
                                        onFieldChange("status", v)
                                    }
                                >
                                    <SelectTrigger
                                        id="org-status"
                                        className="w-full"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="org-description">Description</Label>
                            <Textarea
                                id="org-description"
                                placeholder="What does your organization do?"
                                value={formState.description}
                                onChange={(e) =>
                                    onFieldChange("description", e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/30 px-5 py-3.5 sm:flex-row sm:justify-end sm:px-6">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="animate-spin" />}
                            {isSaving ? "Saving…" : "Save changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
