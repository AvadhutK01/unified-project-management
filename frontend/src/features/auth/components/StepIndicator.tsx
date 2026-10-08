import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const StepIndicator = ({
    current,
    steps,
}: {
    current: number;
    steps: { label: string }[];
}) => (
    <ol
        className="flex w-full items-center gap-2"
        aria-label={`Step ${current + 1} of ${steps.length}`}
    >
        {steps.map((step, i) => {
            const done = i < current;
            const active = i === current;
            return (
                <li
                    key={step.label}
                    className={cn(
                        "flex items-center gap-2",
                        i < steps.length - 1 && "flex-1",
                    )}
                    aria-current={active ? "step" : undefined}
                >
                    <div
                        className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-200",
                            done && "bg-primary text-primary-foreground",
                            active &&
                                "bg-primary/10 text-primary ring-1 ring-primary/40 dark:bg-primary/20",
                            !done &&
                                !active &&
                                "bg-muted text-muted-foreground ring-1 ring-border",
                        )}
                    >
                        {done ? <Check className="size-3.5" /> : i + 1}
                    </div>
                    <span
                        className={cn(
                            "text-xs font-medium whitespace-nowrap",
                            active || done
                                ? "text-foreground"
                                : "text-muted-foreground",
                        )}
                    >
                        {step.label}
                    </span>
                    {i < steps.length - 1 && (
                        <div
                            aria-hidden="true"
                            className={cn(
                                "mx-1 h-px flex-1 transition-colors duration-200",
                                done ? "bg-primary" : "bg-border",
                            )}
                        />
                    )}
                </li>
            );
        })}
    </ol>
);
