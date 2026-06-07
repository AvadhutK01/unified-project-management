import { useState } from "react";
import {
    useGenerateResetPasswordOtp,
    useVerifyResetPasswordOtp,
} from "../hooks/useOtp";
import { useOtpInput } from "../hooks/useOtpInput";
import { toast } from "sonner";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInputRow } from "@/features/auth/components/OtpInputRow";

const OTP_LENGTH = 6;

export const ForgotPasswordOtpStep = ({
    email,
    onSuccess,
    onBack,
}: {
    email: string;
    onSuccess: (otp: string) => void;
    onBack: () => void;
}) => {
    const { mutate: generateResetPasswordOtp } = useGenerateResetPasswordOtp();
    const { mutate: verifyResetPasswordOtp, isPending: isVerifying } =
        useVerifyResetPasswordOtp();

    const {
        otp,
        refs,
        filled,
        handleChange,
        handleKeyDown,
        handlePaste,
        reset,
    } = useOtpInput(OTP_LENGTH);

    const [cooldown, setCooldown] = useState(60);

    useState(() => {
        if (cooldown <= 0) return;
        const t = setInterval(
            () => setCooldown((c) => (c > 0 ? c - 1 : 0)),
            1000,
        );
        return () => clearInterval(t);
    });

    const handleSubmit = async () => {
        if (!filled || isVerifying) return;

        verifyResetPasswordOtp(
            {
                email,
                otp: otp.join(""),
            },
            {
                onSuccess: (response) => {
                    const token = response?.data?.token;
                    if (!token) {
                        throw new Error(
                            "Missing reset token from server response.",
                        );
                    }
                    toast.success("OTP verified!");
                    onSuccess(token);
                },
                onError: (error: any) => {
                    console.error(error);
                    toast.dismiss();
                    toast.error(
                        error?.response?.data?.message ||
                            "Invalid OTP. Please try again.",
                    );
                },
            },
        );
    };

    const handleResend = async () => {
        generateResetPasswordOtp(
            { email },
            {
                onSuccess: () => {
                    reset();
                    setCooldown(60);
                    toast.info("Code resent", {
                        description: `Sent to ${email}`,
                    });
                },
                onError: (error: any) => {
                    console.error(error);
                    toast.dismiss();
                    toast.error(
                        error?.response?.data?.message ||
                            "Failed to resend code. Please try again.",
                    );
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    Check your email
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    We sent a 6-digit verification code to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl border border-border bg-muted/30">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <MailCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Email code
                        </p>
                        <p className="text-xs text-muted-foreground">{email}</p>
                    </div>
                </div>

                <OtpInputRow
                    otp={otp}
                    refs={refs}
                    autoFocus
                    handleChange={handleChange}
                    handleKeyDown={handleKeyDown}
                    handlePaste={handlePaste}
                    otp_length={OTP_LENGTH}
                />

                <p className="text-xs text-muted-foreground">
                    Didn&apos;t receive it?{" "}
                    {cooldown > 0 ? (
                        <span>
                            Resend in{" "}
                            <span className="font-medium tabular-nums text-foreground">
                                {cooldown}s
                            </span>
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResend}
                            className="font-semibold text-primary hover:underline"
                        >
                            Resend
                        </button>
                    )}
                </p>
            </div>

            <Button
                className="w-full h-10 font-semibold"
                disabled={!filled || isVerifying}
                onClick={handleSubmit}
            >
                {isVerifying ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                    </>
                ) : (
                    <>
                        Verify code
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                <button
                    type="button"
                    onClick={onBack}
                    className="font-semibold text-primary hover:underline"
                >
                    ← Change email address
                </button>
            </p>
        </div>
    );
};
