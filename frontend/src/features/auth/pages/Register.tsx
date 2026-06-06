import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Eye,
    EyeOff,
    Layers,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/lib/axios";
import { RegisterBrandPanel } from "@/features/auth/components/RegisterBrandPanel";
import { StepIndicator } from "@/features/auth/components/StepIndicator";
import {
    registerSchema,
    type RegisterFormData,
} from "@/features/auth/schemas/auth.schema";

const STEPS = [{ label: "Your info" }, { label: "Security" }];

const STEP_FIELDS: (keyof RegisterFormData)[][] = [
    ["fullName", "email", "mobile"],
    ["password", "confirmPassword", "terms"],
];

const getStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
};

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = [
    "",
    "bg-destructive",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
];

const Register = () => {
    const navigate = useNavigate();

    const baseUrl = import.meta.env.VITE_PUBLIC_API_BASE_URL;

    const [step, setStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordValue, setPasswordValue] = useState("");

    const {
        register,
        handleSubmit,
        trigger,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: "onTouched",
    });

    const strength = getStrength(passwordValue);

    const handleNext = async () => {
        const valid = await trigger(STEP_FIELDS[step]);
        if (valid) setStep((s) => s + 1);
    };

    const handleBack = () => setStep((s) => s - 1);

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const response = await api.post(`${baseUrl}/users/register`, {
                username: data.fullName,
                email: data.email,
                phoneNumber: data.mobile,
                password: data.password,
            });

            // store token if returned
            const token = response?.data?.data?.token;
            if (token) localStorage.setItem("token", token);

            navigate("/verify-otp", {
                state: { email: data.email, mobile: data.mobile },
            });
            toast.success(
                "Account created! Please verify your email and phone number.",
            );
        } catch (error: any) {
            toast.dismiss();
            toast.error(
                error?.response?.data?.message ||
                    "Registration failed. Please try again.",
            );
            console.log(error);
        }
    };

    const stepHeadings = [
        {
            title: "Create your account",
            sub: "Free for 14 days — no credit card required",
        },
        { title: "Secure your account", sub: "Choose a strong password" },
    ];

    return (
        <div className="flex min-h-screen bg-background">
            <RegisterBrandPanel />

            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
                <div className="w-full max-w-105 space-y-6">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Layers className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg text-foreground">
                            Unified
                        </span>
                    </div>

                    {/* Step indicator */}
                    <StepIndicator current={step} steps={STEPS} />

                    {/* Heading */}
                    <div className="space-y-1.5">
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">
                            {stepHeadings[step].title}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            {stepHeadings[step].sub}
                        </p>
                    </div>

                    {/* Google SSO — only on step 0 */}
                    {/* {step === 0 && (
                        <>
                            <Button
                                variant="outline"
                                className="w-full h-10 gap-2.5 font-medium"
                                type="button"
                                onClick={() =>
                                    toast.info("Google SSO coming soon", {
                                        description:
                                            "Use email & password for now.",
                                    })
                                }
                            >
                                <GoogleIcon />
                                Sign up with Google
                            </Button>

                            <div className="relative flex items-center gap-3">
                                <div className="flex-1 border-t border-border" />
                                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                                    or
                                </span>
                                <div className="flex-1 border-t border-border" />
                            </div>
                        </>
                    )} */}

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4 -mt-4"
                    >
                        {/* Step 1 — Account info */}
                        {step === 0 && (
                            <>
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="fullName"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Full name
                                    </label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="Jane Doe"
                                        autoComplete="name"
                                        autoFocus
                                        aria-invalid={!!errors.fullName}
                                        {...register("fullName")}
                                        className={cn(
                                            errors.fullName &&
                                                "border-destructive",
                                        )}
                                    />
                                    {errors.fullName && (
                                        <p className="text-xs text-destructive">
                                            {errors.fullName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="email"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Work email
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        autoComplete="email"
                                        aria-invalid={!!errors.email}
                                        {...register("email")}
                                        className={cn(
                                            errors.email &&
                                                "border-destructive",
                                        )}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="mobile"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Mobile number
                                    </label>
                                    <Input
                                        id="mobile"
                                        type="tel"
                                        placeholder="+1 234 567 8900"
                                        autoComplete="tel"
                                        aria-invalid={!!errors.mobile}
                                        {...register("mobile")}
                                        className={cn(
                                            errors.mobile &&
                                                "border-destructive",
                                        )}
                                    />
                                    {errors.mobile && (
                                        <p className="text-xs text-destructive">
                                            {errors.mobile.message}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    className="w-full h-10 mt-1 font-semibold"
                                    onClick={handleNext}
                                >
                                    Continue
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </>
                        )}

                        {/* Step 2 — Password */}
                        {step === 1 && (
                            <>
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Min. 8 characters"
                                            autoComplete="new-password"
                                            autoFocus
                                            aria-invalid={!!errors.password}
                                            {...register("password", {
                                                onChange: (e) =>
                                                    setPasswordValue(
                                                        e.target.value,
                                                    ),
                                            })}
                                            className={cn(
                                                "pr-10",
                                                errors.password &&
                                                    "border-destructive",
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((v) => !v)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

                                    {passwordValue.length > 0 && (
                                        <div className="space-y-1.5">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4].map((lvl) => (
                                                    <div
                                                        key={lvl}
                                                        className={cn(
                                                            "h-1 flex-1 rounded-full transition-colors duration-300",
                                                            strength >= lvl
                                                                ? strengthColors[
                                                                      strength
                                                                  ]
                                                                : "bg-border",
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Strength:{" "}
                                                <span
                                                    className={cn(
                                                        "font-medium",
                                                        strength <= 1 &&
                                                            "text-destructive",
                                                        strength === 2 &&
                                                            "text-yellow-600",
                                                        strength === 3 &&
                                                            "text-blue-600",
                                                        strength === 4 &&
                                                            "text-green-600",
                                                    )}
                                                >
                                                    {strengthLabels[strength] ||
                                                        "Too short"}
                                                </span>
                                            </p>
                                        </div>
                                    )}

                                    {errors.password && (
                                        <p className="text-xs text-destructive">
                                            {errors.password.message}
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
                                            type={
                                                showConfirm
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Re-enter your password"
                                            autoComplete="new-password"
                                            aria-invalid={
                                                !!errors.confirmPassword
                                            }
                                            {...register("confirmPassword")}
                                            className={cn(
                                                "pr-10",
                                                errors.confirmPassword &&
                                                    "border-destructive",
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirm((v) => !v)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            aria-label={
                                                showConfirm
                                                    ? "Hide password"
                                                    : "Show password"
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

                                <div className="space-y-1">
                                    <label className="flex items-start gap-2.5 cursor-pointer group">
                                        <div className="relative mt-0.5 shrink-0 w-4 h-4">
                                            <input
                                                type="checkbox"
                                                id="terms"
                                                className="sr-only peer"
                                                {...register("terms")}
                                            />
                                            <div
                                                className={cn(
                                                    "w-4 h-4 rounded border-2 border-input bg-card transition-colors flex items-center justify-center",
                                                    "peer-checked:bg-primary peer-checked:border-primary",
                                                    "group-hover:border-ring",
                                                    errors.terms &&
                                                        "border-destructive",
                                                )}
                                            >
                                                <Check className="w-2.5 h-2.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                        <span className="text-sm text-muted-foreground leading-tight">
                                            I agree to the{" "}
                                            <Link
                                                to="/terms"
                                                className="text-primary hover:underline font-medium"
                                            >
                                                Terms of Service
                                            </Link>{" "}
                                            and{" "}
                                            <Link
                                                to="/privacy"
                                                className="text-primary hover:underline font-medium"
                                            >
                                                Privacy Policy
                                            </Link>
                                        </span>
                                    </label>
                                    {errors.terms && (
                                        <p className="text-xs text-destructive ml-6">
                                            {errors.terms.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 px-4"
                                        onClick={handleBack}
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-10 font-semibold"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            <>
                                                Create account
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-primary hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
