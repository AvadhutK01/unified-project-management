import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Send, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getInitials, getAvatarColorClass } from "../utils/workitem.utils";
import MentionInput from "@/components/common/MentionInput";
import MentionText from "@/components/common/MentionText";

interface WorkItemCommentsTabProps {
    workItemId: string;
    discussions: any[];
    isCommentsLoading: boolean;
    currentUserEmail: string;
    isSubmittingComment: boolean;
    onAddComment: (
        comment: string,
        mentions?: { id: string; name: string }[],
    ) => void;
    onDeleteComment: (discussionId: string) => void;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    users: { id: string; name: string }[];
}

const WorkItemCommentsTab = ({
    workItemId,
    discussions,
    isCommentsLoading,
    currentUserEmail,
    isSubmittingComment,
    onAddComment,
    onDeleteComment,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    users,
}: WorkItemCommentsTabProps) => {
    const [commentText, setCommentText] = useState("");
    const [commentMentions, setCommentMentions] = useState<
        { id: string; name: string }[]
    >([]);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage) return;
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!workItemId || !commentText.trim()) return;
        onAddComment(commentText.trim(), commentMentions);
        setCommentText("");
        setCommentMentions([]);
    };

    return (
        <div className="p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs space-y-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Discussions
            </h3>

            <form
                onSubmit={handleSubmit}
                className="flex gap-3 items-start border-b border-border/40 pb-6"
            >
                <Avatar
                    className={cn(
                        "size-9 shadow-inner",
                        getAvatarColorClass(currentUserEmail),
                    )}
                >
                    <AvatarFallback className="font-bold text-xs">
                        {getInitials(localStorage.getItem("name") || "Me")}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                    <MentionInput
                        users={users}
                        value={commentText}
                        onChange={(text, mentions) => {
                            setCommentText(text);
                            setCommentMentions(mentions);
                        }}
                        placeholder="Write a comment... (Type @ to mention)"
                        className="min-h-[80px] bg-secondary/20 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl"
                    />
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            size="sm"
                            disabled={
                                isSubmittingComment || !commentText.trim()
                            }
                            className="rounded-xl px-4 gap-1.5"
                        >
                            {isSubmittingComment ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <Send className="size-3.5" />
                            )}
                            <span>Comment</span>
                        </Button>
                    </div>
                </div>
            </form>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {isCommentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                ) : discussions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6 italic">
                        No comments yet. Start the conversation!
                    </p>
                ) : (
                    discussions.map((d: any) => {
                        const isAuthor = d.authorEmail === currentUserEmail;
                        return (
                            <div
                                key={d.id}
                                className="flex gap-3 items-start p-4 rounded-xl border border-border/40 bg-secondary/10 group transition-all duration-200"
                            >
                                <Avatar
                                    className={cn(
                                        "size-8 shadow-inner",
                                        getAvatarColorClass(d.authorEmail),
                                    )}
                                >
                                    <AvatarFallback className="font-bold text-xs">
                                        {getInitials(d.authorName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-semibold text-foreground">
                                                {d.authorName}
                                            </span>
                                            <span className="text-xs text-muted-foreground hidden sm:inline">
                                                {d.authorEmail}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground">
                                                {d.createdAt
                                                    ? formatDistanceToNow(
                                                          new Date(d.createdAt),
                                                          { addSuffix: true },
                                                      )
                                                    : ""}
                                            </span>
                                            {isAuthor && (
                                                <button
                                                    onClick={() =>
                                                        onDeleteComment(d.id)
                                                    }
                                                    className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors duration-150 cursor-pointer opacity-0 group-hover:opacity-100"
                                                    title="Delete comment"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <MentionText
                                        text={d.comment}
                                        className="text-sm text-foreground/90 mt-1"
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
                {isFetchingNextPage && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                )}
                {hasNextPage && !isFetchingNextPage && (
                    <div ref={sentinelRef} className="h-4" />
                )}
            </div>
        </div>
    );
};

export default WorkItemCommentsTab;
