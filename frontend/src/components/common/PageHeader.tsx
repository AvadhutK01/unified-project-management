import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* PageContainer                                                              */
/* -------------------------------------------------------------------------- */

interface PageContainerProps {
    children: ReactNode;
    className?: string;
    /** Constrain to a narrower reading width (forms, settings). */
    size?: "default" | "narrow" | "wide";
}

/** Consistent outer padding and max-width for every in-app page. */
export function PageContainer({
    children,
    className,
    size = "default",
}: PageContainerProps) {
    return (
        <div
            className={cn(
                "mx-auto w-full space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8",
                size === "default" && "max-w-[1400px]",
                size === "narrow" && "max-w-4xl",
                size === "wide" && "max-w-[1680px]",
                className,
            )}
        >
            {children}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Breadcrumbs                                                                */
/* -------------------------------------------------------------------------- */

export interface BreadcrumbItem {
    label: ReactNode;
    to?: string;
}

export function Breadcrumbs({
    items,
    className,
}: {
    items: BreadcrumbItem[];
    className?: string;
}) {
    if (items.length === 0) return null;
    return (
        <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
            <ol className="flex min-w-0 flex-wrap items-center gap-1 text-[13px] text-muted-foreground">
                {items.map((item, i) => {
                    const isLast = i === items.length - 1;
                    return (
                        <Fragment key={i}>
                            <li className="min-w-0">
                                {item.to && !isLast ? (
                                    <Link
                                        to={item.to}
                                        className="block max-w-[14rem] truncate rounded-sm transition-colors hover:text-foreground"
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span
                                        aria-current={
                                            isLast ? "page" : undefined
                                        }
                                        className={cn(
                                            "block max-w-[16rem] truncate",
                                            isLast &&
                                                "font-medium text-foreground",
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                )}
                            </li>
                            {!isLast && (
                                <li aria-hidden="true" className="shrink-0">
                                    <ChevronRight className="size-3.5 text-muted-foreground/60" />
                                </li>
                            )}
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}

/* -------------------------------------------------------------------------- */
/* PageHeader                                                                 */
/* -------------------------------------------------------------------------- */

interface PageHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    /** Leading visual — project logo, icon tile, avatar. */
    media?: ReactNode;
    /** Inline next to the title — status badge, plan chip. */
    meta?: ReactNode;
    /** Right-aligned primary actions. */
    actions?: ReactNode;
    /** Extra row under the description — dates, client, tags. */
    details?: ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    breadcrumbs,
    media,
    meta,
    actions,
    details,
    className,
}: PageHeaderProps) {
    return (
        <header className={cn("space-y-3", className)}>
            {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumbs items={breadcrumbs} />
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3.5">
                    {media && <div className="shrink-0">{media}</div>}
                    <div className="min-w-0 space-y-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                            <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight text-foreground sm:text-[22px]">
                                {title}
                            </h1>
                            {meta}
                        </div>
                        {description && (
                            <div className="max-w-2xl text-sm text-muted-foreground">
                                {description}
                            </div>
                        )}
                        {details && (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[13px] text-muted-foreground">
                                {details}
                            </div>
                        )}
                    </div>
                </div>
                {actions && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
}

/** Small icon+text pair used inside `PageHeader.details`. */
export function MetaItem({
    icon: Icon,
    children,
}: {
    icon?: React.ComponentType<{ className?: string }>;
    children: ReactNode;
}) {
    return (
        <span className="inline-flex min-w-0 items-center gap-1.5">
            {Icon && <Icon className="size-3.5 shrink-0" />}
            <span className="truncate">{children}</span>
        </span>
    );
}
