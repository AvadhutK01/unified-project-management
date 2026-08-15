import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Layers,
    ArrowRight,
    Loader2,
    MailCheck,
    Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RegisterBrandPanel } from "@/features/auth/components/RegisterBrandPanel";
import { useOtpInput } from "@/features/auth/hooks/useOtpInput";
import { OtpInputRow } from "@/features/auth/components/OtpInputRow";
import { useResendOtp, useVerifyOtp } from "../hooks/useOtp";

const OTP_LENGTH = 6;

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { email?: string; mobile?: string } | null;
    const email = state?.email ?? "";
    const mobile = state?.mobile ?? "";

    const emailOtp = useOtpInput(OTP_LENGTH);
    const mobileOtp = useOtpInput(OTP_LENGTH);

    const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
    const { mutate: resendOtp, isPending: isResending } = useResendOtp();

    const [emailCooldown, setEmailCooldown] = useState(60);
    const [mobileCooldown, setMobileCooldown] = useState(60);

    useEffect(() => {
        if (!email) navigate("/login", { replace: true });
    }, [email, navigate]);

    useEffect(() => {
        if (emailCooldown <= 0) return;
        const t = setTimeout(() => setEmailCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [emailCooldown]);

    useEffect(() => {
        if (mobileCooldown <= 0) return;
        const t = setTimeout(() => setMobileCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [mobileCooldown]);

    const allFilled = emailOtp.filled && mobileOtp.filled;

    const handleSubmit = async () => {
        if (!allFilled || isVerifying) return;
        verifyOtp(
            {
                email: state?.email,
                phoneNumber: state?.mobile,
                emailOtp: emailOtp.otp.join(""),
                phoneOtp: mobileOtp.otp.join(""),
            },
            {
                onSuccess: (response) => {
                    if (response?.data?.token) {
                        localStorage.setItem("token", response.data.token);
                        if (response.data.id) {
                            localStorage.setItem("userId", response.data.id);
                        }
                    }
                    toast.success("Verification successful!");
                    navigate("/org-setup");
                },

                onError: (error: any) => {
                    toast.dismiss();
                    toast.error(
                        error?.response?.data?.message ||
                            "Verification failed. Please try again.",
                    );
                },
            },
        );
    };

    const handleResendEmail = async () => {
        resendOtp(
            { email },
            {
                onSuccess: () => {
                    setEmailCooldown(60);
                    toast.info("Code resent", {
                        description: `Sent to ${email}`,
                    });
                },

                onError: (error: any) => {
                    toast.dismiss();
                    toast.error(
                        error?.response?.data?.message ||
                            "Failed to resend code. Please try again.",
                    );
                },
            },
        );
    };

    const handleResendMobile = async () => {
        resendOtp(
            { phoneNumber: mobile },
            {
                onSuccess: () => {
                    setMobileCooldown(60);
                    toast.info("Code resent", {
                        description: `Sent to ${mobile}`,
                    });
                },

                onError: (error: any) => {
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
        <div className="flex min-h-screen bg-background">
            <RegisterBrandPanel />

            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
                <div className="w-full max-w-100 space-y-3">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Layers className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg text-foreground">
                            Unified
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="space-y-1.5">
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">
                            Verify your account
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Enter the 6-digit codes sent to your email and
                            mobile number.
                        </p>
                    </div>

                    {/* Email OTP */}
                    <div className="space-y-3 p-4 rounded-2xl border border-border bg-muted/30">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <MailCheck className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Email code
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {email}
                                </p>
                            </div>
                        </div>
                        <OtpInputRow
                            otp_length={OTP_LENGTH}
                            otp={emailOtp.otp}
                            refs={emailOtp.refs}
                            autoFocus
                            handleChange={emailOtp.handleChange}
                            handleKeyDown={emailOtp.handleKeyDown}
                            handlePaste={emailOtp.handlePaste}
                        />
                        <p className="text-xs text-muted-foreground">
                            Didn&apos;t receive it?{" "}
                            {emailCooldown > 0 ? (
                                <span>
                                    Resend in{" "}
                                    <span className="font-medium tabular-nums text-foreground">
                                        {emailCooldown}s
                                    </span>
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendEmail}
                                    disabled={isResending}
                                    className="font-semibold text-primary hover:underline"
                                >
                                    Resend
                                </button>
                            )}
                        </p>
                    </div>

                    {/* Mobile OTP */}
                    <div className="space-y-3 p-4 rounded-2xl border border-border bg-muted/30">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Smartphone className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Mobile code
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {mobile || "your mobile number"}
                                </p>
                            </div>
                        </div>
                        <OtpInputRow
                            otp={mobileOtp.otp}
                            refs={mobileOtp.refs}
                            handleChange={mobileOtp.handleChange}
                            handleKeyDown={mobileOtp.handleKeyDown}
                            handlePaste={mobileOtp.handlePaste}
                            otp_length={OTP_LENGTH}
                        />
                        <p className="text-xs text-muted-foreground">
                            Didn&apos;t receive it?{" "}
                            {mobileCooldown > 0 ? (
                                <span>
                                    Resend in{" "}
                                    <span className="font-medium tabular-nums text-foreground">
                                        {mobileCooldown}s
                                    </span>
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendMobile}
                                    disabled={isResending}
                                    className="font-semibold text-primary hover:underline"
                                >
                                    Resend
                                </button>
                            )}
                        </p>
                    </div>

                    {/* Single submit */}
                    <Button
                        className="w-full h-10 font-semibold"
                        disabled={!allFilled || isVerifying}
                        onClick={handleSubmit}
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify & continue
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>

                    {/* Back to login */}
                    <p className="text-center text-sm text-muted-foreground">
                        <Link
                            to="/login"
                            className="font-semibold text-primary hover:underline"
                        >
                            ← Back to sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;
