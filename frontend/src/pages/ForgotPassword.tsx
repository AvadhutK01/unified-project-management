import {
    useState,
    useRef,
    type KeyboardEvent,
    type ClipboardEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Layers,
    ArrowRight,
    Loader2,
    MailCheck,
    Eye,
    EyeOff,
    Users,
    Zap,
    BarChart3,
    KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/api/axios";

const OTP_LENGTH = 6;

const emailSchema = z.object({
    email: z.email("Please enter a valid email address"),
});

const resetSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

const features = [
    { Icon: Users, text: "Real-time team collaboration" },
    { Icon: Zap, text: "Automated workflow management" },
    { Icon: BarChart3, text: "Advanced analytics & insights" },
];

const BrandPanel = () => (
    <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
            background:
                "linear-gradient(145deg, #da7756 0%, #c4624a 55%, #a84f3a 100%)",
        }}
    >
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full border border-white/10" />
            <div className="absolute top-8 left-8 w-72 h-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full border border-white/10" />
            <div className="absolute bottom-8 right-8 w-80 h-80 rounded-full border border-white/10" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
                Unified
            </span>
        </div>

        <div className="relative z-10 space-y-10">
            <div className="space-y-4">
                <h1 className="text-[2.6rem] font-bold text-white leading-[1.15] tracking-tight">
                    Your team's
                    <br />
                    command center
                </h1>
                <p className="text-white/75 text-base leading-relaxed max-w-xs">
                    Streamline projects, align your team, and deliver results —
                    all in one unified workspace.
                </p>
            </div>

            <div className="space-y-3">
                {features.map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-3.5">
                        <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0 border border-white/10">
                            <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white/85 text-sm font-medium">
                            {text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const useOtpInput = () => {
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const next = [...otp];
        next[index] = digit;
        setOtp(next);
        if (digit && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
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
            .slice(0, OTP_LENGTH);
        const next = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((ch, i) => {
            next[i] = ch;
        });
        setOtp(next);
        refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    const filled = otp.every((d) => d !== "");
    const reset = () => setOtp(Array(OTP_LENGTH).fill(""));

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

const StepEmail = ({ onSuccess }: { onSuccess: (email: string) => void }) => {
    const baseUrl = import.meta.env.VITE_PUBLIC_API_BASE_URL;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });

    const onSubmit = async (data: EmailFormData) => {
        try {
            await api.post(`${baseUrl}/users/generate-reset-pwd-otp`, {
                email: data.email,
            });
            toast.success("OTP sent!", {
                description: `Check your inbox at ${data.email}`,
            });
            onSuccess(data.email);
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                    "Failed to send OTP. Please try again.",
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    Forgot password?
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Enter your email address and we'll send you a verification
                    code to reset your password.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                    <label
                        htmlFor="email"
                        className="text-sm font-medium text-foreground"
                    >
                        Email address
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        autoComplete="email"
                        autoFocus
                        aria-invalid={!!errors.email}
                        {...register("email")}
                        className={cn(errors.email && "border-destructive")}
                    />
                    {errors.email && (
                        <p className="text-xs text-destructive">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full h-10 font-semibold"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending code...
                        </>
                    ) : (
                        <>
                            Send verification code
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                    to="/login"
                    className="font-semibold text-primary hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
};

const StepOtp = ({
    email,
    onSuccess,
    onBack,
}: {
    email: string;
    onSuccess: (otp: string) => void;
    onBack: () => void;
}) => {
    const baseUrl = import.meta.env.VITE_PUBLIC_API_BASE_URL;
    const {
        otp,
        refs,
        filled,
        handleChange,
        handleKeyDown,
        handlePaste,
        reset,
    } = useOtpInput();
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        if (!filled || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const response = await api.post(
                `${baseUrl}/users/verify-reset-pwd-otp`,
                {
                    email,
                    otp: otp.join(""),
                },
            );
            const token = response.data.data?.token;
            if (!token) {
                throw new Error("Missing reset token from server response.");
            }
            toast.success("OTP verified!");
            onSuccess(token);
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                    "Invalid OTP. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        try {
            await api.post(`${baseUrl}/users/generate-reset-pwd-otp`, {
                email,
            });
            reset();
            setCooldown(60);
            toast.info("Code resent", { description: `Sent to ${email}` });
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                    "Failed to resend code. Please try again.",
            );
        }
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

                <div className="flex gap-2.5">
                    {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                        <input
                            key={i}
                            ref={(el) => {
                                refs.current[i] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={otp[i]}
                            autoFocus={i === 0}
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
                disabled={!filled || isSubmitting}
                onClick={handleSubmit}
            >
                {isSubmitting ? (
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

const StepReset = ({
    token,
    onSuccess,
}: {
    token: string;
    onSuccess: () => void;
}) => {
    const baseUrl = import.meta.env.VITE_PUBLIC_API_BASE_URL;
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ResetFormData>({ resolver: zodResolver(resetSchema) });

    const newPassword = watch("newPassword", "");

    const getStrength = (pw: string) => {
        if (pw.length === 0) return 0;
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
    };

    const strength = getStrength(newPassword);
    const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
    const strengthColors = [
        "",
        "bg-destructive",
        "bg-yellow-400",
        "bg-blue-400",
        "bg-green-500",
    ];

    const onSubmit = async (data: ResetFormData) => {
        try {
            await api.post(`${baseUrl}/users/reset-password`, {
                token,
                password: data.newPassword,
            });
            toast.success("Password reset successfully!");
            onSuccess();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                    "Failed to reset password. Please try again.",
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    <KeyRound className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    Set new password
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Choose a strong password for your account.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                    <label
                        htmlFor="newPassword"
                        className="text-sm font-medium text-foreground"
                    >
                        New password
                    </label>
                    <div className="relative">
                        <Input
                            id="newPassword"
                            type={showNew ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            autoFocus
                            aria-invalid={!!errors.newPassword}
                            {...register("newPassword")}
                            className={cn(
                                "pr-10",
                                errors.newPassword && "border-destructive",
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={
                                showNew ? "Hide password" : "Show password"
                            }
                        >
                            {showNew ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {newPassword.length > 0 && (
                        <div className="space-y-1">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className={cn(
                                            "h-1 flex-1 rounded-full transition-all duration-300",
                                            level <= strength
                                                ? strengthColors[strength]
                                                : "bg-border",
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Strength:{" "}
                                <span className="font-medium text-foreground">
                                    {strengthLabels[strength]}
                                </span>
                            </p>
                        </div>
                    )}

                    {errors.newPassword && (
                        <p className="text-xs text-destructive">
                            {errors.newPassword.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-foreground"
                    >
                        Confirm password
                    </label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirm ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            aria-invalid={!!errors.confirmPassword}
                            {...register("confirmPassword")}
                            className={cn(
                                "pr-10",
                                errors.confirmPassword && "border-destructive",
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={
                                showConfirm ? "Hide password" : "Show password"
                            }
                        >
                            {showConfirm ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-xs text-destructive">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full h-10 mt-1 font-semibold"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Resetting password...
                        </>
                    ) : (
                        <>
                            Reset password
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
};

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");

    const handleEmailSuccess = (submittedEmail: string) => {
        setEmail(submittedEmail);
        setStep(2);
    };

    const handleOtpSuccess = (token: string) => {
        setResetToken(token);
        setStep(3);
    };

    const handleResetSuccess = () => {
        navigate("/login");
        toast.success(
            "Password updated! Please sign in with your new password.",
        );
    };

    const stepTitles = ["Enter email", "Verify code", "Reset password"];

    return (
        <div className="flex min-h-screen bg-background">
            <BrandPanel />

            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-100 space-y-7">
                    <div className="flex items-center gap-2 lg:hidden">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Layers className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg text-foreground">
                            Unified
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                                        s < step
                                            ? "bg-primary text-primary-foreground"
                                            : s === step
                                              ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                                              : "bg-muted text-muted-foreground",
                                    )}
                                >
                                    {s < step ? "✓" : s}
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-medium hidden sm:block",
                                        s === step
                                            ? "text-foreground"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    {stepTitles[s - 1]}
                                </span>
                                {s < 3 && (
                                    <div
                                        className={cn(
                                            "h-px w-6 mx-1 transition-all duration-300",
                                            s < step
                                                ? "bg-primary"
                                                : "bg-border",
                                        )}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {step === 1 && <StepEmail onSuccess={handleEmailSuccess} />}
                    {step === 2 && (
                        <StepOtp
                            email={email}
                            onSuccess={handleOtpSuccess}
                            onBack={() => setStep(1)}
                        />
                    )}
                    {step === 3 && (
                        <StepReset
                            token={resetToken}
                            onSuccess={handleResetSuccess}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
