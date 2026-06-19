import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Shield } from "lucide-react";
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
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Shield className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">
                            {role.name}
                        </span>
                    </div>
                ),
            },
            {
                key: "memberCount",
                label: "Members",
                render: (role) => (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {role.memberCount}{" "}
                        {role.memberCount === 1 ? "member" : "members"}
                    </span>
                ),
            },
            ...(canEdit
                ? [
                      {
                          key: "actions" as const,
                          label: "Actions",
                          className: "w-24 text-right",
                          render: (role: Role) => (
                              <div className="flex justify-end">
                                  <button
                                      title="Edit role"
                                      onClick={() =>
                                          navigate(
                                              `/${slug}/roles/edit/${role.id}`,
                                          )
                                      }
                                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                  >
                                      <Pencil className="w-4 h-4" />
                                  </button>
                              </div>
                          ),
                      },
                  ]
                : []),
        ],
        [navigate, slug, canEdit],
    );

    return (
        <div className="p-6 space-y-5">
            <div className="bg-card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">
                            Manage Roles
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Define and manage access roles for your team
                        </p>
                    </div>
                </div>

                <div className="py-4 flex justify-between">
                    {hasPermission(PERMISSIONS.ROLES.ADD) && (
                        <Button onClick={() => navigate(`/${slug}/roles/add`)}>
                            <Plus className="w-4 h-4" />
                            Add Role
                        </Button>
                    )}
                    <div className="relative min-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search roles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary transition"
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={roles?.data?.data || []}
                    getRowId={(r: Role) => r.id}
                    hasActiveFilters={search.length > 0}
                    showDefaultFooter={false}
                    loading={isLoading}
                />
            </div>
        </div>
    );
};

export default Roles;
