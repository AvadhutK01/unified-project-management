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

    const { data: rolePermissions } = useFetchRolePermissionsQuery();
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
        <div className="p-6 space-y-5">
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
                    Add Role
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
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Permissions</h3>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                                Select All Permissions
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
                        {isSubmitting ? "Creating..." : "Create Role"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddRole;
