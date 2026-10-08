import { forwardRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SimpleTooltip } from "@/components/ui/tooltip";

/* -------------------------------------------------------------------------- */
/* SearchInput                                                                */
/* -------------------------------------------------------------------------- */

interface SearchInputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange"
> {
    value: string;
    onChange: (value: string) => void;
    /** Shown as a clear (×) button when the field has a value. */
    onClear?: () => void;
    containerClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    (
        {
            value,
            onChange,
            onClear,
            placeholder = "Search…",
            className,
            containerClassName,
            ...props
        },
        ref,
    ) => (
        <div className={cn("relative w-full sm:w-72", containerClassName)}>
            <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
                ref={ref}
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label={props["aria-label"] ?? placeholder}
                className={cn(
                    "h-9 w-full rounded-md border border-input bg-card pr-8 pl-9 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/80 hover:border-foreground/20 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 focus-visible:outline-none dark:bg-input/20 [&::-webkit-search-cancel-button]:hidden",
                    className,
                )}
                {...props}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => (onClear ? onClear() : onChange(""))}
                    aria-label="Clear search"
                    className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                    <X className="size-3.5" />
                </button>
            )}
        </div>
    ),
);
SearchInput.displayName = "SearchInput";

/* -------------------------------------------------------------------------- */
/* Toolbar                                                                    */
/* -------------------------------------------------------------------------- */

/** Row above a table/board: filters on the left, actions on the right. */
export function Toolbar({
    children,
    actions,
    className,
}: {
    children?: ReactNode;
    actions?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                className,
            )}
        >
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                {children}
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

interface PaginationProps {
    page: number;
    totalPages: number;
    onPrevious: () => void;
    onNext: () => void;
    /** Rows on the current page. */
    shown?: number;
    total?: number;
    noun?: string;
    className?: string;
}

export function Pagination({
    page,
    totalPages,
    onPrevious,
    onNext,
    shown,
    total,
    noun = "result",
    className,
}: PaginationProps) {
    const pages = Math.max(totalPages, 1);
    return (
        <div
            className={cn(
                "flex flex-col items-center gap-3 sm:flex-row sm:justify-between",
                className,
            )}
        >
            {total !== undefined ? (
                <p className="tabular text-[13px] text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                        {shown ?? 0}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    {noun}
                    {total !== 1 ? "s" : ""}
                </p>
            ) : (
                <span />
            )}
            <div className="flex items-center gap-1.5">
                <SimpleTooltip label="Previous page">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={onPrevious}
                        disabled={page <= 1}
                        aria-label="Previous page"
                    >
                        <ChevronLeft />
                    </Button>
                </SimpleTooltip>
                <span className="tabular min-w-24 px-1 text-center text-[13px] text-muted-foreground">
                    Page{" "}
                    <span className="font-medium text-foreground">{page}</span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">{pages}</span>
                </span>
                <SimpleTooltip label="Next page">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={onNext}
                        disabled={page >= pages}
                        aria-label="Next page"
                    >
                        <ChevronRight />
                    </Button>
                </SimpleTooltip>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* ViewSwitcher                                                               */
/* -------------------------------------------------------------------------- */

interface ViewOption<T extends string> {
    value: T;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

export function ViewSwitcher<T extends string>({
    value,
    onChange,
    options,
    className,
}: {
    value: T;
    onChange: (value: T) => void;
    options: ViewOption<T>[];
    className?: string;
}) {
    return (
        <div
            role="radiogroup"
            aria-label="View"
            className={cn(
                "inline-flex h-9 items-center rounded-lg border border-border bg-muted/60 p-0.5",
                className,
            )}
        >
            {options.map((opt) => {
                const Icon = opt.icon;
                const active = opt.value === value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors sm:flex-none",
                            active
                                ? "bg-card text-foreground shadow-xs dark:bg-accent"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        <Icon className="size-4" />
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* IconAction — accessible icon-only button with tooltip                      */
/* -------------------------------------------------------------------------- */

interface IconActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tone?: "default" | "danger";
}

export const IconAction = forwardRef<HTMLButtonElement, IconActionProps>(
    ({ label, icon: Icon, tone = "default", className, ...props }, ref) => (
        <SimpleTooltip label={label}>
            <button
                ref={ref}
                type="button"
                aria-label={label}
                className={cn(
                    "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                    tone === "danger"
                        ? "hover:bg-destructive/10 hover:text-destructive"
                        : "hover:bg-accent hover:text-foreground",
                    className,
                )}
                {...props}
            >
                <Icon className="size-4" />
            </button>
        </SimpleTooltip>
    ),
);
IconAction.displayName = "IconAction";
