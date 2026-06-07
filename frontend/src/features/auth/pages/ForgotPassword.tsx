import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoginBrandPanel } from "../components/LoginBrandPanel";
import { ForgotPasswordEmailStep } from "../components/ForgotPasswordEmailStep";
import { ForgotPasswordOtpStep } from "../components/ForgotPasswordOtpStep";
import { ForgotPasswordResetStep } from "../components/ForgotPasswordResetStep";

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

                    {step === 1 && (
                        <ForgotPasswordEmailStep
                            onSuccess={handleEmailSuccess}
                        />
                    )}
                    {step === 2 && (
                        <ForgotPasswordOtpStep
                            email={email}
                            onSuccess={handleOtpSuccess}
                            onBack={() => setStep(1)}
                        />
                    )}
                    {step === 3 && (
                        <ForgotPasswordResetStep
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
