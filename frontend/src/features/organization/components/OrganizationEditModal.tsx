import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4 sm:px-6">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                            Update organization
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Edit organization details and save changes.
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={onClose}
                        className="shrink-0"
                    >
                        <X size={18} />
                    </Button>
                </div>
                <div className="space-y-5 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="org-name">Organization Name</Label>
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
                            <Label htmlFor="org-slug">Organization Slug</Label>
                            <Input
                                id="org-slug"
                                value={formState.slug}
                                onChange={(e) =>
                                    onFieldChange("slug", e.target.value)
                                }
                                aria-invalid={!!errors.slug}
                            />
                            {errors.slug && (
                                <p className="text-xs text-destructive">
                                    {errors.slug}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="org-website">Website URL</Label>
                            <Input
                                id="org-website"
                                value={formState.websiteUrl}
                                onChange={(e) =>
                                    onFieldChange("websiteUrl", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="org-status">Status</Label>
                            <select
                                id="org-status"
                                value={formState.status}
                                onChange={(e) =>
                                    onFieldChange("status", e.target.value)
                                }
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="org-description">Description</Label>
                        <Textarea
                            id="org-description"
                            value={formState.description}
                            onChange={(e) =>
                                onFieldChange("description", e.target.value)
                            }
                        />
                    </div>
                </div>
                <div className="flex shrink-0 flex-col gap-3 border-t border-border bg-background px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
