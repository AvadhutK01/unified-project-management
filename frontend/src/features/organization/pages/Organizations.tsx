import { useState } from "react";
import { DataTable } from "@/components/common/DataTable";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    useOrganizationsQuery,
    useUpdateOrganization,
} from "../hooks/useOrganizations";
import { OrganizationEditModal } from "../components/OrganizationEditModal";
import type { Organization } from "../api/organization.api";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { OrganizationFormState } from "../types/organization.types";
import { useNavigate } from "react-router-dom";

const columns = [
    {
        key: "name",
        label: "Organization",
        render: (row: Organization) => (
            <div className="flex items-center gap-3">
                {row.logoUrl ? (
                    <img
                        src={row.logoUrl}
                        alt={`${row.name} logo`}
                        className="h-10 w-10 rounded-xl object-cover"
                    />
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-xs font-semibold text-muted-foreground">
                        {row.name?.slice(0, 2).toUpperCase()}
                    </div>
                )}
                <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-medium text-foreground truncate">
                        {row.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                        {row.slug}
                    </span>
                </div>
            </div>
        ),
    },
    {
        key: "description",
        label: "Description",
        render: (row: Organization) => (
            <span className="text-sm text-muted-foreground line-clamp-2">
                {row.description || "—"}
            </span>
        ),
        className: "max-w-xl",
    },
    {
        key: "status",
        label: "Status",
        render: (row: Organization) => {
            const status = row.status?.toLowerCase();
            return (
                <span
                    className={
                        "inline-flex rounded-full px-2 py-1 text-xs font-semibold " +
                        (status === "active"
                            ? "bg-green-100 text-green-700"
                            : status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : status === "archived"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-muted/70 text-muted-foreground")
                    }
                >
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
            );
        },
    },
    {
        key: "websiteUrl",
        label: "Website",
        render: (row: Organization) => (
            <a
                href={row.websiteUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm text-primary hover:underline"
            >
                {row.websiteUrl || "—"}
            </a>
        ),
    },
    {
        key: "createdAt",
        label: "Created At",
        render: (row: Organization) => (
            <span className="text-sm text-muted-foreground">
                {formatDate(row.createdAt)}
            </span>
        ),
    },
];

const Organizations = () => {
    const navigate = useNavigate();
    const { data, isLoading, isError } = useOrganizationsQuery();
    const organizations = data?.data.organizations ?? [];
    const updateOrganization = useUpdateOrganization();

    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [editingOrganization, setEditingOrganization] =
        useState<Organization | null>(null);
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

    const openEditModal = (organization: Organization) => {
        setEditingOrganization(organization);
        setFormState({
            name: organization.name,
            slug: organization.slug,
            websiteUrl: organization.websiteUrl ?? "",
            description: organization.description ?? "",
            status: organization.status?.toLowerCase() ?? "active",
        });
        setErrors({});
    };

    const closeEditModal = () => {
        setEditingOrganization(null);
        setErrors({});
    };

    const setField = (field: keyof typeof formState, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSave = () => {
        if (!editingOrganization) return;

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
                id: editingOrganization.id,
                payload: {
                    name: formState.name,
                    slug: formState.slug,
                    websiteUrl: formState.websiteUrl || null,
                    description: formState.description || null,
                    status: formState.status,
                },
            },
            {
                onSuccess: () => {
                    toast.success("Organization updated successfully");
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

    return (
        <div className="space-y-6 p-6 h-[calc(100vh-65px)]">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Organization management
                    </p>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Organizations
                    </h1>
                </div>
                <Button
                    onClick={() => navigate(`/org-setup/create`)}
                    variant="default"
                    type="button"
                >
                    Add organization
                </Button>
            </div>

            {isError ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
                    Failed to load organizations. Please refresh the page.
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={organizations}
                    loading={isLoading}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    renderRowActions={(row) => (
                        <Button
                            variant="ghost"
                            type="button"
                            className="text-primary hover:text-primary/80"
                            onClick={() => openEditModal(row)}
                        >
                            <Edit size={16} />
                        </Button>
                    )}
                    renderFooter={({ count }) => (
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-sm text-muted-foreground p-3">
                            <span>
                                Showing{" "}
                                <span className="font-medium text-foreground">
                                    {count}
                                </span>{" "}
                                organizations
                            </span>
                        </div>
                    )}
                />
            )}

            {editingOrganization && (
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

export default Organizations;
