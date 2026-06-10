import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganizationStore } from "@/store/organization.store";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { OrganizationEditModal } from "../components/OrganizationEditModal";
import {
    useUpdateOrganization,
    useDeleteOrganization,
} from "../hooks/useOrganizations";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { toast } from "sonner";
import type { OrganizationFormState } from "../types/organization.types";

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
                <p className="text-muted-foreground">
                    No organization selected
                </p>
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

    return (
        <div className="space-y-6 p-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Organization Setup
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your organization details and settings
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={openEditModal}
                        variant="outline"
                        className="gap-2"
                    >
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>

                    <Button
                        onClick={handleDelete}
                        className="gap-2 bg-red-50 text-red-600 hover:bg-red-100"
                        disabled={isDeleting}
                    >
                        Delete
                    </Button>
                </div>
            </div>

            {/* Organization Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            {activeOrganization.logoUrl ? (
                                <img
                                    src={activeOrganization.logoUrl}
                                    alt={`${activeOrganization.name} logo`}
                                    className="h-20 w-20 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted text-lg font-semibold text-muted-foreground">
                                    {activeOrganization.name
                                        ?.slice(0, 2)
                                        .toUpperCase()}
                                </div>
                            )}
                            <div>
                                <CardTitle>{activeOrganization.name}</CardTitle>
                                <CardDescription className="mt-2">
                                    <span className="text-xs text-muted-foreground">
                                        Slug:{" "}
                                    </span>
                                    <code className="text-sm font-mono text-foreground">
                                        {activeOrganization.slug}
                                    </code>
                                </CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Description */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Description
                            </label>
                            <p className="mt-1 text-sm text-foreground">
                                {activeOrganization.description ||
                                    "No description provided"}
                            </p>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Status
                            </label>
                            <div className="mt-1">
                                <Badge
                                    variant={
                                        activeOrganization.status?.toLowerCase() ===
                                        "active"
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {activeOrganization.status
                                        ?.charAt(0)
                                        .toUpperCase() +
                                        activeOrganization.status?.slice(1)}
                                </Badge>
                            </div>
                        </div>

                        {/* Website */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Website
                            </label>
                            {activeOrganization.websiteUrl ? (
                                <a
                                    href={activeOrganization.websiteUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 text-sm text-primary hover:underline"
                                >
                                    {activeOrganization.websiteUrl}
                                </a>
                            ) : (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    No website provided
                                </p>
                            )}
                        </div>

                        {/* Created At */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Created At
                            </label>
                            <p className="mt-1 text-sm text-foreground">
                                {formatDate(activeOrganization.createdAt)}
                            </p>
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
