import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Shield } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useFetchRolesQuery } from "../hooks/useRoles";

interface Role {
    id: number;
    name: string;
    memberCount: number;
}

const Roles = () => {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const [search, setSearch] = useState("");

    const { data: roles = [] } = useFetchRolesQuery();

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
            {
                key: "actions",
                label: "Actions",
                className: "w-24 text-right",
                render: (role) => (
                    <div className="flex justify-end">
                        <button
                            title="Edit role"
                            onClick={() =>
                                navigate(`/${slug}/roles/edit/${role.id}`)
                            }
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [navigate, slug],
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
                    <button
                        onClick={() => navigate(`/${slug}/roles/add`)}
                        className="inline-flex items-center gap-2 px-4 py-1 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Add Role
                    </button>
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
                    // renderFooter={() => (
                    //     <div className="px-6 py-4 flex items-center justify-between gap-4">
                    //         <p className="text-xs text-muted-foreground">
                    //             {filtered.length === 0 ? (
                    //                 'No results'
                    //             ) : (
                    //                 <>
                    //                     Showing{' '}
                    //                     <span className="font-medium text-foreground">
                    //                         {start}–{end}
                    //                     </span>{' '}
                    //                     of{' '}
                    //                     <span className="font-medium text-foreground">
                    //                         {filtered.length}
                    //                     </span>
                    //                 </>
                    //             )}
                    //         </p>
                    //         <div className="flex items-center gap-2">
                    //             <button
                    //                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    //                 disabled={currentPage === 1}
                    //                 className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    //             >
                    //                 <ChevronLeft className="w-4 h-4" />
                    //             </button>
                    //             <span className="text-xs text-muted-foreground px-1">
                    //                 Page{' '}
                    //                 <span className="font-medium text-foreground">{currentPage}</span>
                    //                 {' '}of{' '}
                    //                 <span className="font-medium text-foreground">{totalPages}</span>
                    //             </span>
                    //             <button
                    //                 onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    //                 disabled={currentPage === totalPages}
                    //                 className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    //             >
                    //                 <ChevronRight className="w-4 h-4" />
                    //             </button>
                    //         </div>
                    //     </div>
                    // )}
                />
            </div>
        </div>
    );
};

export default Roles;
