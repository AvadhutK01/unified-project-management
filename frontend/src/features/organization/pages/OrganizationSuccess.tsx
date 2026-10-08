import { useNavigate } from "react-router-dom";
import { OnboardingShell } from "../components/OnboardingShell";
import {
    ArrowRight,
    UserPlus,
    Share2,
    FolderPlus,
    Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SuccessCard } from "@/features/organization/components/SuccessCard";
import { toast } from "sonner";
import { useOrganizationStore } from "@/store/organization.store";

const QUICK_ACTIONS = [
    {
        icon: FolderPlus,
        label: "Create your first project",
        description: "Organize work into projects",
    },
    {
        icon: UserPlus,
        label: "Invite team members",
        description: "Bring your team onboard",
    },
    {
        icon: Settings,
        label: "Configure settings",
        description: "Customize your workspace",
    },
];

export default function OrganizationSuccess() {
    const navigate = useNavigate();
    const { activeOrganization } = useOrganizationStore();

    const handleInvite = () => {
        toast.success("Invite link copied to clipboard!");
    };

    return (
        <OnboardingShell>
            <div className="w-full max-w-lg space-y-6">
                {/* Main success card */}
                <Card className="shadow-card">
                    <CardContent className="p-6 sm:p-8">
                        <SuccessCard
                            title="Your organization is ready"
                            description="Your workspace is ready. You can now invite team members and start managing projects right away."
                        >
                            <Button
                                size="lg"
                                onClick={() =>
                                    navigate(
                                        `/${activeOrganization?.slug}/dashboard`,
                                    )
                                }
                            >
                                Go to dashboard
                                <ArrowRight className="size-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleInvite}
                            >
                                <UserPlus className="size-4" />
                                Invite team members
                            </Button>
                        </SuccessCard>
                    </CardContent>
                </Card>

                {/* Quick actions */}
                <div className="space-y-2">
                    <p className="px-1 text-xs font-medium text-muted-foreground">
                        What&apos;s next
                    </p>
                    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card">
                        {QUICK_ACTIONS.map((action) => (
                            <button
                                key={action.label}
                                className="group flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors outline-none hover:bg-accent/60 focus-visible:bg-accent"
                                onClick={() =>
                                    toast.info(`${action.label} — coming soon!`)
                                }
                            >
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                    <action.icon className="size-4" />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">
                                        {action.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {action.description}
                                    </p>
                                </div>
                                <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Share link */}
                <button
                    onClick={handleInvite}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Share2 className="size-4" />
                    Share invite link with your team
                </button>
            </div>
        </OnboardingShell>
    );
}
