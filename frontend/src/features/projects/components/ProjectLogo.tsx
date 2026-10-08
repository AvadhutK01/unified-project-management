import { FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

/** Resolve a stored logo path against the API origin. */
const getProjectImageUrl = (logoPath?: string | null) => {
    if (!logoPath) return "";
    if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) {
        return logoPath;
    }
    const apiBase = import.meta.env.VITE_PUBLIC_API_BASE_URL || "";
    const rootBase = apiBase.replace("/api/v1", "");
    return `${rootBase}${logoPath.startsWith("/") ? "" : "/"}${logoPath}`;
};

/** Project cover thumbnail with icon fallback. */
export function ProjectLogo({
    logo,
    name,
    className,
    iconClassName,
}: {
    logo?: string | null;
    name: string;
    className?: string;
    iconClassName?: string;
}) {
    return (
        <div
            className={cn(
                "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted",
                className,
            )}
        >
            {logo ? (
                <img
                    src={getProjectImageUrl(logo)}
                    alt={`${name} cover`}
                    className="size-full object-cover"
                />
            ) : (
                <FolderKanban
                    className={cn(
                        "size-4 text-muted-foreground",
                        iconClassName,
                    )}
                />
            )}
        </div>
    );
}
