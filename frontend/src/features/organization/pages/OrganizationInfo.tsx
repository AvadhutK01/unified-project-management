import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganizationStore } from "@/store/organization.store";
import { Button } from "@/components/ui/button";
import {
    Pencil,
    Trash2,
    Globe,
    Calendar,
    FileText,
    AtSign,
    Shield,
    Building2,
    ExternalLink,
    Loader2,
    Copy,
    Check,
    AlertTriangle,
} from "lucide-react";
import { formatDate, getColor } from "@/lib/utils";
import { OrganizationEditModal } from "../components/OrganizationEditModal";
import {
    useUpdateOrganization,
    useDeleteOrganization,
} from "../hooks/useOrganizations";
import { useConfirm } from "@/providers/ConfirmProvider";
import { toast } from "sonner";
import type { OrganizationFormState } from "../types/organization.types";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { OrganizationAvatar } from "@/components/common/OrgSwitcher";
import { SimpleTooltip } from "@/components/ui/tooltip";
import type { Tone } from "@/lib/tones";

const STATUS_TONE: Record<string, Tone> = {
    active: "success",
    pending: "warning",
    archived: "neutral",
};

function Field({
    icon: Icon,
    label,
    children,
    className,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon className="size-3.5" />
                {label}
            </dt>
            <dd className="mt-1.5 text-sm text-foreground">{children}</dd>
        </div>
    );
}

function CopyValue({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-muted/60 py-0.5 pr-0.5 pl-2">
            <code className="truncate font-mono text-xs text-foreground">
                {value}
            </code>
            <SimpleTooltip label={copied ? "Copied" : "Copy"}>
                <button
                    type="button"
                    aria-label={`Copy ${value}`}
                    onClick={() => {
                        navigator.clipboard?.writeText(value).then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                        });
                    }}
                    className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                    {copied ? (
                        <Check className="size-3.5 text-success" />
                    ) : (
                        <Copy className="size-3.5" />
                    )}
                </button>
            </SimpleTooltip>
        </span>
    );
}

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
            <PageContainer>
                <EmptyState
                    icon={Building2}
                    title="No organization selected"
                    description="Choose a workspace to view its details."
                />
            </PageContainer>
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
    const statusLabel =
        (activeOrganization.status?.charAt(0).toUpperCase() ?? "") +
        (activeOrganization.status?.slice(1) ?? "");

    return (
        <PageContainer size="narrow">
            <PageHeader
                title="Organization"
                description="Manage your organization's profile and settings."
                actions={
                    <Button onClick={openEditModal} variant="outline">
                        <Pencil />
                        Edit details
                    </Button>
                }
            />

            <SectionCard flush>
                <div className="flex items-center gap-4 border-b border-border px-5 py-5">
                    <OrganizationAvatar
                        organization={activeOrganization}
                        color={getColor(activeOrganization.slug)}
                        className="size-14 rounded-xl text-lg"
                    />
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
                            {activeOrganization.name}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <StatusBadge
                                tone={STATUS_TONE[statusKey] ?? "neutral"}
                            >
                                {statusLabel}
                            </StatusBadge>
                            <span className="text-[13px] text-muted-foreground">
                                /{activeOrganization.slug}
                            </span>
                        </div>
                    </div>
                </div>

                <dl className="grid gap-x-8 gap-y-6 p-5 sm:grid-cols-2">
                    <Field icon={AtSign} label="Slug">
                        <CopyValue value={activeOrganization.slug} />
                    </Field>
                    <Field icon={Shield} label="Status">
                        <StatusBadge tone={STATUS_TONE[statusKey] ?? "neutral"}>
                            {statusLabel}
                        </StatusBadge>
                    </Field>
                    <Field icon={Globe} label="Website">
                        {activeOrganization.websiteUrl ? (
                            <a
                                href={activeOrganization.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 break-all text-primary hover:underline"
                            >
                                {activeOrganization.websiteUrl}
                                <ExternalLink className="size-3 shrink-0" />
                            </a>
                        ) : (
                            <span className="text-muted-foreground">
                                No website provided
                            </span>
                        )}
                    </Field>
                    <Field icon={Calendar} label="Created">
                        {formatDate(activeOrganization.createdAt)}
                    </Field>
                    <Field
                        icon={FileText}
                        label="Description"
                        className="sm:col-span-2"
                    >
                        {activeOrganization.description ? (
                            <p className="leading-relaxed">
                                {activeOrganization.description}
                            </p>
                        ) : (
                            <span className="text-muted-foreground">
                                No description provided
                            </span>
                        )}
                    </Field>
                    <Field
                        icon={Building2}
                        label="Organization ID"
                        className="sm:col-span-2"
                    >
                        <CopyValue value={activeOrganization.id} />
                    </Field>
                </dl>
            </SectionCard>

            <section className="overflow-hidden rounded-xl border border-destructive/30 bg-card">
                <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/[0.04] px-5 py-3">
                    <AlertTriangle className="size-4 text-destructive" />
                    <h2 className="text-sm font-semibold text-destructive">
                        Danger zone
                    </h2>
                </div>
                <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Delete this organization
                        </p>
                        <p className="mt-0.5 text-[13px] text-muted-foreground">
                            Permanently removes the organization, its projects
                            and all associated data. This cannot be undone.
                        </p>
                    </div>
                    <Button
                        onClick={handleDelete}
                        variant="danger"
                        className="shrink-0"
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <Trash2 />
                        )}
                        Delete organization
                    </Button>
                </div>
            </section>

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
        </PageContainer>
    );
};

export default OrganizationInfo;
