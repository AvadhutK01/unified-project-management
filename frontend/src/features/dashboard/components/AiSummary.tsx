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
                    className="text-[10px] bg-muted px-1 py-0.5 rounded font-mono"
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

        // Top-level section header: *   **Title:** (nothing after the closing **)
        const sectionMatch = trimmed.match(/^\*{1,3}\s+\*{2}(.+?)\*{2}:?\s*$/);
        if (sectionMatch) {
            elements.push(
                <div
                    key={key++}
                    className="flex items-center gap-2 mt-5 mb-2 first:mt-0"
                >
                    <span className="h-3.5 w-1 rounded-full bg-violet-500/60 shrink-0" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                        {sectionMatch[1].replace(/:$/, "")}
                    </span>
                </div>,
            );
            continue;
        }

        // Bold standalone header (no bullet): **Title:**
        const boldHeaderMatch = trimmed.match(/^\*{2}(.+?)\*{2}:?\s*$/);
        if (boldHeaderMatch) {
            elements.push(
                <p
                    key={key++}
                    className="text-xs font-semibold text-foreground mt-3 mb-1"
                >
                    {boldHeaderMatch[1].replace(/:$/, "")}
                </p>,
            );
            continue;
        }

        // Sub-bullet with bold title: *   **Title:** description
        const boldBulletMatch = trimmed.match(
            /^\*{1,3}\s+\*{2}(.+?)\*{2}:?\s*(.+)/,
        );
        if (boldBulletMatch) {
            elements.push(
                <li
                    key={key++}
                    className="flex items-start gap-2 text-[12.5px] leading-relaxed text-foreground/80 mb-1.5 ml-3"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400/70 mt-1.5 shrink-0" />
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

        // Plain bullet: *   text
        const plainBulletMatch = trimmed.match(/^\*{1,3}\s+(.+)/);
        if (plainBulletMatch) {
            elements.push(
                <li
                    key={key++}
                    className="flex items-start gap-2 text-[12.5px] leading-relaxed text-foreground/75 mb-1.5 ml-3"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                    <span>{renderInline(plainBulletMatch[1])}</span>
                </li>,
            );
            continue;
        }

        // Regular paragraph text
        elements.push(
            <p
                key={key++}
                className="text-[12.5px] leading-relaxed text-muted-foreground mt-1 mb-1"
            >
                {renderInline(trimmed)}
            </p>,
        );
    }

    return elements;
}

const AiSummary = ({ summary, isPending, onGenerate }: Props) => {
    return (
        <div className="overflow-hidden rounded-xl bg-card border shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/20 to-purple-600/20 ring-1 ring-violet-500/25">
                        <Brain size={14} className="text-violet-600" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-foreground">
                            AI Summary
                        </span>
                        {!summary && !isPending && (
                            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                                — Get insights about your workspace
                            </span>
                        )}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onGenerate}
                    disabled={isPending}
                    className="gap-1.5 h-8 text-xs"
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

            {/* Content */}
            <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-linear-to-b from-violet-500/30 via-primary/20 to-transparent" />

                {isPending && !summary ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 px-5">
                        <div className="relative">
                            <Brain
                                size={32}
                                className="text-violet-400 animate-pulse"
                            />
                            <div className="absolute inset-0 bg-violet-400/20 blur-xl rounded-full" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-foreground">
                                Analyzing your workspace
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Generating AI-powered summary…
                            </p>
                        </div>
                    </div>
                ) : summary ? (
                    <div className="px-5 py-4 pl-7">
                        <ul className="list-none p-0 m-0 space-y-0">
                            {formatSummary(summary)}
                        </ul>
                        <div className="mt-4 pt-3 border-t flex items-center justify-between">
                            <p className="text-[11px] text-muted-foreground/50">
                                Powered by AI — may not be perfectly accurate
                            </p>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onGenerate}
                                disabled={isPending}
                                className="size-7"
                                title="Regenerate"
                            >
                                {isPending ? (
                                    <Loader2
                                        size={12}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <RefreshCw size={12} />
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4 py-12 px-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/10 to-purple-600/10 ring-1 ring-violet-500/20">
                            <Sparkles size={20} className="text-violet-500" />
                        </div>
                        <div className="text-center max-w-xs">
                            <p className="text-sm font-medium text-foreground">
                                No summary yet
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Generate an AI-powered overview of your
                                organization's performance and activity.
                            </p>
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={onGenerate}
                            className="gap-2 mt-1"
                        >
                            <Sparkles size={14} />
                            Generate AI Summary
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiSummary;
