import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                "flex field-sizing-content min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground shadow-xs transition-[color,box-shadow,border-color] outline-none placeholder:text-muted-foreground/80 hover:border-foreground/20 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15 md:text-sm dark:bg-input/20 dark:aria-invalid:border-destructive/60 dark:aria-invalid:ring-destructive/30",
                className,
            )}
            {...props}
        />
    );
}

export { Textarea };
