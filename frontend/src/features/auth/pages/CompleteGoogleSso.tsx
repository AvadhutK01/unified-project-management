import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Layers,
    ArrowRight,
    Loader2,
    Smartphone,
    CheckCircle2,
    ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegisterBrandPanel } from "@/features/auth/components/RegisterBrandPanel";
import { useOtpInput } from "@/features/auth/hooks/useOtpInput";
import { OtpInputRow } from "@/features/auth/components/OtpInputRow";
import { useSendPhoneOtp, useVerifyPhoneOtp } from "../hooks/useAuth";
import { GoogleIcon } from "../components/GoogleSsoButton";

const OTP_LENGTH = 6;

const CompleteGoogleSso = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as {
        email?: string;
        username?: string;
    } | null;

    const email = state?.email ?? "";
    const username = state?.username ?? "";

    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [cooldown, setCooldown] = useState(60);

    const phoneOtp = useOtpInput(OTP_LENGTH);

    const { mutate: sendPhoneOtp, isPending: isSendingOtp } = useSendPhoneOtp();
    const { mutate: verifyPhoneOtp, isPending: isVerifying } =
        useVerifyPhoneOtp();

    useEffect(() => {
        if (!email) {
            navigate("/login", { replace: true });
        }
    }, [email, navigate]);

    useEffect(() => {
        if (step !== "otp" || cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [step, cooldown]);

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneError("");

        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
            setPhoneError(
                "Please enter a valid phone number (e.g. +1234567890)",
            );
            return;
        }

        sendPhoneOtp(
            { email, phoneNumber },
            {
                onSuccess: () => {
                    setStep("otp");
                    setCooldown(60);
                    toast.success(
                        "Verification code sent to your mobile number!",
                    );
                },
                onError: (error: any) => {
                    toast.error(
                        error?.response?.data?.message ||
                            "Failed to send verification code. Please try again.",
                    );
                },
            },
        );
    };

    const handleVerifyOtp = () => {
        if (!phoneOtp.filled || isVerifying) return;

        verifyPhoneOtp(
            {
                email,
                phoneNumber,
                phoneOtp: phoneOtp.otp.join(""),
            },
            {
                onSuccess: (response) => {
                    const data = response?.data;
                    if (data?.token) {
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("name", data.username || username);
                        localStorage.setItem("email", data.email || email);
                        if (data.id) {
                            localStorage.setItem("userId", data.id);
                        }
                    }
                    toast.success("Phone verified! Account setup complete.");
                    navigate("/org-setup/select", { replace: true });
                },
                onError: (error: any) => {
                    toast.error(
                        error?.response?.data?.message ||
                            "Verification failed. Please enter the correct 6-digit code.",
                    );
                },
            },
        );
    };

    const handleResendOtp = () => {
        if (cooldown > 0 || isSendingOtp) return;
        sendPhoneOtp(
            { email, phoneNumber },
            {
                onSuccess: () => {
                    setCooldown(60);
                    toast.info("Verification code resent", {
                        description: `Sent to ${phoneNumber}`,
                    });
                },
                onError: (error: any) => {
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
                <div className="w-full max-w-100 space-y-6">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Layers className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg text-foreground">
                            Unified
                        </span>
                    </div>

                    {/* Google verified banner */}
                    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                        <GoogleIcon className="w-5 h-5 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="truncate font-semibold">{email}</p>
                            <p className="text-xs opacity-90 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                Email verified via Google SSO
                            </p>
                        </div>
                    </div>

                    {step === "phone" ? (
                        /* Step 1: Input Phone Number */
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="space-y-1.5">
                                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                                    Add your mobile number
                                </h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    To keep your account secure, please provide
                                    a valid mobile number to receive
                                    verification codes.
                                </p>
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <label
                                    htmlFor="phoneNumber"
                                    className="text-sm font-medium text-foreground flex items-center gap-1.5"
                                >
                                    <Smartphone className="w-4 h-4 text-primary" />
                                    Mobile number
                                </label>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    placeholder="+1 234 567 8900"
                                    value={phoneNumber}
                                    onChange={(e) =>
                                        setPhoneNumber(e.target.value)
                                    }
                                    autoFocus
                                    className={
                                        phoneError ? "border-destructive" : ""
                                    }
                                />
                                {phoneError && (
                                    <p className="text-xs text-destructive">
                                        {phoneError}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-10 font-semibold"
                                disabled={isSendingOtp || !phoneNumber.trim()}
                            >
                                {isSendingOtp ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        Send verification code
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        /* Step 2: Input Phone OTP */
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                                    Verify mobile number
                                </h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Enter the 6-digit code sent to{" "}
                                    <span className="font-semibold text-foreground">
                                        {phoneNumber}
                                    </span>
                                    .
                                </p>
                            </div>

                            <div className="space-y-3 p-4 rounded-2xl border border-border bg-muted/30">
                                <OtpInputRow
                                    otp_length={OTP_LENGTH}
                                    otp={phoneOtp.otp}
                                    refs={phoneOtp.refs}
                                    autoFocus
                                    handleChange={phoneOtp.handleChange}
                                    handleKeyDown={phoneOtp.handleKeyDown}
                                    handlePaste={phoneOtp.handlePaste}
                                />
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setStep("phone")}
                                        className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        Change number
                                    </button>

                                    {cooldown > 0 ? (
                                        <span>
                                            Resend code in{" "}
                                            <span className="font-semibold tabular-nums text-foreground">
                                                {cooldown}s
                                            </span>
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={isSendingOtp}
                                            className="font-semibold text-primary hover:underline"
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </div>
                            </div>

                            <Button
                                className="w-full h-10 font-semibold"
                                disabled={!phoneOtp.filled || isVerifying}
                                onClick={handleVerifyOtp}
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify & Complete Setup
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Back to login */}
                    <p className="text-center text-sm text-muted-foreground pt-2">
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

export default CompleteGoogleSso;
