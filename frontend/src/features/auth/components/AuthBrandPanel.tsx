import { Check } from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";

/** Real capabilities only — no invented metrics or testimonials. */
const DEFAULT_FEATURES = [
    "Projects, phases, sprints and work items in one hierarchy",
    "Kanban boards with drag-and-drop status updates",
    "Role-based access for every member of your organization",
    "Comments, attachments, activity logs and live notifications",
];

interface AuthBrandPanelProps {
    headline: React.ReactNode;
    subhead: string;
    features?: string[];
}

/** Left-hand brand panel on authentication screens (lg and up). */
export const AuthBrandPanel = ({
    headline,
    subhead,
    features = DEFAULT_FEATURES,
}: AuthBrandPanelProps) => (
    <aside className="relative hidden w-[44%] max-w-[640px] flex-col justify-between overflow-hidden border-r border-white/[0.06] bg-[#0b0b12] p-12 text-white lg:flex">
        {/* Subtle grid + single brand glow */}
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
        >
            <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                    maskImage:
                        "radial-gradient(ellipse at 30% 20%, black 20%, transparent 75%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse at 30% 20%, black 20%, transparent 75%)",
                }}
            />
            <div className="absolute -top-40 -left-32 size-[520px] rounded-full bg-[#4f46e5] opacity-25 blur-[120px]" />
        </div>

        <BrandLogo
            className="relative [&>span:last-child]:text-white"
            markClassName="size-8"
        />

        <div className="relative space-y-10">
            <div className="space-y-4">
                <h1 className="text-[2.4rem] leading-[1.12] font-semibold tracking-tight">
                    {headline}
                </h1>
                <p className="max-w-sm text-[15px] leading-relaxed text-white/65">
                    {subhead}
                </p>
            </div>
            <ul className="space-y-3">
                {features.map((text) => (
                    <li key={text} className="flex items-start gap-3">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                            <Check className="size-3 text-white" />
                        </span>
                        <span className="text-sm text-white/80">{text}</span>
                    </li>
                ))}
            </ul>
        </div>

        <p className="relative text-xs text-white/40">
            Unified — project management for focused teams.
        </p>
    </aside>
);

export default AuthBrandPanel;
