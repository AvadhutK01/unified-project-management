import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Progress({
    className,
    indicatorClassName,
    value,
    ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string;
}) {
    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            value={value}
            className={cn(
                "relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-foreground/[0.07] dark:bg-foreground/10",
                className,
            )}
            {...props}
        >
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className={cn(
                    "size-full flex-1 rounded-full bg-primary transition-transform duration-500 ease-out",
                    indicatorClassName,
                )}
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </ProgressPrimitive.Root>
    );
}

export { Progress };
