import { useState, useRef, useEffect } from "react";
import {
    MessageCircle,
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

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

let msgCounter = 0;
const nextId = () => String(++msgCounter);

const TypingIndicator = () => (
    <div className="flex items-end gap-2 max-w-[80%]">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Bot size={14} className="text-primary" />
        </div>
        <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
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
                className={`fixed bottom-20 right-5 z-50 flex flex-col w-90 max-h-140 rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 origin-bottom-right ${
                    open
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-90 pointer-events-none"
                }`}
            >
                <div className="flex items-center gap-3 px-4 py-3 border-b bg-primary rounded-t-2xl">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                        <Sparkles size={15} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white leading-none">
                            AI Assistant
                        </p>
                        <p className="text-[10px] text-white/70 mt-0.5">
                            {isPremium
                                ? isStreaming
                                    ? "Typing…"
                                    : "Ask anything about your workspace"
                                : "Premium Feature"}
                        </p>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
                    >
                        <X size={15} />
                    </button>
                </div>

                {!isPremium ? (
                    <div className="p-6 text-center space-y-4 my-auto">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-foreground">
                                Premium Feature Required
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {isOrgOwner
                                    ? "AI Chat Assistant is exclusive to Organization Premium subscribers. Upgrade your plan to ask questions about your workspace."
                                    : "AI Chat Assistant is exclusive to Organization Premium subscribers. Contact your Organization Owner to upgrade."}
                            </p>
                        </div>
                        {isOrgOwner && (
                            <Button
                                asChild
                                size="sm"
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold w-full cursor-pointer"
                            >
                                <a
                                    href={`/${activeOrganization?.slug}/billing`}
                                >
                                    Upgrade Plan
                                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                </a>
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
                            {messages.map((msg) =>
                                msg.role === "user" ? (
                                    <div
                                        key={msg.id}
                                        className="flex flex-col items-end gap-1"
                                    >
                                        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground leading-relaxed">
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground pr-1">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                ) : (
                                    <div
                                        key={msg.id}
                                        className="flex flex-col items-start gap-1"
                                    >
                                        <div className="flex items-end gap-2 max-w-[85%]">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                <Bot
                                                    size={14}
                                                    className="text-primary"
                                                />
                                            </div>
                                            <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                                {msg.content}
                                                {isStreaming &&
                                                    streamingIdRef.current ===
                                                        msg.id && (
                                                        <span className="inline-block w-0.5 h-3.5 bg-foreground/70 ml-0.5 align-middle animate-pulse" />
                                                    )}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground pl-9">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                ),
                            )}
                            {isPending && <TypingIndicator />}
                            <div ref={bottomRef} />
                        </div>

                        <div className="px-3 py-3 border-t">
                            <div className="flex items-end gap-2 rounded-xl border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask a question…"
                                    rows={1}
                                    className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none leading-relaxed max-h-24 overflow-y-auto"
                                    style={{ scrollbarWidth: "none" }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={
                                        !input.trim() ||
                                        isPending ||
                                        isStreaming ||
                                        !socket
                                    }
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors cursor-pointer"
                                >
                                    {isPending || isStreaming ? (
                                        <Loader2
                                            size={13}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Send size={13} />
                                    )}
                                </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                                Press Enter to send · Shift+Enter for new line
                            </p>
                        </div>
                    </>
                )}
            </div>

            <button
                onClick={() => setOpen((v) => !v)}
                className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            >
                {open ? <X size={20} /> : <MessageCircle size={20} />}
            </button>
        </>
    );
};

export default ChatBot;
