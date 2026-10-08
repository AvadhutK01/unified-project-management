import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TONE_BADGE, TONE_DOT, type Tone } from "@/lib/tones";

interface StatusBadgeProps {
    tone?: Tone;
    children: ReactNode;
    /** Show a leading status dot. Default true. */
    dot?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    className?: string;
    size?: "sm" | "default";
}

/** Semantic status pill — the single badge style used for every status. */
export function StatusBadge({
    tone = "neutral",
    children,
    dot = true,
    icon: Icon,
    className,
    size = "default",
}: StatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md border font-medium whitespace-nowrap",
                size === "default"
                    ? "h-5.5 px-2 text-xs"
                    : "h-5 px-1.5 text-[11px]",
                TONE_BADGE[tone],
                className,
            )}
        >
            {Icon ? (
                <Icon className="size-3 shrink-0" />
            ) : (
                dot && (
                    <span
                        aria-hidden="true"
                        className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            TONE_DOT[tone],
                        )}
                    />
                )
            )}
            {children}
        </span>
    );
}

/** Bare dot + label, for dense rows. */
export function StatusDot({
    tone = "neutral",
    className,
    label,
}: {
    tone?: Tone;
    className?: string;
    label?: string;
}) {
    return (
        <span
            role={label ? "img" : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            className={cn(
                "inline-block size-2 shrink-0 rounded-full",
                TONE_DOT[tone],
                className,
            )}
        />
    );
}
