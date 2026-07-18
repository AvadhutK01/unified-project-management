import { Brain, RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardData } from "../types/dashboard.types";

interface Props {
    data?: DashboardData;
    summary?: string;
    isPending?: boolean;
    onGenerate?: () => void;
}

// Render inline markdown: **bold** and `code`
function renderInline(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <strong key={i} className="font-semibold text-foreground">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
            return (
                <code
                    key={i}
                    className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }
        return part;
    });
}

function formatSummary(text: string) {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const trimmed = raw.trim();
        if (!trimmed) continue;

        const sectionMatch = trimmed.match(/^\*{1,3}\s+\*{2}(.+?)\*{2}:?\s*$/);
        if (sectionMatch) {
            elements.push(
                <div
                    key={key++}
                    className="mt-5 mb-2 flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 w-fit"
                >
                    <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/80">
                        {sectionMatch[1].replace(/:$/, "")}
                    </span>
                </div>,
            );
            continue;
        }

        const boldHeaderMatch = trimmed.match(/^\*{2}(.+?)\*{2}:?\s*$/);
        if (boldHeaderMatch) {
            elements.push(
                <p
                    key={key++}
                    className="mt-3 mb-1 text-sm font-semibold text-foreground"
                >
                    {boldHeaderMatch[1].replace(/:$/, "")}
                </p>,
            );
            continue;
        }

        const boldBulletMatch = trimmed.match(
            /^\*{1,3}\s+\*{2}(.+?)\*{2}:?\s*(.+)/,
        );
        if (boldBulletMatch) {
            elements.push(
                <li
                    key={key++}
                    className="mb-2 ml-1 flex items-start gap-2 rounded-xl border border-primary/10 bg-primary/[0.03] px-3 py-2.5 text-[12.5px] leading-relaxed text-foreground/80"
                >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                    <span>
                        <strong className="font-semibold text-foreground">
                            {boldBulletMatch[1]}:
                        </strong>{" "}
                        {renderInline(boldBulletMatch[2])}
                    </span>
                </li>,
            );
            continue;
        }

        const plainBulletMatch = trimmed.match(/^\*{1,3}\s+(.+)/);
        if (plainBulletMatch) {
            elements.push(
                <li
                    key={key++}
                    className="mb-2 ml-1 flex items-start gap-2 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-[12.5px] leading-relaxed text-foreground/75"
                >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                    <span>{renderInline(plainBulletMatch[1])}</span>
                </li>,
            );
            continue;
        }

        elements.push(
            <p
                key={key++}
                className="mt-1 mb-1 text-[12.5px] leading-relaxed text-muted-foreground"
            >
                {renderInline(trimmed)}
            </p>,
        );
    }

    return elements;
}

const AiSummary = ({ summary, isPending, onGenerate }: Props) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-background via-card to-primary/[0.04] shadow-[0_20px_45px_-24px_rgba(15,23,42,0.20)]">
            <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-r from-primary/[0.08] via-transparent to-transparent px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                        <Brain size={16} className="text-primary" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-foreground">
                            AI Summary
                        </span>
                        {!summary && !isPending && (
                            <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
                                Workspace insights in seconds
                            </span>
                        )}
                    </div>
                </div>
                <Button
                    variant="default"
                    size="sm"
                    onClick={onGenerate}
                    disabled={isPending}
                    className="bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-sm hover:opacity-90"
                >
                    {isPending ? (
                        <>
                            <Loader2 size={13} className="animate-spin" />
                            Generating…
                        </>
                    ) : summary ? (
                        <>
                            <RefreshCw size={13} />
                            Regenerate
                        </>
                    ) : (
                        <>
                            <Sparkles size={13} />
                            Generate
                        </>
                    )}
                </Button>
            </div>

            <div className="relative">
                <div className="absolute bottom-0 left-0 top-0 w-0.75 bg-gradient-to-b from-primary/20 via-primary/8 to-transparent" />

                {isPending && !summary ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-5 py-8">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-primary/15 blur-xl" />
                            <Brain
                                size={32}
                                className="relative text-primary/70 animate-pulse"
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-foreground">
                                Analyzing your workspace
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Generating an AI-powered overview of recent
                                activity…
                            </p>
                        </div>
                    </div>
                ) : summary ? (
                    <div className="px-5 py-3 pl-7">
                        <div className="rounded-2xl border border-border/70 bg-background/70 p-3 shadow-sm">
                            <ul className="m-0 list-none space-y-0 p-0">
                                {formatSummary(summary)}
                            </ul>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                            <p className="text-[11px] text-muted-foreground/70">
                                Powered by AI — may not be perfectly accurate
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 px-5 py-8">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                            <Sparkles size={22} className="text-primary" />
                        </div>
                        <div className="max-w-xs text-center">
                            <p className="text-sm font-medium text-foreground">
                                No summary yet
                            </p>
                            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                Generate an AI-powered overview of your
                                organization's performance and recent activity.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiSummary;
