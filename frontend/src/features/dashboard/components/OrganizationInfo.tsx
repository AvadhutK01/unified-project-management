import { Building2, Globe } from "lucide-react";
import { getInitials, getColor } from "@/lib/utils";

interface Props {
    title: string;
    slug: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    description: string;
}

const OrganizationInfo = ({
    title,
    slug,
    logoUrl,
    websiteUrl,
    description,
}: Props) => {
    const color = getColor(title);

    return (
        <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
            <div className="relative h-20 overflow-hidden">
                <div
                    className="absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-20"
                    style={{ backgroundColor: color }}
                />
                <div className="absolute -left-4 -bottom-6 h-20 w-20 rounded-full bg-primary/10" />
            </div>

            <div className="px-5 pb-5">
                <div className="-mt-7 mb-4">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={title}
                            className="h-14 w-14 rounded-xl object-cover shadow-md ring-4 ring-card"
                        />
                    ) : (
                        <div
                            className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white shadow-md ring-4 ring-card"
                            style={{ backgroundColor: color }}
                        >
                            {getInitials(title)}
                        </div>
                    )}
                </div>

                <h1 className="text-xl font-semibold text-foreground">
                    {title}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                    {description}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                        <Building2 size={11} />
                        {slug}
                    </span>
                    {websiteUrl && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                            <Globe size={11} />
                            {websiteUrl}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizationInfo;
