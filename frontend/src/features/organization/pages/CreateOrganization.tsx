import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Stepper } from "@/features/organization/components/Stepper";
import { LogoUploader } from "@/features/organization/components/LogoUploader";
import { OrganizationSummaryCard } from "@/features/organization/components/OrganizationSummaryCard";
import { SectionHeader } from "@/features/organization/components/SectionHeader";
import { useOrganizationMutation } from "../hooks/useOrganizations";
import { toast } from "sonner";
import { useOrganizationStore } from "@/store/organization.store";

const STEPS = ["Organization Details", "Branding", "Review & Confirm"];
const MAX_DESCRIPTION = 300;

interface FormData {
    name: string;
    slug: string;
    logoFile: File | null;
    logoPreview: string | null;
    website: string;
    description: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

function toSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export default function CreateOrganization() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [errors, setErrors] = useState<FormErrors>({});
    const [form, setForm] = useState<FormData>({
        name: "",
        slug: "",
        logoFile: null,
        logoPreview: null,
        website: "",
        description: "",
    });

    const { mutate: createOrganization, isPending: isSubmitting } =
        useOrganizationMutation();
    const { setActiveOrganization } = useOrganizationStore();

    const updateField = (field: keyof FormData, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
            ...(field === "name" ? { slug: toSlug(value) } : {}),
        }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validateStep1 = (): boolean => {
        const e: FormErrors = {};
        if (!form.name.trim()) e.name = "Organization name is required";
        if (!form.slug.trim()) e.slug = "Slug is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        if (step === 0 && !validateStep1()) return;
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBack = () => {
        if (step === 0) {
            navigate("/onboarding");
        } else {
            setStep((s) => Math.max(s - 1, 0));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleSubmit = async () => {
        createOrganization(
            {
                name: form.name,
                slug: form.slug,
                logo: form.logoFile,
                websiteUrl: form.website,
                description: form.description,
            },
            {
                onSuccess: (response) => {
                    setActiveOrganization(response);
                    navigate("/onboarding/success");
                },
                onError: (error: any) => {
                    console.error(error);
                    toast.dismiss();
                    toast.error(
                        error?.response?.data?.message ||
                            "Failed to create organization. Please try again.",
                    );
                },
            },
        );
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 py-10">
            <div className="w-full max-w-2xl space-y-6">
                {/* Back link */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    {step === 0 ? "Back to Setup" : "Previous Step"}
                </button>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="size-5 text-primary" />
                    </div>
                    <SectionHeader
                        title="Create Organization"
                        description="Set up your workspace in a few simple steps."
                    />
                </div>

                {/* Stepper */}
                <Stepper steps={STEPS} currentStep={step} />

                {/* Form card */}
                <Card className="border-2">
                    {/* Step 1: Organization Details */}
                    {step === 0 && (
                        <>
                            <CardHeader>
                                <CardTitle>Organization Details</CardTitle>
                                <CardDescription>
                                    Basic information about your organization.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="org-name">
                                        Organization Name{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="org-name"
                                        placeholder="e.g. TechNova Solutions"
                                        value={form.name}
                                        onChange={(e) =>
                                            updateField("name", e.target.value)
                                        }
                                        aria-invalid={!!errors.name}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Slug */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="org-slug">
                                        Organization Slug{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <div
                                        className={`flex items-center rounded-md border overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${errors.slug ? "border-destructive" : "border-input"}`}
                                    >
                                        <span className="px-3 py-2 bg-muted text-muted-foreground text-xs sm:text-sm border-r border-input shrink-0 whitespace-nowrap">
                                            app.example.com/
                                        </span>
                                        <input
                                            id="org-slug"
                                            value={form.slug}
                                            onChange={(e) =>
                                                updateField(
                                                    "slug",
                                                    toSlug(e.target.value),
                                                )
                                            }
                                            placeholder="technova-solutions"
                                            className="flex-1 px-3 py-2 text-sm bg-transparent outline-none min-w-0"
                                        />
                                    </div>
                                    {errors.slug ? (
                                        <p className="text-xs text-destructive">
                                            {errors.slug}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            Auto-generated from organization
                                            name. Letters, numbers, and hyphens
                                            only.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </>
                    )}

                    {/* Step 2: Branding */}
                    {step === 1 && (
                        <>
                            <CardHeader>
                                <CardTitle>Organization Branding</CardTitle>
                                <CardDescription>
                                    Customize how your organization looks to
                                    team members.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-1.5">
                                    <Label>Organization Logo</Label>
                                    <LogoUploader
                                        preview={form.logoPreview}
                                        onUpload={(file, preview) =>
                                            setForm((p) => ({
                                                ...p,
                                                logoFile: file,
                                                logoPreview: preview,
                                            }))
                                        }
                                        onRemove={() =>
                                            setForm((p) => ({
                                                ...p,
                                                logoFile: null,
                                                logoPreview: null,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="website">Website URL</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        placeholder="https://example.com"
                                        value={form.website}
                                        onChange={(e) =>
                                            updateField(
                                                "website",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <span
                                            className={`text-xs ${
                                                form.description.length >=
                                                MAX_DESCRIPTION
                                                    ? "text-destructive"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {form.description.length} /{" "}
                                            {MAX_DESCRIPTION}
                                        </span>
                                    </div>
                                    <Textarea
                                        id="description"
                                        placeholder="Tell us what your organization does..."
                                        value={form.description}
                                        onChange={(e) =>
                                            updateField(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        rows={4}
                                        maxLength={MAX_DESCRIPTION}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Optional — helps team members understand
                                        the organization's purpose.
                                    </p>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {/* Step 3: Review */}
                    {step === 2 && (
                        <>
                            <CardHeader>
                                <CardTitle>Review & Confirm</CardTitle>
                                <CardDescription>
                                    Review your organization details before
                                    creating.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <OrganizationSummaryCard
                                    name={form.name}
                                    slug={form.slug}
                                    website={form.website}
                                    description={form.description}
                                    logoPreview={form.logoPreview}
                                />
                            </CardContent>
                        </>
                    )}
                </Card>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="size-4" />
                        Back
                    </Button>

                    {step < STEPS.length - 1 ? (
                        <Button onClick={handleNext}>
                            Next
                            <ArrowRight className="size-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <svg
                                        className="size-4 animate-spin"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                "Create Organization"
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
