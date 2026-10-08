import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-4 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-card">
                <Compass className="size-5" />
            </span>
            <p className="tabular mt-6 text-sm font-semibold text-primary">
                404
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                Page not found
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                The page you are looking for does not exist or an error occurred
                while loading the page.
            </p>
            <div className="mt-6 flex items-center gap-2">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft />
                    Go back
                </Button>
                <Button onClick={() => navigate("/", { replace: true })}>
                    Go home
                </Button>
            </div>
        </div>
    );
}
