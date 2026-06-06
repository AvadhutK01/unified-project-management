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
                maxLength={1}
                value={otp[i]}
                autoFocus={autoFocus && i === 0}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={cn(
                    "w-full aspect-square max-w-12 rounded-xl border-2 bg-background text-center text-xl font-bold text-foreground outline-none transition-all duration-150",
                    "border-border hover:border-ring",
                    "focus:border-primary focus:ring-4 focus:ring-primary/10",
                    otp[i] && "border-primary/60",
                )}
            />
        ))}
    </div>
);
