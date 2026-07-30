import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { roleSchema, type RoleFormValues } from "../schema/roleSchema";
import type { PermissionRow } from "../utils/permissionHelpers";
import {
    collectPermissionGraph,
    deriveAvailableFields,
    derivePermissionRowsFromPermissionItems,
    KNOWN_DEPENDENCIES,
    permissionDependents,
} from "../utils/permissionHelpers";
import {
    useFetchRoleByIdQuery,
    useFetchRolePermissionsQuery,
    useUpdateRoleMutation,
} from "../hooks/useRoles";
import { toast } from "sonner";

const INITIAL_PERMISSIONS: PermissionRow[] = [];

const EditRole = () => {
    const navigate = useNavigate();
    const { slug, roleId } = useParams<{ slug: string; roleId: string }>();
    const [permissions, setPermissions] =
        useState<PermissionRow[]>(INITIAL_PERMISSIONS);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const { data: roleData } = useFetchRoleByIdQuery(roleId as string);
    const { data: rolePermissions, isPending: isFetchingPermissions } =
        useFetchRolePermissionsQuery();
    const { mutate: updateRole, isPending: isSubmitting } =
        useUpdateRoleMutation(roleId as string);

    const availableFields = useMemo(
        () => deriveAvailableFields(rolePermissions?.data ?? []),
        [rolePermissions],
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    useEffect(() => {
        if (roleData?.data) {
            const role = roleData.data;

            setValue("name", role.name);
            setValue("description", role.description);

            const allAvailablePermissions = rolePermissions?.data ?? [];

            let permissionRows = derivePermissionRowsFromPermissionItems(
                allAvailablePermissions,
            );

            const rolePermissionCodenameSet = new Set(
                role.permissions?.map((p: any) => p.codename) ?? [],
            );

            permissionRows = permissionRows.map((permissionRow) => {
                const updatedFields = { ...permissionRow.fields };

                availableFields.forEach(({ field }) => {
                    const matchingPermission = allAvailablePermissions.find(
                        (item: any) => {
                            const codename = item.codename;
                            const parts = codename.split("_");
                            if (parts.length < 2) return false;

                            const permissionField = parts[parts.length - 1];
                            const permissionModule = parts
                                .slice(0, -1)
                                .join("_");

                            return (
                                permissionField === field &&
                                permissionModule ===
                                    permissionRow.module
                                        .toLowerCase()
                                        .replace(/\s+/g, "_")
                            );
                        },
                    );

                    updatedFields[field] = !!(
                        matchingPermission &&
                        rolePermissionCodenameSet.has(
                            matchingPermission.codename,
                        )
                    );
                });

                return { ...permissionRow, fields: updatedFields };
            });

            setPermissions(permissionRows);
        }
    }, [roleData, rolePermissions, setValue, availableFields]);

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
        permissions.every((permission) =>
            availableFields.every(({ field }) => permission.fields[field]),
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

        if (value) {
            setPermissionError(null);
        }
    };

    const columns = useMemo<DataTableColumn<PermissionRow>[]>(
        () => [
            {
                key: "module",
                label: "Permission",
                render: (row) => (
                    <span className="font-medium text-foreground">
                        {row.module}
                    </span>
                ),
            },
            ...availableFields.map(({ field, label }) => ({
                key: field,
                label,
                render: (row: PermissionRow) =>
                    row.permissionIds[field] ? (
                        <Switch
                            checked={row.fields[field] ?? false}
                            onCheckedChange={(value) =>
                                handlePermissionChange(row.module, field, value)
                            }
                            size="sm"
                            aria-label={`Toggle ${row.module} ${label}`}
                        />
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    ),
            })),
        ],
        [handlePermissionChange, availableFields],
    );

    const onSubmit = (data: RoleFormValues) => {
        const hasAnyPermission = permissions.some((permission) =>
            availableFields.some(({ field }) => permission.fields[field]),
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

        updateRole(payload, {
            onSuccess: () => {
                toast.success("Role updated successfully");
                navigate(`/${slug}/roles`);
            },
            onError: (error: any) => {
                const message =
                    error?.response?.data?.message ||
                    "An error occurred while updating the role.";
                toast.error(message);
            },
        });
    };

    return (
        <div className="p-4 sm:p-6 space-y-5">
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/${slug}/roles`)}
                    className="gap-1.5"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-lg font-semibold text-foreground">
                    Edit Role
                </h1>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-8"
            >
                <Card>
                    <CardHeader className="border-b border-border">
                        <CardTitle>Role Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Role Name{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Enter role name"
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
                                    placeholder="Enter role description"
                                    rows={3}
                                    aria-invalid={!!errors.description}
                                    className="resize-none"
                                    {...register("description")}
                                />
                                {errors.description && (
                                    <p className="text-xs text-destructive">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-xl font-semibold">Permissions</h3>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                                Select All
                            </span>

                            <Switch
                                checked={allSelected}
                                onCheckedChange={handleSelectAll}
                                aria-label="Select all permissions"
                            />
                        </div>
                    </div>

                    {permissionError && (
                        <p className="text-xs text-destructive">
                            {permissionError}
                        </p>
                    )}

                    <DataTable
                        columns={columns}
                        data={permissions}
                        getRowId={(row) => row.module}
                        showDefaultFooter={false}
                        loading={isFetchingPermissions}
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 pb-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/${slug}/roles`)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditRole;
