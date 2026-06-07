import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const StepIndicator = ({
    current,
    steps,
}: {
    current: number;
    steps: { label: string }[];
}) => (
    <div className="flex items-center gap-0">
        {steps.map((step, i) => {
            const done = i < current;
            const active = i === current;
            return (
                <div key={step.label} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300",
                                done &&
                                    "bg-primary border-primary text-primary-foreground",
                                active &&
                                    "bg-background border-primary text-primary",
                                !done &&
                                    !active &&
                                    "bg-background border-border text-muted-foreground",
                            )}
                        >
                            {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        <span
                            className={cn(
                                "text-[10px] font-medium whitespace-nowrap",
                                active
                                    ? "text-foreground"
                                    : "text-muted-foreground",
                            )}
                        >
                            {step.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div
                            className={cn(
                                "h-0.5 w-12 mb-4 mx-1 transition-colors duration-300",
                                done ? "bg-primary" : "bg-border",
                            )}
                        />
                    )}
                </div>
            );
        })}
    </div>
);
