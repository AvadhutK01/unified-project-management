import {
    useRef,
    useState,
    type ClipboardEvent,
    type KeyboardEvent,
} from "react";

export const useOtpInput = (otp_length: number) => {
    const [otp, setOtp] = useState<string[]>(Array(otp_length).fill(""));
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const next = [...otp];
        next[index] = digit;
        setOtp(next);
        if (digit && index < otp_length - 1) refs.current[index + 1]?.focus();
    };

    const handleKeyDown = (
        index: number,
        e: KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            refs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, otp_length);
        const next = Array(otp_length).fill("");
        pasted.split("").forEach((ch, i) => {
            next[i] = ch;
        });
        setOtp(next);
        refs.current[Math.min(pasted.length, otp_length - 1)]?.focus();
    };

    const filled = otp.every((d) => d !== "");
    const reset = () => setOtp(Array(otp_length).fill(""));

    return {
        otp,
        refs,
        filled,
        handleChange,
        handleKeyDown,
        handlePaste,
        reset,
    };
};
