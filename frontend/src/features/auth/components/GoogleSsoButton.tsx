import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { useGoogleAuth } from "../hooks/useAuth";

export const GoogleIcon: React.FC<{ className?: string }> = ({
    className = "w-5 h-5",
}) => (
    <svg className={className} viewBox="0 0 24 24">
        <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
        />
        <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.93H1.28v3.15C3.26 21.3 7.31 24 12 24z"
        />
        <path
            fill="#FBBC05"
            d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.42l4.04-3.15z"
        />
        <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.58l4.04 3.15c.94-2.83 3.57-4.98 6.68-4.98z"
        />
    </svg>
);

interface GoogleSsoButtonProps {
    text?: string;
}

export const GoogleSsoButton: React.FC<GoogleSsoButtonProps> = ({
    text = "Continue with Google",
}) => {
    const navigate = useNavigate();
    const { mutate: googleAuth, isPending } = useGoogleAuth();
    // Google's button needs a pixel width (200–400px); track the container.
    const containerRef = useRef<HTMLDivElement>(null);
    const [buttonWidth, setButtonWidth] = useState<number>();
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const update = () =>
            setButtonWidth(
                Math.max(200, Math.min(400, Math.floor(el.clientWidth))),
            );
        update();
        if (typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const handleSuccess = (credentialResponse: any) => {
        if (!credentialResponse?.credential) {
            toast.error("Failed to get Google credentials");
            return;
        }

        googleAuth(
            { idToken: credentialResponse.credential },
            {
                onSuccess: (response) => {
                    const data = response?.data;
                    if (data?.isVerified && data?.token) {
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("name", data.username || "");
                        localStorage.setItem("email", data.email || "");
                        if (data.id) {
                            localStorage.setItem("userId", data.id);
                        }
                        toast.success("Welcome! Logged in with Google.");
                        navigate("/org-setup/select", { replace: true });
                    } else if (data?.requiresPhone || !data?.isVerified) {
                        toast.info(
                            "Google email verified! Please enter your phone number to complete account setup.",
                        );
                        navigate("/complete-google-sso", {
                            state: {
                                email: data?.email,
                                username: data?.username,
                            },
                        });
                    }
                },
                onError: (error: any) => {
                    toast.error(
                        error?.response?.data?.message ||
                            "Google SSO failed. Please try again.",
                    );
                },
            },
        );
    };

    return (
        <div ref={containerRef} className="w-full">
            {isPending ? (
                <div
                    role="status"
                    className="flex h-10 w-full items-center justify-center gap-2.5 rounded-md border border-input bg-card text-sm font-medium text-muted-foreground shadow-xs dark:bg-input/20"
                >
                    <Loader2 className="size-4 animate-spin" />
                    <span>Signing in with Google…</span>
                </div>
            ) : (
                <div
                    style={{ width: buttonWidth }}
                    className="group/google relative mx-auto h-10 max-w-full"
                >
                    {/* Themed face of the button (purely visual). */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2.5 rounded-md border border-input bg-card text-sm font-medium text-foreground shadow-xs transition-[background-color,border-color,box-shadow] group-focus-within/google:border-ring group-focus-within/google:ring-3 group-focus-within/google:ring-ring/25 group-hover/google:border-foreground/20 group-hover/google:bg-accent dark:bg-input/20 dark:group-hover/google:bg-accent"
                    >
                        <GoogleIcon className="size-[18px]" />
                        {text}
                    </div>
                    {/* Google's official button sits on top, transparent, and
                        handles the click — so the ID-token flow is unchanged. */}
                    {buttonWidth && (
                        <div className="absolute inset-0 overflow-hidden rounded-md opacity-0 [color-scheme:normal]">
                            <GoogleLogin
                                onSuccess={handleSuccess}
                                onError={() => {
                                    toast.error(
                                        "Google Sign In was cancelled or failed",
                                    );
                                }}
                                text={
                                    text === "Sign up with Google"
                                        ? "signup_with"
                                        : "continue_with"
                                }
                                shape="rectangular"
                                theme="outline"
                                size="large"
                                width={buttonWidth}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
