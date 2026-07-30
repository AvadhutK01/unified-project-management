import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganizationStore } from "@/store/organization.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Edit,
    Trash2,
    Globe,
    Calendar,
    FileText,
    Hash,
    Shield,
    Building2,
    ExternalLink,
    Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { OrganizationEditModal } from "../components/OrganizationEditModal";
import {
    useUpdateOrganization,
    useDeleteOrganization,
} from "../hooks/useOrganizations";
import { useConfirm } from "@/providers/ConfirmProvider";
import { toast } from "sonner";
import type { OrganizationFormState } from "../types/organization.types";

const STATUS_STYLES: Record<string, string> = {
    active: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    pending:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    archived:
        "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700",
};

const OrganizationInfo = () => {
    const {
        activeOrganization,
        setActiveOrganization,
        clearActiveOrganization,
    } = useOrganizationStore();
    const updateOrganization = useUpdateOrganization();
    const { mutate: deleteOrganization, isPending: isDeleting } =
        useDeleteOrganization();
    const confirm = useConfirm();
    const navigate = useNavigate();

    const [showEditModal, setShowEditModal] = useState(false);
    const [formState, setFormState] = useState<OrganizationFormState>({
        name: "",
        slug: "",
        websiteUrl: "",
        description: "",
        status: "active",
    });
    const [errors, setErrors] = useState<
        Partial<Record<keyof OrganizationFormState, string>>
    >({});

    if (!activeOrganization) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Building2 className="size-10" />
                    <p>No organization selected</p>
                </div>
            </div>
        );
    }

    const openEditModal = () => {
        setFormState({
            name: activeOrganization.name,
            slug: activeOrganization.slug,
            websiteUrl: activeOrganization.websiteUrl ?? "",
            description: activeOrganization.description ?? "",
            status: activeOrganization.status?.toLowerCase() ?? "active",
        });
        setErrors({});
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setErrors({});
    };

    const setField = (field: keyof typeof formState, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSave = () => {
        const newErrors: typeof errors = {};
        if (!formState.name.trim()) {
            newErrors.name = "Organization name is required";
        }
        if (!formState.slug.trim()) {
            newErrors.slug = "Organization slug is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        updateOrganization.mutate(
            {
                id: activeOrganization.id,
                payload: {
                    name: formState.name,
                    slug: formState.slug,
                    websiteUrl: formState.websiteUrl || null,
                    description: formState.description || null,
                    status: formState.status,
                },
            },
            {
                onSuccess: (response) => {
                    toast.success("Organization updated successfully");
                    setActiveOrganization(response);
                    closeEditModal();
                },
                onError: (error: any) => {
                    toast.dismiss();
                    toast.error(
                        error?.response?.data?.message ||
                            "Failed to update organization. Please try again.",
                    );
                },
            },
        );
    };

    const handleDelete = async () => {
        if (!activeOrganization) return;

        const confirmed = await confirm({
            title: `Delete ${activeOrganization.name}?`,
            description:
                "This action will permanently delete the organization and cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
        });
        if (!confirmed) return;

        deleteOrganization(activeOrganization.id, {
            onSuccess: () => {
                toast.success("Organization deleted");
                clearActiveOrganization();
                navigate("/org-setup/select", { replace: true });
            },
            onError: (err: any) => {
                toast.dismiss();
                toast.error(
                    err?.response?.data?.message ||
                        "Failed to delete organization. Please try again.",
                );
            },
        });
    };

    const statusKey = activeOrganization.status?.toLowerCase() ?? "active";

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-lg font-semibold text-foreground">
                        Organization
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage your organization details and settings
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={openEditModal}
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                    >
                        <Edit className="size-4" />
                        Edit
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Trash2 className="size-4" />
                        )}
                        Delete
                    </Button>
                </div>
            </div>

            {/* Organization Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        {activeOrganization.logoUrl ? (
                            <img
                                src={activeOrganization.logoUrl}
                                alt={`${activeOrganization.name} logo`}
                                className="size-14 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary shrink-0">
                                {activeOrganization.name
                                    ?.slice(0, 2)
                                    .toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0">
                            <CardTitle className="text-lg truncate">
                                {activeOrganization.name}
                            </CardTitle>
                            <Badge
                                variant="outline"
                                className={`mt-1.5 ${STATUS_STYLES[statusKey] ?? ""}`}
                            >
                                {activeOrganization.status
                                    ?.charAt(0)
                                    .toUpperCase() +
                                    activeOrganization.status?.slice(1)}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Slug */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Hash className="size-4" />
                                <span>Slug</span>
                            </div>
                            <code className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded-md block w-fit">
                                {activeOrganization.slug}
                            </code>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Shield className="size-4" />
                                <span>Status</span>
                            </div>
                            <Badge
                                variant="outline"
                                className={STATUS_STYLES[statusKey] ?? ""}
                            >
                                {activeOrganization.status
                                    ?.charAt(0)
                                    .toUpperCase() +
                                    activeOrganization.status?.slice(1)}
                            </Badge>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <FileText className="size-4" />
                                <span>Description</span>
                            </div>
                            <p className="text-sm text-foreground">
                                {activeOrganization.description ||
                                    "No description provided"}
                            </p>
                        </div>

                        {/* Website */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Globe className="size-4" />
                                <span>Website</span>
                            </div>
                            {activeOrganization.websiteUrl ? (
                                <a
                                    href={activeOrganization.websiteUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline break-all"
                                >
                                    {activeOrganization.websiteUrl}
                                    <ExternalLink className="size-3 shrink-0" />
                                </a>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No website provided
                                </p>
                            )}
                        </div>

                        {/* Created At */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Calendar className="size-4" />
                                <span>Created</span>
                            </div>
                            <p className="text-sm text-foreground">
                                {formatDate(activeOrganization.createdAt)}
                            </p>
                        </div>

                        {/* Org ID */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Building2 className="size-4" />
                                <span>Organization ID</span>
                            </div>
                            <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md block w-fit">
                                {activeOrganization.id}
                            </code>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Modal */}
            {showEditModal && (
                <OrganizationEditModal
                    formState={formState}
                    errors={errors}
                    isSaving={updateOrganization.isPending}
                    onFieldChange={setField}
                    onClose={closeEditModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default OrganizationInfo;
