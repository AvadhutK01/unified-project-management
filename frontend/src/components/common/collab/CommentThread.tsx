import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageSquare, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MentionInput from "@/components/common/MentionInput";
import MentionText from "@/components/common/MentionText";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/Skeletons";
import { SimpleTooltip } from "@/components/ui/tooltip";

export type CommentMention = { id: string; name: string };

export interface Discussion {
    id: string;
    comment: string;
    authorName: string;
    authorEmail?: string;
    authorStatus?: string;
    authorUserId?: string;
    authorId?: string;
    memberId?: string;
    userId?: string;
    createdAt?: string;
}

export interface CommentThreadProps {
    entityId: string;
    discussions: Discussion[];
    isCommentsLoading: boolean;
    currentUserEmail: string;
    isSubmittingComment: boolean;
    onAddComment: (comment: string, mentions?: CommentMention[]) => void;
    onDeleteComment: (discussionId: string) => void;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    users: { id: string; name: string }[];
}

/** Discussion feed with a mention-aware composer. */
export function CommentThread({
    entityId,
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
}: CommentThreadProps) {
    const [commentText, setCommentText] = useState("");
    const [commentMentions, setCommentMentions] = useState<CommentMention[]>(
        [],
    );
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
        if (!entityId || !commentText.trim()) return;
        onAddComment(commentText.trim(), commentMentions);
        setCommentText("");
        setCommentMentions([]);
    };

    return (
        <div className="space-y-5">
            <form
                onSubmit={handleSubmit}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-card sm:p-4"
            >
                <MemberAvatar
                    name={localStorage.getItem("name") || "Me"}
                    userId={
                        typeof window !== "undefined"
                            ? localStorage.getItem("userId") ||
                              localStorage.getItem("id") ||
                              undefined
                            : undefined
                    }
                    status="active"
                    size="default"
                    className="hidden sm:flex"
                />
                <div className="min-w-0 flex-1 space-y-2.5">
                    <MentionInput
                        users={users}
                        value={commentText}
                        onChange={(text, mentions) => {
                            setCommentText(text);
                            setCommentMentions(mentions);
                        }}
                        placeholder="Write a comment… Type @ to mention someone"
                        className="min-h-20"
                    />
                    <div className="flex items-center justify-between gap-3">
                        <p className="hidden text-xs text-muted-foreground sm:block">
                            Mentioned members are notified.
                        </p>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={
                                isSubmittingComment || !commentText.trim()
                            }
                            className="ml-auto"
                        >
                            {isSubmittingComment ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <Send className="size-3.5" />
                            )}
                            Comment
                        </Button>
                    </div>
                </div>
            </form>

            <div>
                {isCommentsLoading ? (
                    <ListSkeleton rows={3} />
                ) : discussions.length === 0 ? (
                    <EmptyState
                        icon={MessageSquare}
                        title="No comments yet"
                        description="Start the conversation — ask a question or share an update."
                        size="sm"
                    />
                ) : (
                    <ol className="space-y-1">
                        {discussions.map((d) => {
                            const isAuthor = d.authorEmail === currentUserEmail;
                            return (
                                <li
                                    key={d.id}
                                    className="group flex items-start gap-3 rounded-lg px-1 py-3 sm:px-2"
                                >
                                    <MemberAvatar
                                        name={d.authorName}
                                        status={d.authorStatus || "active"}
                                        size="sm"
                                        memberId={d.memberId || d.authorId}
                                        userId={d.authorUserId || d.userId}
                                        className="mt-0.5"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex min-w-0 items-baseline gap-2">
                                                <span className="truncate text-[13px] font-semibold text-foreground">
                                                    {d.authorName}
                                                </span>
                                                <time
                                                    dateTime={d.createdAt}
                                                    className="shrink-0 text-xs text-muted-foreground"
                                                >
                                                    {d.createdAt
                                                        ? formatDistanceToNow(
                                                              new Date(
                                                                  d.createdAt,
                                                              ),
                                                              {
                                                                  addSuffix: true,
                                                              },
                                                          )
                                                        : ""}
                                                </time>
                                            </div>
                                            {isAuthor && (
                                                <SimpleTooltip label="Delete comment">
                                                    <button
                                                        onClick={() =>
                                                            onDeleteComment(
                                                                d.id,
                                                            )
                                                        }
                                                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-100 transition-[opacity,colors] hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                                        aria-label="Delete comment"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </SimpleTooltip>
                                            )}
                                        </div>
                                        <div className="mt-1 rounded-lg rounded-tl-sm bg-muted/60 px-3 py-2 dark:bg-muted/50">
                                            <MentionText
                                                text={d.comment}
                                                className="text-[13px] wrap-break-word text-foreground/90"
                                            />
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
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
}
