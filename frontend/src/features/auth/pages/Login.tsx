import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Layers, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LoginBrandPanel } from "@/features/auth/components/LoginBrandPanel";
import {
    loginSchema,
    type LoginFormData,
} from "@/features/auth/schemas/auth.schema";
import { useLoginUser } from "../hooks/useAuth";

const Login = () => {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const { mutate: loginUser, isPending: isSubmitting } = useLoginUser();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        loginUser(
            {
                email: data.email,
                password: data.password,
            },
            {
                onSuccess: (response) => {
                    const token = response?.data?.token;

                    if (!response?.data?.isVerified) {
                        navigate("/verify-otp", {
                            state: {
                                email: data.email,
                                mobile: response.data.phoneNumber,
                            },
                        });
                        toast.info(
                            "Please verify your email and phone number before logging in.",
                        );
                        return;
                    }

                    if (token) {
                        localStorage.setItem("token", token);
                        localStorage.setItem("name", response.data.username);
                        localStorage.setItem("email", response.data.email);
                    }

                    // navigate("/organization-loader");
                    navigate("/org-setup/select", { replace: true });
                    toast.success("Login successful!");
                },

                onError: (error: any) => {
                    console.log(error);
                    toast.dismiss();
                    toast.error(
                        error.response?.data?.message ||
                            "Login failed. Please try again.",
                    );
                },
            },
        );
    };

    return (
        <div className="flex min-h-screen bg-background">
            <LoginBrandPanel />

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

                    <div className="space-y-1.5">
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">
                            Welcome back
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Sign in to continue to your workspace
                        </p>
                    </div>

                    {/* <Button
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
                    </Button> */}

                    {/* <div className="relative flex items-center gap-3">
                        <div className="flex-1 border-t border-border" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                            or
                        </span>
                        <div className="flex-1 border-t border-border" />
                    </div> */}

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
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
