import type { ReactNode } from "react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { cn } from "@/lib/utils";

/** Shared frame for onboarding / workspace-selection screens. */
export function OnboardingShell({
    children,
    className,
    align = "center",
}: {
    children: ReactNode;
    className?: string;
    align?: "center" | "top";
}) {
    return (
        <div className="relative flex min-h-dvh flex-col bg-background">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_70%)]"
            />
            <header className="relative flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6">
                <BrandLogo />
                <ThemeToggle />
            </header>
            <main
                className={cn(
                    "relative flex flex-1 justify-center px-4 py-8 sm:px-6 sm:py-12",
                    align === "center"
                        ? "items-start sm:items-center"
                        : "items-start",
                    className,
                )}
            >
                {children}
            </main>
        </div>
    );
}

export default OnboardingShell;
