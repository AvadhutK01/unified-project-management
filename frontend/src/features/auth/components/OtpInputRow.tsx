import { cn } from "@/lib/utils";
import type { ClipboardEvent, KeyboardEvent } from "react";

export const OtpInputRow = ({
    otp,
    refs,
    autoFocus,
    handleChange,
    handleKeyDown,
    handlePaste,
    otp_length,
}: {
    otp: string[];
    refs: React.RefObject<(HTMLInputElement | null)[]>;
    autoFocus?: boolean;
    handleChange: (i: number, v: string) => void;
    handleKeyDown: (i: number, e: KeyboardEvent<HTMLInputElement>) => void;
    handlePaste: (e: ClipboardEvent<HTMLInputElement>) => void;
    otp_length: number;
}) => (
    <div className="flex gap-2.5">
        {Array.from({ length: otp_length }).map((_, i) => (
            <input
                key={i}
                ref={(el) => {
                    refs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                aria-label={`Digit ${i + 1} of ${otp_length}`}
                maxLength={1}
                value={otp[i]}
                autoFocus={autoFocus && i === 0}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={cn(
                    "tabular aspect-square w-full max-w-12 rounded-lg border bg-card text-center text-lg font-semibold text-foreground shadow-xs outline-none transition-[border-color,box-shadow] duration-150 dark:bg-input/20",
                    "border-input hover:border-foreground/25",
                    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 focus-visible:outline-none",
                    otp[i] && "border-primary/60",
                )}
            />
        ))}
    </div>
);
