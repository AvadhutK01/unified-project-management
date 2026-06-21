import { useState } from "react";
import { useResetPassword } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { resetSchema, type ResetFormData } from "../schema/auth.schema";

export const ForgotPasswordResetStep = ({
    token,
    onSuccess,
}: {
    token: string;
    onSuccess: () => void;
}) => {
    const { mutate: resetPassword } = useResetPassword();

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
        resetPassword(
            {
                token,
                password: data.newPassword,
            },
            {
                onSuccess: () => {
                    toast.success("Password reset successfully!");
                    onSuccess();
                },
                onError: (error: any) => {
                    console.error(error);
                    toast.dismiss();
                    toast.error(
                        error?.response?.data?.message ||
                            "Failed to reset password. Please try again.",
                    );
                },
            },
        );
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
