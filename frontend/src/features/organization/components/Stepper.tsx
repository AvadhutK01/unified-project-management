import * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
    steps: string[];
    currentStep: number; // 0-based index
}

export function Stepper({ steps, currentStep }: StepperProps) {
    return (
        <div className="flex w-full items-start">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-2 shrink-0">
                        <div
                            className={cn(
                                "flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                                index < currentStep
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : index === currentStep
                                      ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                      : "border-border bg-card text-muted-foreground",
                            )}
                        >
                            {index < currentStep ? (
                                <CheckIcon className="size-4" />
                            ) : (
                                <span>{index + 1}</span>
                            )}
                        </div>
                        <span
                            className={cn(
                                "text-xs font-medium text-center max-w-[80px] leading-tight",
                                index <= currentStep
                                    ? "text-foreground"
                                    : "text-muted-foreground",
                            )}
                        >
                            {step}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div
                            className={cn(
                                "flex-1 h-[2px] mt-[1.1rem] mx-2 rounded-full transition-all duration-300",
                                index < currentStep
                                    ? "bg-primary"
                                    : "bg-border",
                            )}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
