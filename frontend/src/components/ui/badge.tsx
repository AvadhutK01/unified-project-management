import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "group/badge inline-flex h-5.5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border border-transparent px-2 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
    {
        variants: {
            variant: {
                default: "bg-primary/10 text-primary dark:bg-primary/20",
                secondary: "bg-secondary text-secondary-foreground",
                destructive:
                    "border-danger/20 bg-danger/10 text-danger dark:bg-danger/15",
                outline: "border-border bg-card text-foreground",
                success:
                    "border-success/20 bg-success/10 text-success dark:bg-success/15",
                warning:
                    "border-warning/25 bg-warning/10 text-warning dark:bg-warning/15",
                info: "border-info/20 bg-info/10 text-info dark:bg-info/15",
                ghost: "hover:bg-muted hover:text-muted-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

function Badge({
    className,
    variant = "default",
    asChild = false,
    ...props
}: React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot.Root : "span";

    return (
        <Comp
            data-slot="badge"
            data-variant={variant}
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
