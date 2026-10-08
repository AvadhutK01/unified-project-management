import { useMemo, useState } from "react";
import { Pencil, Plus, Shield, ShieldCheck, Users } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common/PageHeader";
import { IconAction, SearchInput, Toolbar } from "@/components/common/Toolbar";
import { EmptyState } from "@/components/common/EmptyState";
import { useNavigate, useParams } from "react-router-dom";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useFetchRolesQuery } from "../hooks/useRoles";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";
import { Button } from "@/components/ui/button";

interface Role {
    id: number;
    name: string;
    memberCount: number;
}

const Roles = () => {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const [search, setSearch] = useState("");

    const { data: roles = [], isPending: isLoading } = useFetchRolesQuery();
    const { hasPermission } = usePermission();
    const canEdit = hasPermission(PERMISSIONS.ROLES.EDIT);

    const columns = useMemo<DataTableColumn<Role>[]>(
        () => [
            {
                key: "name",
                label: "Name",
                render: (role) => (
                    <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                            <Shield className="size-4" />
                        </span>
                        {canEdit ? (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(`/${slug}/roles/edit/${role.id}`)
                                }
                                className="font-medium text-foreground hover:text-primary"
                            >
                                {role.name}
                            </button>
                        ) : (
                            <span className="font-medium text-foreground">
                                {role.name}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                key: "memberCount",
                label: "Members",
                render: (role) => (
                    <span className="tabular inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
                        <Users className="size-3.5" />
                        {role.memberCount}{" "}
                        {role.memberCount === 1 ? "member" : "members"}
                    </span>
                ),
            },
            ...(canEdit
                ? [
                      {
                          key: "actions" as const,
                          label: "",
                          className: "w-px text-right",
                          render: (role: Role) => (
                              <div className="flex justify-end">
                                  <IconAction
                                      label={`Edit ${role.name}`}
                                      icon={Pencil}
                                      onClick={() =>
                                          navigate(
                                              `/${slug}/roles/edit/${role.id}`,
                                          )
                                      }
                                  />
                              </div>
                          ),
                      },
                  ]
                : []),
        ],
        [navigate, slug, canEdit],
    );

    return (
        <PageContainer>
            <PageHeader
                title="Roles"
                description="Define what each role can see and do across the organization."
                actions={
                    hasPermission(PERMISSIONS.ROLES.ADD) && (
                        <Button onClick={() => navigate(`/${slug}/roles/add`)}>
                            <Plus />
                            Add role
                        </Button>
                    )
                }
            />

            <Toolbar>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search roles…"
                />
            </Toolbar>

            <DataTable
                columns={columns}
                data={roles?.data?.data || []}
                getRowId={(r: Role) => r.id}
                hasActiveFilters={search.length > 0}
                showDefaultFooter={false}
                loading={isLoading}
                emptyState={
                    <EmptyState
                        icon={ShieldCheck}
                        title="No roles yet"
                        description="Create a role to control what members can access."
                    />
                }
            />
        </PageContainer>
    );
};

export default Roles;
