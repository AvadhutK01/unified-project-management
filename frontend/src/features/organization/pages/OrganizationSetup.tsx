import { Building2, Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OrganizationSetup() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-2xl space-y-10">
                {/* Hero header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-1">
                        <Sparkles className="size-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            Welcome 👋
                        </h1>
                        <p className="mt-3 text-muted-foreground max-w-md mx-auto leading-relaxed text-sm sm:text-base">
                            It looks like you are not part of any organization
                            yet. Create a new organization or join an existing
                            one to continue.
                        </p>
                    </div>
                </div>

                {/* Action cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Create card */}
                    <Card className="group border-2 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer">
                        <CardContent className="p-8 flex flex-col items-center text-center gap-6">
                            <div className="size-18 w-18 h-18 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                                <Building2 className="size-9 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-foreground">
                                    Create Organization
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Start a new organization and invite your
                                    team to collaborate together.
                                </p>
                            </div>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={() => navigate("/org-setup/create")}
                            >
                                Get Started
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Join card */}
                    <Card className="group border-2 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer">
                        <CardContent className="p-8 flex flex-col items-center text-center gap-6">
                            <div className="size-18 w-18 h-18 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-muted transition-colors duration-200">
                                <Users className="size-9 text-secondary-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-foreground">
                                    Join Organization
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Join an existing organization using an
                                    invitation link or organization code.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                size="lg"
                                onClick={() => navigate("/org-setup/join")}
                            >
                                Join Now
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Need help?{" "}
                    <a
                        href="#"
                        className="text-primary hover:underline font-medium"
                    >
                        Contact support
                    </a>
                </p>
            </div>
        </div>
    );
}
