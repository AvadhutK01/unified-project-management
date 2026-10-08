import type { ReactNode } from "react";
import { AlertTriangle, Lock, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: React.ComponentType<{ className?: string }>;
    title: ReactNode;
    description?: ReactNode;
    /** Only pass when the viewer is allowed to perform the action. */
    action?: ReactNode;
    className?: string;
    size?: "sm" | "default";
}

/** Icon + message + optional CTA. No illustrations, no decoration. */
export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
    size = "default",
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center",
                size === "default" ? "px-6 py-14" : "px-4 py-8",
                className,
            )}
        >
            {Icon && (
                <div
                    className={cn(
                        "mb-3.5 flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-card",
                        size === "default" ? "size-11" : "size-9",
                    )}
                >
                    <Icon
                        className={size === "default" ? "size-5" : "size-4"}
                    />
                </div>
            )}
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {description && (
                <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
                    {description}
                </p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

/* -------------------------------------------------------------------------- */

type ErrorKind = "error" | "network" | "permission";

interface ErrorStateProps {
    kind?: ErrorKind;
    title?: ReactNode;
    description?: ReactNode;
    onRetry?: () => void;
    action?: ReactNode;
    className?: string;
}

const ERROR_COPY: Record<
    ErrorKind,
    {
        icon: React.ComponentType<{ className?: string }>;
        title: string;
        description: string;
    }
> = {
    error: {
        icon: AlertTriangle,
        title: "Something went wrong",
        description:
            "We couldn't load this content. Please try again in a moment.",
    },
    network: {
        icon: WifiOff,
        title: "You appear to be offline",
        description: "Check your connection and try again.",
    },
    permission: {
        icon: Lock,
        title: "You don't have access",
        description:
            "Ask an organization admin to grant you permission for this area.",
    },
};

/** Friendly failure state. Raw technical errors are not surfaced. */
export function ErrorState({
    kind = "error",
    title,
    description,
    onRetry,
    action,
    className,
}: ErrorStateProps) {
    const copy = ERROR_COPY[kind];
    const Icon = copy.icon;
    return (
        <div
            role="alert"
            className={cn(
                "flex flex-col items-center justify-center px-6 py-16 text-center",
                className,
            )}
        >
            <div
                className={cn(
                    "mb-3.5 flex size-11 items-center justify-center rounded-xl",
                    kind === "permission"
                        ? "bg-muted text-muted-foreground"
                        : "bg-danger/10 text-danger",
                )}
            >
                <Icon className="size-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">
                {title ?? copy.title}
            </p>
            <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
                {description ?? copy.description}
            </p>
            {(onRetry || action) && (
                <div className="mt-4 flex items-center gap-2">
                    {onRetry && (
                        <Button variant="outline" size="sm" onClick={onRetry}>
                            <RefreshCw />
                            Try again
                        </Button>
                    )}
                    {action}
                </div>
            )}
        </div>
    );
}
