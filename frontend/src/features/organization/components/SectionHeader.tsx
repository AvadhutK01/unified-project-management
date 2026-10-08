import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    description?: string;
    className?: string;
}

export function SectionHeader({
    title,
    description,
    className,
}: SectionHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-1", className)}>
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {title}
            </h1>
            {description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    );
}
