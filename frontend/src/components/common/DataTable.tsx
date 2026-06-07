import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// ─── Column definition ────────────────────────────────────────────────────────

export interface DataTableColumn<T> {
    key: string;
    label: string;
    /** Extra className applied to both <th> and <td> (e.g. "hidden md:table-cell") */
    className?: string;
    /** Custom cell renderer. Falls back to `String(row[key])` when omitted. */
    render?: (row: T, index: number) => React.ReactNode;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data: T[];
    /** Unique id extractor for each row. Defaults to `(row, i) => i`. */
    getRowId?: (row: T, index: number) => string | number;

    // Loading
    loading?: boolean;
    /** How many skeleton rows to show while loading. Default: 5. */
    skeletonRows?: number;

    // Empty / no-results
    /** Shown when `data` is empty and `hasActiveFilters` is false. */
    emptyState?: React.ReactNode;
    /** Shown when `data` is empty and `hasActiveFilters` is true. */
    noResultsState?: React.ReactNode;
    /** When true the no-results state is shown instead of the empty state. */
    hasActiveFilters?: boolean;

    // Row selection (optional)
    selectable?: boolean;
    selectedIds?: (string | number)[];
    onSelectionChange?: (ids: (string | number)[]) => void;

    // Per-row actions column (optional)
    renderRowActions?: (row: T, index: number) => React.ReactNode;

    // Footer (optional)
    /** Custom footer content. Receives `{ count, selectedCount }`. */
    renderFooter?: (ctx: {
        count: number;
        selectedCount: number;
        clearSelection: () => void;
    }) => React.ReactNode;
    /** Show the default "Showing N rows · M selected" footer. Default: true. */
    showDefaultFooter?: boolean;

    // Bulk action bar (optional, shown above table when rows are selected)
    renderBulkActions?: (ctx: {
        selectedIds: (string | number)[];
        clearSelection: () => void;
    }) => React.ReactNode;

    className?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton({
    cols,
    rows,
    selectable,
    hasActions,
}: {
    cols: number;
    rows: number;
    selectable: boolean;
    hasActions: boolean;
}) {
    // const totalCols = cols + (selectable ? 1 : 0) + (hasActions ? 1 : 0);
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                    {selectable && (
                        <td className="px-4 py-3.5 w-10">
                            <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                        </td>
                    )}
                    {Array.from({ length: cols }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5">
                            <div
                                className="h-3.5 rounded bg-muted animate-pulse"
                                style={{
                                    width: `${60 + ((i * 3 + j * 7) % 40)}%`,
                                }}
                            />
                        </td>
                    ))}
                    {hasActions && (
                        <td className="px-4 py-3.5 w-16">
                            <div className="h-4 w-4 bg-muted rounded animate-pulse ml-auto" />
                        </td>
                    )}
                </tr>
            ))}
        </>
    );
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable<T extends object>({
    columns,
    data,
    getRowId = (_, i) => i,
    loading = false,
    skeletonRows = 5,
    emptyState,
    noResultsState,
    hasActiveFilters = false,
    selectable = false,
    selectedIds = [],
    onSelectionChange,
    renderRowActions,
    renderFooter,
    showDefaultFooter = true,
    renderBulkActions,
    className,
}: DataTableProps<T>) {
    const totalSpan =
        columns.length + (selectable ? 1 : 0) + (renderRowActions ? 1 : 0);

    const allSelected = data.length > 0 && selectedIds.length === data.length;
    const someSelected = selectedIds.length > 0 && !allSelected;

    const handleSelectAll = (checked: boolean) => {
        onSelectionChange?.(
            checked ? data.map((row, i) => getRowId(row, i)) : [],
        );
    };

    const handleSelectRow = (id: string | number, checked: boolean) => {
        onSelectionChange?.(
            checked
                ? [...selectedIds, id]
                : selectedIds.filter((sid) => sid !== id),
        );
    };

    const clearSelection = () => onSelectionChange?.([]);

    // ── Empty / no-results fallback ──
    const defaultEmpty = (
        <tr>
            <td colSpan={totalSpan}>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                        No data
                    </p>
                </div>
            </td>
        </tr>
    );

    const defaultNoResults = (
        <tr>
            <td colSpan={totalSpan}>
                <div className="flex flex-col items-center justify-center py-14 text-center">
                    <p className="text-sm font-medium mb-1">No results found</p>
                    <p className="text-xs text-muted-foreground">
                        Try adjusting your search or filters.
                    </p>
                </div>
            </td>
        </tr>
    );

    const emptyRow =
        data.length === 0 && !loading
            ? hasActiveFilters
                ? (noResultsState ?? defaultNoResults)
                : (emptyState ?? defaultEmpty)
            : null;

    // ── Footer ──
    const footerContent = (() => {
        if (loading || data.length === 0) return null;
        if (renderFooter)
            return renderFooter({
                count: data.length,
                selectedCount: selectedIds.length,
                clearSelection,
            });
        if (!showDefaultFooter) return null;
        return (
            <div className="px-4 py-3 border-t border-border bg-muted/10 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                        {data.length}
                    </span>{" "}
                    row{data.length !== 1 ? "s" : ""}
                    {selectedIds.length > 0 && (
                        <>
                            {" "}
                            ·{" "}
                            <span className="font-medium text-primary">
                                {selectedIds.length} selected
                            </span>
                        </>
                    )}
                </p>
                {selectedIds.length > 0 && (
                    <button
                        onClick={clearSelection}
                        className="text-xs text-muted-foreground hover:text-foreground agency-transition"
                    >
                        Clear selection
                    </button>
                )}
            </div>
        );
    })();

    return (
        <div className={cn("space-y-2", className)}>
            <style>{`.datatable-scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; } .datatable-scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
            {/* Bulk actions */}
            {selectable &&
                selectedIds.length > 0 &&
                renderBulkActions?.({
                    selectedIds,
                    clearSelection,
                })}

            {/* Table container */}
            <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto datatable-scrollbar-hide">
                    <table className="w-full text-sm min-w-max">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                {renderRowActions && (
                                    <th className="px-4 py-3 w-16" />
                                )}
                                {selectable && (
                                    <th className="px-4 py-3 w-10 text-left">
                                        <Checkbox
                                            checked={
                                                allSelected
                                                    ? true
                                                    : someSelected
                                                      ? "indeterminate"
                                                      : false
                                            }
                                            onCheckedChange={(v) =>
                                                handleSelectAll(!!v)
                                            }
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                    </th>
                                )}
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={cn(
                                            "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground",
                                            col.className,
                                        )}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <TableSkeleton
                                    cols={columns.length}
                                    rows={skeletonRows}
                                    selectable={selectable}
                                    hasActions={!!renderRowActions}
                                />
                            ) : emptyRow ? (
                                emptyRow
                            ) : (
                                data.map((row, i) => {
                                    const id = getRowId(row, i);
                                    const isSelected = selectedIds.includes(id);
                                    return (
                                        <tr
                                            key={id}
                                            className={cn(
                                                "border-b border-border group/row agency-transition",
                                                isSelected
                                                    ? "bg-primary/4"
                                                    : "hover:bg-muted/20",
                                            )}
                                        >
                                            {renderRowActions && (
                                                <td className="px-4 py-3.5 w-16">
                                                    <div className="flex items-center justify-end">
                                                        {renderRowActions(
                                                            row,
                                                            i,
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            {selectable && (
                                                <td className="px-4 py-3.5 w-10">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(v) =>
                                                            handleSelectRow(
                                                                id,
                                                                !!v,
                                                            )
                                                        }
                                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                    />
                                                </td>
                                            )}
                                            {columns.map((col) => (
                                                <td
                                                    key={col.key}
                                                    className={cn(
                                                        "px-4 py-3.5",
                                                        col.className,
                                                    )}
                                                >
                                                    {col.render
                                                        ? col.render(row, i)
                                                        : String(
                                                              (
                                                                  row as Record<
                                                                      string,
                                                                      unknown
                                                                  >
                                                              )[col.key] ?? "",
                                                          )}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {footerContent && (
                    <div className="sticky bottom-0 bg-card border-t border-border z-10">
                        {footerContent}
                    </div>
                )}
            </div>
        </div>
    );
}
