import * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
    steps: string[];
    currentStep: number; // 0-based index
}

export function Stepper({ steps, currentStep }: StepperProps) {
    return (
        <ol
            className="flex w-full items-center"
            aria-label={`Step ${currentStep + 1} of ${steps.length}`}
        >
            {steps.map((step, index) => {
                const done = index < currentStep;
                const active = index === currentStep;
                return (
                    <React.Fragment key={step}>
                        <li
                            className="flex shrink-0 items-center gap-2"
                            aria-current={active ? "step" : undefined}
                        >
                            <span
                                className={cn(
                                    "flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200",
                                    done &&
                                        "bg-primary text-primary-foreground",
                                    active &&
                                        "bg-primary text-primary-foreground ring-4 ring-primary/15",
                                    !done &&
                                        !active &&
                                        "bg-muted text-muted-foreground ring-1 ring-border",
                                )}
                            >
                                {done ? (
                                    <CheckIcon className="size-3.5" />
                                ) : (
                                    index + 1
                                )}
                            </span>
                            <span
                                className={cn(
                                    "hidden text-[13px] font-medium whitespace-nowrap sm:inline",
                                    done || active
                                        ? "text-foreground"
                                        : "text-muted-foreground",
                                )}
                            >
                                {step}
                            </span>
                        </li>
                        {index < steps.length - 1 && (
                            <li
                                aria-hidden="true"
                                className={cn(
                                    "mx-3 h-px flex-1 transition-colors duration-200",
                                    done ? "bg-primary" : "bg-border",
                                )}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </ol>
    );
}
