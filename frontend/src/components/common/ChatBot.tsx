import { useState, useRef, useEffect } from "react";
import {
    Lock,
    X,
    Send,
    Bot,
    Loader2,
    Sparkles,
    ArrowRight,
} from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { useSubscriptionQuery } from "@/features/subscriptions/hooks/useSubscription";
import { useOrganizationStore } from "@/store/organization.store";
import { usePermission } from "@/features/rbac/hooks/usePermission";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

let msgCounter = 0;
const nextId = () => String(++msgCounter);

const TypingIndicator = () => (
    <div
        className="flex max-w-[80%] items-start gap-2"
        aria-label="Assistant is typing"
    >
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary dark:bg-primary/15">
            <Bot className="size-3.5" />
        </span>
        <div className="rounded-2xl rounded-tl-md bg-muted px-3.5 py-2.5">
            <div className="flex gap-1 items-center h-4">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
            </div>
        </div>
    </div>
);

const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const ChatBot = () => {
    const socket = useSocket();
    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );
    const { data: subscription } = useSubscriptionQuery();
    const { isOrgOwner } = usePermission();
    const isPremium = subscription?.isPremium ?? false;

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: nextId(),
            role: "assistant",
            content:
                "Hi! I'm your AI assistant. Ask me anything about your projects, sprints, or team.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const streamingIdRef = useRef<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!socket) return;

        const onStart = () => {
            const id = nextId();
            streamingIdRef.current = id;
            setIsPending(false);
            setIsStreaming(true);
            setMessages((prev) => [
                ...prev,
                { id, role: "assistant", content: "", timestamp: new Date() },
            ]);
        };

        const onChunk = ({ chunk }: { chunk: string }) => {
            const id = streamingIdRef.current;
            if (!id) return;
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === id ? { ...m, content: m.content + chunk } : m,
                ),
            );
        };

        const onEnd = () => {
            streamingIdRef.current = null;
            setIsStreaming(false);
        };

        const onError = () => {
            streamingIdRef.current = null;
            setIsPending(false);
            setIsStreaming(false);
            setMessages((prev) => [
                ...prev,
                {
                    id: nextId(),
                    role: "assistant",
                    content: "Something went wrong. Please try again.",
                    timestamp: new Date(),
                },
            ]);
        };

        socket.on("chat:reply:start", onStart);
        socket.on("chat:reply:chunk", onChunk);
        socket.on("chat:reply:end", onEnd);
        socket.on("error", onError);

        return () => {
            socket.off("chat:reply:start", onStart);
            socket.off("chat:reply:chunk", onChunk);
            socket.off("chat:reply:end", onEnd);
            socket.off("error", onError);
        };
    }, [socket]);

    useEffect(() => {
        if (open && isPremium) setTimeout(() => inputRef.current?.focus(), 120);
    }, [open, isPremium]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isPending]);

    const handleSend = () => {
        const text = input.trim();
        if (!text || isPending || isStreaming || !socket) return;

        setMessages((prev) => [
            ...prev,
            {
                id: nextId(),
                role: "user",
                content: text,
                timestamp: new Date(),
            },
        ]);
        setInput("");
        setIsPending(true);
        socket.emit("chat:message", { message: text });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <div
                role="dialog"
                aria-label="AI Assistant"
                aria-hidden={!open}
                inert={!open}
                className={cn(
                    "fixed right-4 bottom-20 z-50 flex h-[min(560px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] origin-bottom-right flex-col overflow-hidden rounded-xl border border-border bg-popover shadow-elevated transition-[opacity,transform] duration-200 sm:right-5 sm:w-[380px]",
                    open
                        ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                        : "pointer-events-none translate-y-2 scale-[0.98] opacity-0",
                )}
            >
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15 dark:bg-primary/15">
                        <Sparkles className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm leading-none font-semibold text-foreground">
                            AI Assistant
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            {isPremium && (
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "size-1.5 rounded-full",
                                        socket ? "bg-success" : "bg-neutral",
                                    )}
                                />
                            )}
                            {isPremium
                                ? isStreaming
                                    ? "Typing…"
                                    : "Ask anything about your workspace"
                                : "Premium feature"}
                        </p>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        aria-label="Close AI assistant"
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {!isPremium ? (
                    <div className="my-auto space-y-4 p-6 text-center">
                        <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                            <Lock className="size-5" />
                        </span>
                        <div className="space-y-1.5">
                            <h3 className="text-sm font-semibold text-foreground">
                                Available on Premium
                            </h3>
                            <p className="text-[13px] leading-relaxed text-muted-foreground">
                                {isOrgOwner
                                    ? "AI Chat Assistant is exclusive to Organization Premium subscribers. Upgrade your plan to ask questions about your workspace."
                                    : "AI Chat Assistant is exclusive to Organization Premium subscribers. Contact your Organization Owner to upgrade."}
                            </p>
                        </div>
                        {isOrgOwner && (
                            <Button asChild size="sm" className="w-full">
                                <a
                                    href={`/${activeOrganization?.slug}/billing`}
                                >
                                    View plans
                                    <ArrowRight className="size-3.5" />
                                </a>
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div
                            className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
                            aria-live="polite"
                        >
                            {messages.map((msg) =>
                                msg.role === "user" ? (
                                    <div
                                        key={msg.id}
                                        className="flex flex-col items-end gap-1"
                                    >
                                        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap text-primary-foreground">
                                            {msg.content}
                                        </div>
                                        <span className="pr-1 text-[10px] text-muted-foreground">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                ) : (
                                    <div
                                        key={msg.id}
                                        className="flex flex-col items-start gap-1"
                                    >
                                        <div className="flex max-w-[90%] items-start gap-2">
                                            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary dark:bg-primary/15">
                                                <Bot className="size-3.5" />
                                            </span>
                                            <div className="rounded-2xl rounded-tl-md bg-muted px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap text-foreground">
                                                {msg.content}
                                                {isStreaming &&
                                                    streamingIdRef.current ===
                                                        msg.id && (
                                                        <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-foreground/70 align-middle" />
                                                    )}
                                            </div>
                                        </div>
                                        <span className="pl-8 text-[10px] text-muted-foreground">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                ),
                            )}
                            {isPending && <TypingIndicator />}
                            <div ref={bottomRef} />
                        </div>

                        <div className="border-t border-border p-3">
                            <div className="flex items-end gap-2 rounded-lg border border-input bg-card px-3 py-2 transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25 dark:bg-input/20">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask a question…"
                                    aria-label="Message the AI assistant"
                                    rows={1}
                                    className="scrollbar-none max-h-24 flex-1 resize-none overflow-y-auto bg-transparent text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/80"
                                />
                                <button
                                    onClick={handleSend}
                                    aria-label="Send message"
                                    disabled={
                                        !input.trim() ||
                                        isPending ||
                                        isStreaming ||
                                        !socket
                                    }
                                    className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                                >
                                    {isPending || isStreaming ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <Send className="size-3.5" />
                                    )}
                                </button>
                            </div>
                            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                                Enter to send · Shift+Enter for a new line
                            </p>
                        </div>
                    </>
                )}
            </div>

            <button
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close AI assistant" : "Open AI assistant"}
                aria-expanded={open}
                className="fixed right-4 bottom-4 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated ring-4 ring-background transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-95 sm:right-5 sm:bottom-5"
            >
                {open ? (
                    <X className="size-5" />
                ) : (
                    <Sparkles className="size-5" />
                )}
            </button>
        </>
    );
};

export default ChatBot;
