import {
    useState,
    useRef,
    useEffect,
    KeyboardEvent,
    ClipboardEvent,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Layers,
    ArrowRight,
    Loader2,
    MailCheck,
    Smartphone,
    Users,
    Zap,
    BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/api/axios";

const OTP_LENGTH = 6;

const features = [
    { Icon: Users, text: "Invite your team in seconds" },
    { Icon: Zap, text: "Automate repetitive workflows" },
    { Icon: BarChart3, text: "Track progress with live dashboards" },
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

    return { otp, refs, filled, handleChange, handleKeyDown, handlePaste };
};

const OtpInputRow = ({
    otp,
    refs,
    autoFocus,
    handleChange,
    handleKeyDown,
    handlePaste,
}: {
    otp: string[];
    refs: React.RefObject<(HTMLInputElement | null)[]>;
    autoFocus?: boolean;
    handleChange: (i: number, v: string) => void;
    handleKeyDown: (i: number, e: KeyboardEvent<HTMLInputElement>) => void;
    handlePaste: (e: ClipboardEvent<HTMLInputElement>) => void;
}) => (
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
                autoFocus={autoFocus && i === 0}
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
);

const VerifyOtp = () => {
    const baseUrl = import.meta.env.VITE_PUBLIC_API_BASE_URL;
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { email?: string; mobile?: string } | null;
    const email = state?.email ?? "";
    const mobile = state?.mobile ?? "";

    const emailOtp = useOtpInput();
    const mobileOtp = useOtpInput();

    const [isSubmitting, setIsSubmitting] = useState(false);
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
        if (!allFilled || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await api.post(`${baseUrl}/users/verify`, {
                email: state?.email,
                phoneNumber: state?.mobile,
                emailOtp: emailOtp.otp.join(""),
                phoneOtp: mobileOtp.otp.join(""),
            });
            toast.success("Verification successful!");
            navigate("/");
        } catch (error: any) {
            console.log(error);
            toast.dismiss();
            toast.error(
                error?.response?.data?.message ||
                    "Verification failed. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendEmail = async () => {
        try {
            await api.post(`${baseUrl}/users/resend`, { email });
            setEmailCooldown(60);
            toast.info("Code resent", { description: `Sent to ${email}` });
        } catch (error: any) {
            console.log(error);
            toast.dismiss();
            toast.error(
                error?.response?.data?.message ||
                    "Failed to resend code. Please try again.",
            );
        }
    };

    const handleResendMobile = async () => {
        try {
            await api.post(`${baseUrl}/users/resend`, { phoneNumber: mobile });
            setMobileCooldown(60);
            toast.info("Code resent", { description: `Sent to ${mobile}` });
        } catch (error: any) {
            console.log(error);
            toast.dismiss();
            toast.error(
                error?.response?.data?.message ||
                    "Failed to resend code. Please try again.",
            );
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            <BrandPanel />

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
                        disabled={!allFilled || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? (
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
