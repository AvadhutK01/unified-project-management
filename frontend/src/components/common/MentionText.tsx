import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
    text: string;
    className?: string;
};

function MentionText({ text, className }: Props) {
    const regex = /@[A-Z][\w'-]*(?:\s[A-Z][\w'-]*)*/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        parts.push(
            <span key={match.index} className="text-primary font-semibold">
                {match[0]}
            </span>,
        );
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    if (parts.length === 0) {
        return (
            <span
                className={cn("whitespace-pre-wrap leading-relaxed", className)}
            >
                {text}
            </span>
        );
    }

    return (
        <span className={cn("whitespace-pre-wrap leading-relaxed", className)}>
            {parts}
        </span>
    );
}

export default MentionText;
