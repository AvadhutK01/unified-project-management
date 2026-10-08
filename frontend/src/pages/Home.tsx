import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "@/features/organization/components/OnboardingShell";

/** Signed-in landing for "/" — sends people on to their workspace. */
const Home = () => {
    const navigate = useNavigate();
    const name = (localStorage.getItem("name") || "").split(" ")[0];

    return (
        <OnboardingShell>
            <div className="w-full max-w-md text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Welcome back{name ? `, ${name}` : ""}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Pick up where you left off in your workspace.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                    <Button onClick={() => navigate("/organization-loader")}>
                        Open my workspace
                        <ArrowRight />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate("/org-setup/select")}
                    >
                        Choose workspace
                    </Button>
                </div>
            </div>
        </OnboardingShell>
    );
};

export default Home;
