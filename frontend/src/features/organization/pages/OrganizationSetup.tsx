import { Building2, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OnboardingShell } from "../components/OnboardingShell";

const OPTIONS = [
    {
        key: "create",
        icon: Building2,
        title: "Create an organization",
        description:
            "Start a new workspace for your company or team and invite people to collaborate.",
        cta: "Get started",
        to: "/org-setup/create",
        primary: true,
    },
    {
        key: "join",
        icon: Users,
        title: "Join an organization",
        description:
            "Use an invitation link or organization code from your administrator.",
        cta: "Join now",
        to: "/org-setup/join",
        primary: false,
    },
] as const;

export default function OrganizationSetup() {
    const navigate = useNavigate();

    return (
        <OnboardingShell>
            <div className="w-full max-w-2xl space-y-8">
                <div className="space-y-2 text-center">
                    <p className="text-[13px] font-medium text-primary">
                        Welcome to Unified
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        Set up your workspace
                    </h1>
                    <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                        It looks like you are not part of any organization yet.
                        Create a new organization or join an existing one to
                        continue.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {OPTIONS.map(
                        ({
                            key,
                            icon: Icon,
                            title,
                            description,
                            cta,
                            to,
                            primary,
                        }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => navigate(to)}
                                className="group flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-6 text-left shadow-card transition-[border-color,box-shadow] outline-none hover:border-primary/40 hover:shadow-elevated focus-visible:ring-3 focus-visible:ring-ring/40"
                            >
                                <span
                                    className={
                                        "flex size-10 items-center justify-center rounded-lg " +
                                        (primary
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-foreground")
                                    }
                                >
                                    <Icon className="size-5" />
                                </span>
                                <span className="space-y-1.5">
                                    <span className="block text-base font-semibold text-foreground">
                                        {title}
                                    </span>
                                    <span className="block text-[13px] leading-relaxed text-muted-foreground">
                                        {description}
                                    </span>
                                </span>
                                <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-primary">
                                    {cta}
                                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                                </span>
                            </button>
                        ),
                    )}
                </div>
            </div>
        </OnboardingShell>
    );
}
