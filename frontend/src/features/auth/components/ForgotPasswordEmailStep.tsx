import { useGenerateResetPasswordOtp } from "../hooks/useOtp";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { emailSchema, type EmailFormData } from "../schemas/auth.schema";

export const ForgotPasswordEmailStep = ({
    onSuccess,
}: {
    onSuccess: (email: string) => void;
}) => {
    const { mutate: generateResetPasswordOtp } = useGenerateResetPasswordOtp();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });

    const onSubmit = async (data: EmailFormData) => {
        generateResetPasswordOtp(
            { email: data.email },
            {
                onSuccess: () => {
                    toast.success("OTP sent!", {
                        description: `Check your inbox at ${data.email}`,
                    });
                    onSuccess(data.email);
                },
                onError: (error: any) => {
                    toast.dismiss();
                    toast.error(
                        error?.response?.data?.message ||
                            "Failed to send OTP. Please try again.",
                    );
                },
            },
        );
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
