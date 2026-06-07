import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Link2, Hash, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/features/organization/components/SectionHeader";
import { toast } from "sonner";

export default function JoinOrganization() {
    const navigate = useNavigate();
    const [inviteLink, setInviteLink] = useState("");
    const [orgCode, setOrgCode] = useState("");
    const [loading, setLoading] = useState<"link" | "code" | null>(null);

    const handleJoinWithLink = async () => {
        if (!inviteLink.trim()) {
            toast.error("Please enter an invitation link");
            return;
        }
        setLoading("link");
        await new Promise((r) => setTimeout(r, 1500));
        setLoading(null);
        toast.success("Joined organization successfully!");
        navigate("/");
    };

    const handleRequestAccess = async () => {
        if (!orgCode.trim()) {
            toast.error("Please enter an organization code");
            return;
        }
        setLoading("code");
        await new Promise((r) => setTimeout(r, 1500));
        setLoading(null);
        toast.success(
            "Access request sent! You will be notified once approved.",
        );
        setOrgCode("");
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-6">
                {/* Back */}
                <button
                    onClick={() => navigate("/onboarding")}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    Back to Setup
                </button>

                <SectionHeader
                    title="Join an Organization"
                    description="Use an invitation link or organization code to join an existing workspace."
                />

                {/* Main card with tabs */}
                <Card className="border-2">
                    <CardContent className="pt-6">
                        <Tabs defaultValue="link">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="link">
                                    <Link2 className="size-4" />
                                    Invitation Link
                                </TabsTrigger>
                                <TabsTrigger value="code">
                                    <Hash className="size-4" />
                                    Organization Code
                                </TabsTrigger>
                            </TabsList>

                            {/* Tab 1: Invite Link */}
                            <TabsContent value="link">
                                <div className="space-y-5 pt-1">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="invite-link">
                                            Invitation Link
                                        </Label>
                                        <Input
                                            id="invite-link"
                                            type="url"
                                            placeholder="https://app.example.com/invite/abc123xyz"
                                            value={inviteLink}
                                            onChange={(e) =>
                                                setInviteLink(e.target.value)
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Paste the full invitation link
                                            shared by your administrator.
                                        </p>
                                    </div>
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={handleJoinWithLink}
                                        disabled={loading === "link"}
                                    >
                                        {loading === "link" ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                Joining...
                                            </>
                                        ) : (
                                            <>
                                                <Link2 className="size-4" />
                                                Join Organization
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* Tab 2: Org Code */}
                            <TabsContent value="code">
                                <div className="space-y-5 pt-1">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="org-code">
                                            Organization Code
                                        </Label>
                                        <Input
                                            id="org-code"
                                            placeholder="e.g. TECH-4X9F2"
                                            value={orgCode}
                                            onChange={(e) =>
                                                setOrgCode(
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                            className="tracking-widest font-mono text-base"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Enter the unique code provided by
                                            your organization administrator.
                                        </p>
                                    </div>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        size="lg"
                                        onClick={handleRequestAccess}
                                        disabled={loading === "code"}
                                    >
                                        {loading === "code" ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                Sending Request...
                                            </>
                                        ) : (
                                            <>
                                                <Hash className="size-4" />
                                                Request Access
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Info banner */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-accent border border-border">
                    <Info className="size-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">
                        If you don't have an invite link, contact your
                        organization administrator to request an invitation.
                    </p>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Want to start fresh?{" "}
                    <button
                        onClick={() => navigate("/onboarding/create")}
                        className="text-primary hover:underline font-medium"
                    >
                        Create an organization
                    </button>
                </p>
            </div>
        </div>
    );
}
