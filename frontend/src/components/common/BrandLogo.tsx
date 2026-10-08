import { cn } from "@/lib/utils";

/** The Unified mark: two interlocking strokes forming a "U". */
export function BrandMark({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                "inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs",
                className,
            )}
            aria-hidden="true"
        >
            <svg viewBox="0 0 24 24" fill="none" className="size-[62%]">
                <path
                    d="M6 4.5v8a6 6 0 0 0 12 0v-8"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                />
                <path
                    d="M12 4.5v8"
                    stroke="currentColor"
                    strokeOpacity="0.55"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                />
            </svg>
        </span>
    );
}

export function BrandLogo({
    className,
    markClassName,
    showWordmark = true,
}: {
    className?: string;
    markClassName?: string;
    showWordmark?: boolean;
}) {
    return (
        <span className={cn("inline-flex items-center gap-2", className)}>
            <BrandMark className={markClassName} />
            {showWordmark && (
                <span className="text-[15px] font-semibold tracking-tight text-foreground">
                    Unified
                </span>
            )}
        </span>
    );
}
