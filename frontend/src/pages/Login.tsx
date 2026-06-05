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
    Users,
    Zap,
    BarChart3,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/api/axios";

const loginSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const features = [
    { Icon: Users, text: "Real-time team collaboration" },
    { Icon: Zap, text: "Automated workflow management" },
    { Icon: BarChart3, text: "Advanced analytics & insights" },
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
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full border border-white/10" />
            <div className="absolute top-8 left-8 w-72 h-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full border border-white/10" />
            <div className="absolute bottom-8 right-8 w-80 h-80 rounded-full border border-white/10" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
                Unified
            </span>
        </div>

        {/* Main content */}
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

const Login = () => {
    const baseUrl = import.meta.env.VITE_PUBLIC_API_BASE_URL;
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const response = await api.post(`${baseUrl}/users/login`, {
                email: data.email,
                password: data.password,
            });

            console.log(response);

            // store token (supporting both possible response shapes)
            const token = response?.data?.data?.token;
            if (token) {
                localStorage.setItem("token", token);
            }

            if (!response.data.data.isVerified) {
                navigate("/verify-otp", {
                    state: {
                        email: data.email,
                        mobile: response.data.data.phoneNumber,
                    },
                });
                toast.info(
                    "Please verify your email and phone number before logging in.",
                );
                return;
            }

            navigate("/");
            toast.success("Login successful!");
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    "Login failed. Please try again.",
            );
            console.log(error);
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            <BrandPanel />

            {/* Right form panel */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-100 space-y-7">
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
                            Welcome back
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Sign in to continue to your workspace
                        </p>
                    </div>

                    {/* Google SSO */}
                    <Button
                        variant="outline"
                        className="w-full h-10 gap-2.5 font-medium"
                        type="button"
                        onClick={() =>
                            toast.info("Google SSO coming soon", {
                                description: "Use email & password for now.",
                            })
                        }
                    >
                        <GoogleIcon />
                        Continue with Google
                    </Button>

                    {/* Divider */}
                    <div className="relative flex items-center gap-3">
                        <div className="flex-1 border-t border-border" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                            or
                        </span>
                        <div className="flex-1 border-t border-border" />
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {/* Email */}
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
                                aria-invalid={!!errors.email}
                                {...register("email")}
                                className={cn(
                                    errors.email && "border-destructive",
                                )}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-primary hover:underline font-medium"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    aria-invalid={!!errors.password}
                                    {...register("password")}
                                    className={cn(
                                        "pr-10",
                                        errors.password && "border-destructive",
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
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
                            {errors.password && (
                                <p className="text-xs text-destructive">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full h-10 mt-1 font-semibold"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            to="/register"
                            className="font-semibold text-primary hover:underline"
                        >
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
