import { CheckCircle } from "lucide-react";
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
                "flex flex-col items-center gap-6 py-10 text-center",
                className,
            )}
        >
            {/* Animated icon */}
            <div className="relative">
                <div className="size-24 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in-75 duration-500">
                    <CheckCircle className="size-12 text-green-600" />
                </div>
                <div className="absolute inset-0 rounded-full bg-green-200 animate-ping opacity-30" />
            </div>

            <div className="flex flex-col gap-3 max-w-md">
                <h2 className="text-2xl font-bold text-foreground leading-tight">
                    {title}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                    {description}
                </p>
            </div>

            {children && (
                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                    {children}
                </div>
            )}
        </div>
    );
}
