import { Building2, Globe, Hash, FileText } from "lucide-react";

interface OrganizationSummaryProps {
    name: string;
    slug: string;
    website?: string;
    description?: string;
    logoPreview?: string | null;
}

interface SummaryRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

function SummaryRow({ icon, label, value }: SummaryRowProps) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-border last:border-none">
            <div className="size-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs text-muted-foreground font-medium">
                    {label}
                </span>
                <span className="text-sm font-semibold text-foreground break-all">
                    {value || "—"}
                </span>
            </div>
        </div>
    );
}

export function OrganizationSummaryCard({
    name,
    slug,
    website,
    description,
    logoPreview,
}: OrganizationSummaryProps) {
    return (
        <div className="rounded-xl border border-border bg-muted/10 overflow-hidden">
            {/* Logo preview */}
            {logoPreview && (
                <div className="p-5 pb-0 flex items-center gap-3">
                    <div className="size-14 rounded-xl overflow-hidden border border-border shrink-0">
                        <img
                            src={logoPreview}
                            alt="Organization logo"
                            className="size-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Logo</p>
                        <p className="text-sm font-semibold text-foreground">
                            Uploaded
                        </p>
                    </div>
                </div>
            )}

            <div className="p-5">
                <SummaryRow
                    icon={<Building2 className="size-4 text-primary" />}
                    label="Organization Name"
                    value={name}
                />
                <SummaryRow
                    icon={<Hash className="size-4 text-primary" />}
                    label="Slug"
                    value={slug}
                />
                {website && (
                    <SummaryRow
                        icon={<Globe className="size-4 text-primary" />}
                        label="Website"
                        value={website}
                    />
                )}
                {description && (
                    <SummaryRow
                        icon={<FileText className="size-4 text-primary" />}
                        label="Description"
                        value={description}
                    />
                )}
            </div>
        </div>
    );
}
