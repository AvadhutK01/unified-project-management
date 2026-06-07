import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="h-[calc(100vh-65px)] bg-card flex flex-col items-center justify-center px-4 text-center">
            <div className="rounded-3xl border border-border bg-card p-10 shadow-md">
                <p className="text-6xl font-bold text-primary">404</p>
                <h1 className="mt-4 text-3xl font-semibold text-foreground">
                    Page not found
                </h1>
                <p className="mt-3 max-w-md text-sm text-muted-foreground">
                    The page you are looking for does not exist or an error
                    occurred while loading the page.
                </p>
                <div className="mt-8">
                    <Button onClick={() => navigate("/", { replace: true })}>
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
