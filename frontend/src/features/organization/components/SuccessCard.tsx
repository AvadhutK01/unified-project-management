import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessCardProps {
    title: string;
    description: string;
    children?: React.ReactNode;
    className?: string;
}

export function SuccessCard({
    title,
    description,
    children,
    className,
}: SuccessCardProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center gap-5 py-4 text-center",
                className,
            )}
        >
            <div className="flex size-14 items-center justify-center rounded-full bg-success/10 ring-8 ring-success/5 duration-300 animate-in zoom-in-90">
                <Check className="size-7 text-success" strokeWidth={2.5} />
            </div>

            <div className="flex max-w-md flex-col gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    {title}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>

            {children && (
                <div className="mt-1 flex w-full flex-col-reverse items-stretch justify-center gap-2 sm:w-auto sm:flex-row sm:items-center">
                    {children}
                </div>
            )}
        </div>
    );
}
