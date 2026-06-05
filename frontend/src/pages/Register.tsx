import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Eye,
    EyeOff,
    Layers,
    ArrowRight,
    ArrowLeft,
    Users,
    Zap,
    BarChart3,
    Loader2,
    Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/api/axios";

const registerSchema = z
    .object({
        fullName: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(60, "Name is too long"),
        email: z.email("Please enter a valid email address"),
        mobile: z
            .string()
            .regex(/^\+?[1-9]\d{9,14}$/, "Please enter a valid mobile number"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .refine(
                (v) => /[A-Z]/.test(v),
                "Must contain at least one uppercase letter",
            )
            .refine((v) => /[0-9]/.test(v), "Must contain at least one number"),
        confirmPassword: z.string(),
        terms: z.literal(true, "You must accept the terms"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

const STEPS = [{ label: "Your info" }, { label: "Security" }];

const STEP_FIELDS: (keyof RegisterFormData)[][] = [
    ["fullName", "email", "mobile"],
    ["password", "confirmPassword", "terms"],
];

const features = [
    { Icon: Users, text: "Invite your team in seconds" },
    { Icon: Zap, text: "Automate repetitive workflows" },
    { Icon: BarChart3, text: "Track progress with live dashboards" },
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

const GoogleIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
);

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
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3.5 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                    <span className="text-white text-xs font-medium">
                        Free 14-day trial — no credit card needed
                    </span>
                </div>
                <h1 className="text-[2.6rem] font-bold text-white leading-[1.15] tracking-tight">
                    Start shipping
                    <br />
                    faster today
                </h1>
                <p className="text-white/75 text-base leading-relaxed max-w-xs">
                    Join thousands of teams who use Unified to plan, track, and
                    deliver their best work.
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

const StepIndicator = ({ current }: { current: number }) => (
    <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
            const done = i < current;
            const active = i === current;
            return (
                <div key={step.label} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300",
                                done &&
                                    "bg-primary border-primary text-primary-foreground",
                                active &&
                                    "bg-background border-primary text-primary",
                                !done &&
                                    !active &&
                                    "bg-background border-border text-muted-foreground",
                            )}
                        >
                            {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        <span
                            className={cn(
                                "text-[10px] font-medium whitespace-nowrap",
                                active
                                    ? "text-foreground"
                                    : "text-muted-foreground",
                            )}
                        >
                            {step.label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div
                            className={cn(
                                "h-0.5 w-12 mb-4 mx-1 transition-colors duration-300",
                                done ? "bg-primary" : "bg-border",
                            )}
                        />
                    )}
                </div>
            );
        })}
    </div>
);

const Register = () => {
    const baseUrl = import.meta.env.VITE_PUBLIC_API_BASE_URL;
    const [step, setStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordValue, setPasswordValue] = useState("");
    const navigate = useNavigate();

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
            <BrandPanel />

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
                    <StepIndicator current={step} />

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
