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
        <div className={cn("flex flex-col gap-1.5", className)}>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {title}
            </h1>
            {description && (
                <p className="text-muted-foreground leading-relaxed text-sm">
                    {description}
                </p>
            )}
        </div>
    );
}
