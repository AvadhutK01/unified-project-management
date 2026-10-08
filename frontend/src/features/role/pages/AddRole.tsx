import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { roleSchema, type RoleFormValues } from "../schema/roleSchema";
import type { PermissionRow } from "../utils/permissionHelpers";
import {
    useCreateRoleMutation,
    useFetchRolePermissionsQuery,
} from "../hooks/useRoles";
import { toast } from "sonner";
import {
    collectPermissionGraph,
    deriveAvailableFields,
    derivePermissionRowsFromPermissionItems,
    KNOWN_DEPENDENCIES,
    permissionDependents,
} from "../utils/permissionHelpers";

const INITIAL_PERMISSIONS: PermissionRow[] = [];

const AddRole = () => {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();

    const { data: rolePermissions, isPending: isFetchingPermissions } =
        useFetchRolePermissionsQuery();
    const { mutate: createRole, isPending: isSubmitting } =
        useCreateRoleMutation();

    const [permissions, setPermissions] =
        useState<PermissionRow[]>(INITIAL_PERMISSIONS);

    useEffect(() => {
        const items = rolePermissions?.data ?? [];
        setPermissions(derivePermissionRowsFromPermissionItems(items));
    }, [rolePermissions]);

    const availableFields = useMemo(
        () => deriveAvailableFields(rolePermissions?.data ?? []),
        [rolePermissions],
    );

    const [permissionError, setPermissionError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
    });

    const handlePermissionChange = useCallback(
        (module: string, field: string, value: boolean) => {
            setPermissions((prev) =>
                prev.map((permission) => {
                    if (permission.module !== module) {
                        return permission;
                    }

                    if (value) {
                        const requiredDependencies = collectPermissionGraph(
                            field,
                            KNOWN_DEPENDENCIES,
                        );

                        const updatedFields = { ...permission.fields };
                        updatedFields[field] = true;
                        requiredDependencies.forEach((dep) => {
                            updatedFields[dep] = true;
                        });

                        return { ...permission, fields: updatedFields };
                    }

                    if (field === "list") {
                        const dependents = collectPermissionGraph(
                            "list",
                            permissionDependents,
                        );

                        const updatedFields = { ...permission.fields };
                        updatedFields[field] = false;
                        dependents.forEach((dep) => {
                            updatedFields[dep] = false;
                        });

                        return { ...permission, fields: updatedFields };
                    }

                    if (field === "view") {
                        const dependents = collectPermissionGraph(
                            "view",
                            permissionDependents,
                        );

                        const updatedFields = { ...permission.fields };
                        updatedFields[field] = false;
                        dependents.forEach((dep) => {
                            updatedFields[dep] = false;
                        });

                        return { ...permission, fields: updatedFields };
                    }

                    return {
                        ...permission,
                        fields: {
                            ...permission.fields,
                            [field]: false,
                        },
                    };
                }),
            );

            if (value) {
                setPermissionError(null);
            }
        },
        [],
    );

    const allSelected =
        permissions.length > 0 &&
        availableFields.length > 0 &&
        permissions.every((p) =>
            availableFields.every(({ field }) => p.fields[field]),
        );

    const handleSelectAll = (value: boolean) => {
        setPermissions((prev) =>
            prev.map((permission) => {
                const updatedFields = { ...permission.fields };
                availableFields.forEach(({ field }) => {
                    updatedFields[field] = value;
                });
                return { ...permission, fields: updatedFields };
            }),
        );
        if (value) setPermissionError(null);
    };

    const columns = useMemo<DataTableColumn<PermissionRow>[]>(
        () => [
            {
                key: "module",
                label: "Module",
                render: (row) => (
                    <span className="font-medium text-foreground">
                        {row.module}
                    </span>
                ),
            },
            ...availableFields.map(({ field, label }) => ({
                key: field,
                label,
                className: "w-24 text-center",
                render: (row: PermissionRow) =>
                    row.permissionIds[field] ? (
                        <span className="flex justify-center">
                            <Checkbox
                                checked={row.fields[field] ?? false}
                                onCheckedChange={(value) =>
                                    handlePermissionChange(
                                        row.module,
                                        field,
                                        value === true,
                                    )
                                }
                                aria-label={`${label} ${row.module}`}
                            />
                        </span>
                    ) : (
                        <span className="block text-center text-muted-foreground/60">
                            —
                        </span>
                    ),
            })),
        ],
        [handlePermissionChange, availableFields],
    );

    const onSubmit = (data: RoleFormValues) => {
        const hasAnyPermission = permissions.some((p) =>
            availableFields.some(({ field }) => p.fields[field]),
        );

        if (!hasAnyPermission) {
            setPermissionError(
                "At least one permission must be selected across all modules.",
            );
            return;
        }

        const permissionIds = permissions.flatMap((permission) =>
            availableFields
                .filter(({ field }) => permission.fields[field])
                .map(({ field }) => permission.permissionIds[field])
                .filter((id): id is string => Boolean(id)),
        );

        const payload = {
            name: data.name,
            description: data.description,
            permissionIds,
        };

        createRole(payload, {
            onSuccess: () => {
                toast.success("Role created successfully");
                navigate(`/${slug}/roles`);
            },

            onError: (error: any) => {
                const message =
                    error?.response?.data?.message ||
                    "An error occurred while creating the role.";
                toast.error(message);
            },
        });
    };

    return (
        <PageContainer size="narrow" className="pb-0">
            <PageHeader
                breadcrumbs={[
                    { label: "Roles", to: `/${slug}/roles` },
                    { label: "Add role" },
                ]}
                title="Add role"
                description="Name the role and choose exactly which modules and actions it can access."
            />

            <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-6"
            >
                <SectionCard
                    title="Role details"
                    description="Shown to admins when assigning roles to members."
                >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Role name{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g. Project Manager"
                                aria-invalid={!!errors.name}
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="What is this role responsible for?"
                                rows={3}
                                aria-invalid={!!errors.description}
                                className="min-h-9 resize-none"
                                {...register("description")}
                            />
                            {errors.description && (
                                <p className="text-xs text-destructive">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>
                    </div>
                </SectionCard>

                <section className="space-y-3">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">
                                Permissions
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Dependent permissions (such as List for Edit)
                                are selected automatically.
                            </p>
                        </div>
                        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground shadow-xs">
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={(value) =>
                                    handleSelectAll(value === true)
                                }
                                aria-label="Select all permissions"
                            />
                            Select all
                        </label>
                    </div>

                    {permissionError && (
                        <p
                            role="alert"
                            className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                        >
                            {permissionError}
                        </p>
                    )}

                    <DataTable
                        columns={columns}
                        data={permissions}
                        getRowId={(row) => row.module}
                        showDefaultFooter={false}
                        loading={isFetchingPermissions}
                        stickyHeader
                        maxHeight="min(60vh, 560px)"
                    />
                </section>

                <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/${slug}/roles`)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating…" : "Create role"}
                    </Button>
                </div>
            </form>
        </PageContainer>
    );
};

export default AddRole;
