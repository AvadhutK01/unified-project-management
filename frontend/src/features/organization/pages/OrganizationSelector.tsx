import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrganizationCard } from "@/features/organization/components/OrganizationCard";
import { SectionHeader } from "@/features/organization/components/SectionHeader";
import { useOrganizationsQuery } from "../hooks/useOrganizations";
import { getColor, getInitials, formatDate } from "@/lib/utils";
import { useOrganizationStore } from "@/store/organization.store";

export default function OrganizationSelector() {
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { data: response } = useOrganizationsQuery();
    const { setActiveOrganization } = useOrganizationStore();
    const organizations = response?.data?.organizations ?? [];

    const organizationCards = useMemo(
        () =>
            organizations.map((org) => ({
                id: org.id,
                name: org.name,
                initials: getInitials(org.name),
                color: getColor(org.slug),
                role: "Member",
                memberCount: 1,
                slug: org.slug,
                lastActive: formatDate(org.updatedAt),
            })),
        [organizations],
    );

    const selectedOrg = organizationCards.find((o) => o.id === selectedId);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-3xl space-y-8">
                <div className="text-center space-y-2">
                    <SectionHeader
                        title="Select Organization"
                        description="Choose which workspace you would like to continue with."
                        className="items-center text-center"
                    />
                    <p className="text-xs text-muted-foreground">
                        {organizationCards.length} organizations available
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {organizationCards.map((org) => (
                        <OrganizationCard
                            key={org.id}
                            {...org}
                            isSelected={selectedId === org.id}
                            onClick={() => {
                                setSelectedId(
                                    selectedId === org.id ? null : org.id,
                                );
                                setActiveOrganization(org);
                            }}
                        />
                    ))}

                    <div
                        onClick={() => navigate("/org-setup/create")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) =>
                            e.key === "Enter" && navigate("/org-setup/create")
                        }
                        className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-dashed border-border bg-card cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all duration-200 min-h-37 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                            <Plus className="size-5 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">
                                Create New
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Start a fresh workspace
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                    {selectedOrg && (
                        <p className="text-sm text-muted-foreground">
                            Continuing as{" "}
                            <span className="font-semibold text-foreground">
                                {selectedOrg.role}
                            </span>{" "}
                            in{" "}
                            <span className="font-semibold text-foreground">
                                {selectedOrg.name}
                            </span>
                        </p>
                    )}
                    <Button
                        className="w-full sm:w-auto sm:min-w-55"
                        size="lg"
                        disabled={!selectedId}
                        onClick={() =>
                            navigate(
                                `/${selectedOrg?.slug.toLowerCase()}/dashboard`,
                            )
                        }
                    >
                        Continue to Dashboard
                        <ArrowRight className="size-4" />
                    </Button>
                    {!selectedId && (
                        <p className="text-xs text-muted-foreground">
                            Select an organization to continue
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
