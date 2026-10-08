"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Tabs({
    className,
    orientation = "horizontal",
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return (
        <TabsPrimitive.Root
            data-slot="tabs"
            data-orientation={orientation}
            className={cn(
                "group/tabs flex gap-2 data-horizontal:flex-col",
                className,
            )}
            {...props}
        />
    );
}

const tabsListVariants = cva(
    "group/tabs-list inline-flex w-fit items-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
    {
        variants: {
            variant: {
                /** Segmented control */
                default:
                    "h-9 justify-center rounded-lg bg-muted p-[3px] dark:bg-muted/70",
                /** Underlined tabs, used for detail-page sections */
                line: "scrollbar-none h-10 w-full justify-start gap-5 overflow-x-auto rounded-none border-b border-border bg-transparent p-0",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

function TabsList({
    className,
    variant = "default",
    ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsListVariants>) {
    return (
        <TabsPrimitive.List
            data-slot="tabs-list"
            data-variant={variant}
            className={cn(tabsListVariants({ variant }), className)}
            {...props}
        />
    );
}

function TabsTrigger({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            className={cn(
                "relative inline-flex items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                // segmented
                "group-data-[variant=default]/tabs-list:h-full group-data-[variant=default]/tabs-list:flex-1 group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:px-3 group-data-[variant=default]/tabs-list:data-active:bg-card group-data-[variant=default]/tabs-list:data-active:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-xs dark:group-data-[variant=default]/tabs-list:data-active:bg-accent",
                // underline
                "group-data-[variant=line]/tabs-list:h-full group-data-[variant=line]/tabs-list:flex-none group-data-[variant=line]/tabs-list:px-0.5 group-data-[variant=line]/tabs-list:data-active:text-foreground",
                "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
                "group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start",
                className,
            )}
            {...props}
        />
    );
}

function TabsContent({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content
            data-slot="tabs-content"
            className={cn("flex-1 text-sm outline-none", className)}
            {...props}
        />
    );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
