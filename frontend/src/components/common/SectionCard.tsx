import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
    title?: ReactNode;
    description?: ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    /** Remove body padding — for flush lists and tables. */
    flush?: boolean;
}

/** Bordered surface with an optional header row. */
export function SectionCard({
    title,
    description,
    icon: Icon,
    actions,
    children,
    className,
    contentClassName,
    flush = false,
}: SectionCardProps) {
    const hasHeader = title || actions;
    return (
        <section
            className={cn(
                "overflow-hidden rounded-xl border border-border bg-card shadow-card",
                className,
            )}
        >
            {hasHeader && (
                <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-3.5">
                    <div className="flex min-w-0 items-start gap-2.5">
                        {Icon && (
                            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        )}
                        <div className="min-w-0">
                            {title && (
                                <h2 className="truncate text-sm font-semibold text-foreground">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    {actions && (
                        <div className="flex shrink-0 items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            )}
            <div className={cn(!flush && "p-5", contentClassName)}>
                {children}
            </div>
        </section>
    );
}

/** Label / value row used in "Details" side panels. */
export function DetailRow({
    label,
    icon: Icon,
    children,
}: {
    label: ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    children: ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-2.5 text-[13px] first:pt-0 last:pb-0">
            <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                {Icon && <Icon className="size-3.5" />}
                {label}
            </span>
            <span className="min-w-0 truncate text-right font-medium text-foreground">
                {children}
            </span>
        </div>
    );
}
