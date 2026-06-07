import { useNavigate } from "react-router-dom";
import { ArrowRight, UserPlus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SuccessCard } from "@/features/organization/components/SuccessCard";
import { toast } from "sonner";
import { useOrganizationStore } from "@/store/organization.store";

const QUICK_ACTIONS = [
    {
        icon: "📋",
        label: "Create your first project",
        description: "Organize work into projects",
    },
    {
        icon: "👥",
        label: "Invite team members",
        description: "Bring your team onboard",
    },
    {
        icon: "⚙️",
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
        <div className="min-h-screen bg-background flex items-center justify-center p-4 py-10">
            <div className="w-full max-w-lg space-y-6">
                {/* Main success card */}
                <Card className="border-2">
                    <CardContent className="p-8 sm:p-10">
                        <SuccessCard
                            title="Organization Created Successfully 🎉"
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
                                Go To Dashboard
                                <ArrowRight className="size-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleInvite}
                            >
                                <UserPlus className="size-4" />
                                Invite Team Members
                            </Button>
                        </SuccessCard>
                    </CardContent>
                </Card>

                {/* Quick actions */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                        What&apos;s next
                    </p>
                    <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                        {QUICK_ACTIONS.map((action) => (
                            <button
                                key={action.label}
                                className="flex items-center gap-4 w-full px-5 py-4 text-left hover:bg-accent/50 transition-colors group"
                                onClick={() =>
                                    toast.info(`${action.label} — coming soon!`)
                                }
                            >
                                <span className="text-xl shrink-0">
                                    {action.icon}
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
        </div>
    );
}
