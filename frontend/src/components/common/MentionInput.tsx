import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

export type MentionUser = {
    id: string;
    name: string;
};

export type Mention = {
    id: string;
    name: string;
};

type Props = {
    users: MentionUser[];
    value: string;
    onChange: (value: string, mentions: Mention[]) => void;
    placeholder?: string;
    className?: string;
};

const MentionInput = ({
    users = [],
    value = "",
    onChange,
    placeholder = "Type @ to mention someone...",
    className,
}: Props) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [mentionStart, setMentionStart] = useState(-1);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mentionsRef = useRef<Mention[]>([]);

    useEffect(() => {
        if (!value) {
            mentionsRef.current = [];
        }
    }, [value]);

    const filteredUsers = useMemo(() => {
        if (!query) return users;
        const lower = query.toLowerCase();
        return users.filter((u) => u.name.toLowerCase().includes(lower));
    }, [users, query]);

    const detectMention = useCallback((text: string, cursor: number) => {
        const beforeCursor = text.slice(0, cursor);
        const lastAtIndex = beforeCursor.lastIndexOf("@");

        if (lastAtIndex !== -1) {
            const afterAt = beforeCursor.slice(lastAtIndex + 1);
            if (!afterAt.includes(" ")) {
                setQuery(afterAt);
                setMentionStart(lastAtIndex);
                setHighlightedIndex(0);
                setOpen(true);
                return;
            }
        }
        setOpen(false);
    }, []);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const text = e.target.value;
            const cursor = e.target.selectionStart ?? 0;
            detectMention(text, cursor);
            onChange(text, mentionsRef.current);
        },
        [detectMention, onChange],
    );

    const selectUser = useCallback(
        (user: MentionUser) => {
            if (mentionStart === -1 || !textareaRef.current) return;

            const cursor =
                textareaRef.current.selectionStart ??
                mentionStart + query.length;
            const before = value.slice(0, mentionStart);
            const after = value.slice(cursor);
            const newText = `${before}@${user.name} ${after}`;

            if (!mentionsRef.current.some((m) => m.id === user.id)) {
                mentionsRef.current = [
                    ...mentionsRef.current,
                    { id: user.id, name: user.name },
                ];
            }

            onChange(newText, mentionsRef.current);
            setOpen(false);

            requestAnimationFrame(() => {
                if (textareaRef.current) {
                    const pos = mentionStart + user.name.length + 2;
                    textareaRef.current.selectionStart = pos;
                    textareaRef.current.selectionEnd = pos;
                    textareaRef.current.focus();
                }
            });
        },
        [mentionStart, query, value, onChange],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (!open) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    Math.min(prev + 1, filteredUsers.length - 1),
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                if (filteredUsers.length > 0 && highlightedIndex >= 0) {
                    selectUser(filteredUsers[highlightedIndex]);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
            }
        },
        [open, filteredUsers, highlightedIndex, selectUser],
    );

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={() => setOpen(false)}
                placeholder={placeholder}
                className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
            />
            {open && filteredUsers.length > 0 && (
                <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                    {filteredUsers.map((user, idx) => (
                        <div
                            key={user.id}
                            role="option"
                            aria-selected={idx === highlightedIndex}
                            className={cn(
                                "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none",
                                idx === highlightedIndex &&
                                    "bg-muted text-foreground",
                            )}
                            onPointerDown={(e) => {
                                e.preventDefault();
                                selectUser(user);
                            }}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                        >
                            {user.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MentionInput;
