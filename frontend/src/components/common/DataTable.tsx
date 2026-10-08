import { isValidElement } from "react";
import { SearchX, Inbox } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";

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
    /** Shown when `data` is empty and `hasActiveFilters` is false.
     *  May be a full `<tr>` or any node (it will be wrapped in a row). */
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

    /** Keep the header row visible while the table body scrolls. */
    stickyHeader?: boolean;
    /** Constrain body height (enables internal scroll, pairs with stickyHeader). */
    maxHeight?: string;

    className?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeletonRows({
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
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                    {selectable && (
                        <td className="w-10 px-4 py-3.5">
                            <Skeleton className="size-4 rounded-sm" />
                        </td>
                    )}
                    {Array.from({ length: cols }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5">
                            <Skeleton
                                className="h-3.5"
                                style={{
                                    width: `${55 + ((i * 3 + j * 7) % 40)}%`,
                                }}
                            />
                        </td>
                    ))}
                    {hasActions && (
                        <td className="w-16 px-4 py-3.5">
                            <Skeleton className="ml-auto size-4" />
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
    stickyHeader = false,
    maxHeight,
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

    /** Accept either a ready `<tr>` or arbitrary content. */
    const asRow = (node: React.ReactNode) =>
        isValidElement(node) && node.type === "tr" ? (
            node
        ) : (
            <tr>
                <td colSpan={totalSpan}>{node}</td>
            </tr>
        );

    const defaultEmpty = (
        <EmptyState
            icon={Inbox}
            title="Nothing here yet"
            description="Records will appear here once they are created."
        />
    );

    const defaultNoResults = (
        <EmptyState
            icon={SearchX}
            title="No results found"
            description="Try a different search term or clear your filters."
        />
    );

    const emptyNode =
        data.length === 0 && !loading
            ? hasActiveFilters
                ? (noResultsState ?? defaultNoResults)
                : (emptyState ?? defaultEmpty)
            : null;
    // Legacy callers pass a full <tr>; anything else renders below the
    // table (outside the horizontal scroller) so it stays centred on
    // narrow screens.
    const emptyIsRow = isValidElement(emptyNode) && emptyNode.type === "tr";
    const emptyRow = emptyNode && emptyIsRow ? asRow(emptyNode) : null;
    const emptyBlock = emptyNode && !emptyIsRow ? emptyNode : null;

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
            <div className="flex items-center justify-between px-4 py-2.5">
                <p className="tabular text-xs text-muted-foreground">
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
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Clear selection
                    </button>
                )}
            </div>
        );
    })();

    return (
        <div className={cn("space-y-2", className)}>
            {selectable &&
                selectedIds.length > 0 &&
                renderBulkActions?.({
                    selectedIds,
                    clearSelection,
                })}

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                <div
                    className={cn(
                        "overflow-x-auto",
                        maxHeight && "overflow-y-auto",
                    )}
                    style={maxHeight ? { maxHeight } : undefined}
                >
                    <table className="w-full min-w-max text-sm">
                        <thead
                            className={cn(stickyHeader && "sticky top-0 z-10")}
                        >
                            <tr className="border-b border-border bg-muted/60 backdrop-blur supports-backdrop-filter:bg-muted/80">
                                {selectable && (
                                    <th className="w-10 px-4 py-2.5 text-left">
                                        <Checkbox
                                            aria-label="Select all rows"
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
                                        />
                                    </th>
                                )}
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        scope="col"
                                        className={cn(
                                            "h-10 px-4 text-left text-xs font-medium whitespace-nowrap text-muted-foreground",
                                            col.className,
                                        )}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                                {renderRowActions && (
                                    <th className="w-16 px-4 py-2.5">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <TableSkeletonRows
                                    cols={columns.length}
                                    rows={skeletonRows}
                                    selectable={selectable}
                                    hasActions={!!renderRowActions}
                                />
                            ) : emptyRow ? (
                                emptyRow
                            ) : emptyBlock ? null : (
                                data.map((row, i) => {
                                    const id = getRowId(row, i);
                                    const isSelected = selectedIds.includes(id);
                                    return (
                                        <tr
                                            key={id}
                                            className={cn(
                                                "group/row border-b border-border transition-colors last:border-0",
                                                isSelected
                                                    ? "bg-primary/5"
                                                    : "hover:bg-muted/40",
                                            )}
                                        >
                                            {selectable && (
                                                <td className="w-10 px-4 py-3">
                                                    <Checkbox
                                                        aria-label="Select row"
                                                        checked={isSelected}
                                                        onCheckedChange={(v) =>
                                                            handleSelectRow(
                                                                id,
                                                                !!v,
                                                            )
                                                        }
                                                    />
                                                </td>
                                            )}
                                            {columns.map((col) => (
                                                <td
                                                    key={col.key}
                                                    className={cn(
                                                        "px-4 py-3 align-middle text-foreground",
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
                                            {renderRowActions && (
                                                <td className="w-16 px-4 py-3">
                                                    <div className="flex items-center justify-end">
                                                        {renderRowActions(
                                                            row,
                                                            i,
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {emptyBlock && (
                    <div className="border-t border-border">{emptyBlock}</div>
                )}

                {footerContent && (
                    <div className="border-t border-border bg-muted/30">
                        {footerContent}
                    </div>
                )}
            </div>
        </div>
    );
}
