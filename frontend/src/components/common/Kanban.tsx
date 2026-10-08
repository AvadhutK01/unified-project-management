import { forwardRef, type ReactNode } from "react";
import { Loader2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { TONE_DOT, type Tone } from "@/lib/tones";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* Presentational building blocks shared by the sprint and work-item
   boards. Drag-and-drop behaviour stays in the feature components. */

/** Horizontal scroller that hosts the columns. */
export function KanbanBoardScroller({ children }: { children: ReactNode }) {
    return (
        <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex w-max snap-x snap-mandatory gap-3 sm:snap-none">
                {children}
            </div>
        </div>
    );
}

interface KanbanColumnFrameProps {
    title: string;
    tone: Tone;
    count: number;
    isHighlighted?: boolean;
    loading?: boolean;
    children: ReactNode;
    footer?: ReactNode;
}

export const KanbanColumnFrame = forwardRef<
    HTMLDivElement,
    KanbanColumnFrameProps
>(({ title, tone, count, isHighlighted, loading, children, footer }, ref) => (
    <section
        ref={ref}
        aria-label={`${title} column, ${count} items`}
        className={cn(
            "flex max-h-[calc(100dvh-15rem)] min-h-[26rem] w-[85vw] max-w-[296px] shrink-0 snap-start flex-col rounded-xl border bg-muted/40 transition-[background-color,border-color,box-shadow] duration-150 sm:w-[296px] dark:bg-muted/30",
            isHighlighted
                ? "border-primary/50 bg-primary/[0.04] ring-2 ring-primary/20"
                : "border-border",
        )}
    >
        <header className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
            <div className="flex min-w-0 items-center gap-2">
                <span
                    aria-hidden="true"
                    className={cn(
                        "size-2 shrink-0 rounded-full",
                        TONE_DOT[tone],
                    )}
                />
                <h3 className="truncate text-[13px] font-semibold text-foreground">
                    {title}
                </h3>
                <span className="tabular rounded-full bg-foreground/[0.06] px-1.5 py-px text-[11px] font-medium text-muted-foreground dark:bg-foreground/10">
                    {count}
                </span>
            </div>
            {loading && (
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            )}
        </header>
        <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
            {children}
            {footer}
        </div>
    </section>
));
KanbanColumnFrame.displayName = "KanbanColumnFrame";

export function KanbanColumnEmpty({ label = "No items" }: { label?: string }) {
    return (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
            {label}
        </div>
    );
}

interface KanbanCardFrameProps extends React.HTMLAttributes<HTMLDivElement> {
    isDragging?: boolean;
    overlay?: boolean;
}

export const KanbanCardFrame = forwardRef<HTMLDivElement, KanbanCardFrameProps>(
    ({ isDragging, overlay, className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "group/card relative rounded-lg border border-border bg-card p-3 shadow-card transition-[border-color,box-shadow,opacity] duration-150 outline-none",
                !overlay &&
                    "cursor-grab touch-none hover:border-foreground/15 focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing",
                isDragging && "opacity-40",
                overlay &&
                    "w-[280px] rotate-[1.5deg] cursor-grabbing border-primary/30 shadow-elevated",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    ),
);
KanbanCardFrame.displayName = "KanbanCardFrame";

export interface KanbanCardAction {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onSelect: () => void;
}

/** "⋯" menu on a card. Stops events so it never starts a drag. */
export function KanbanCardMenu({
    actions,
    label,
}: {
    actions: KanbanCardAction[];
    label: string;
}) {
    if (actions.length === 0) return null;
    const stop = (e: React.SyntheticEvent) => e.stopPropagation();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={`Actions for ${label}`}
                onPointerDown={stop}
                onKeyDown={stop}
                onClick={stop}
                className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-100 transition-[opacity,background-color] outline-none hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:bg-accent data-[state=open]:opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100"
            >
                <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="min-w-36"
                onClick={stop}
                onPointerDown={stop}
            >
                {actions.map(({ label: l, icon: Icon, onSelect }) => (
                    <DropdownMenuItem key={l} onSelect={onSelect}>
                        <Icon />
                        {l}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
