import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
    Bell,
    CheckCheck,
    Loader2,
    Info,
    AlertTriangle,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { useNotificationStore } from "@/store/notification.store";
import {
    useNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
} from "@/features/notifications/hooks/useNotifications";
import type { Notification } from "@/features/notifications/types/notification.types";
import { getNotificationRoute } from "@/features/notifications/utils/notification-router";
import { cn } from "@/lib/utils";
import { TONE_ICON, type Tone } from "@/lib/tones";
import { EmptyState } from "./EmptyState";
import { ListSkeleton } from "./Skeletons";

const typeIcon: Record<string, typeof Bell> = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle2,
    error: XCircle,
};

const typeTone: Record<string, Tone> = {
    info: "info",
    warning: "warning",
    success: "success",
    error: "danger",
};

const NotificationItem = ({
    notification,
    onClick,
}: {
    notification: Notification;
    onClick: (notification: Notification) => void;
}) => {
    const Icon = typeIcon[notification.type] ?? Bell;
    const tone = typeTone[notification.type] ?? "info";

    return (
        <button
            onClick={() => onClick(notification)}
            className={cn(
                "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors outline-none hover:bg-accent/60 focus-visible:bg-accent",
                !notification.isRead && "bg-primary/[0.035]",
            )}
        >
            <span
                className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                    TONE_ICON[tone],
                )}
            >
                <Icon className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1">
                <span
                    className={cn(
                        "block text-[13px] leading-snug",
                        notification.isRead
                            ? "font-medium text-foreground/80"
                            : "font-semibold text-foreground",
                    )}
                >
                    {notification.title}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                    {notification.message}
                </span>
                <span className="mt-1 block text-[11px] text-muted-foreground/80">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                    })}
                </span>
            </span>
            {!notification.isRead && (
                <span
                    aria-label="Unread"
                    className="mt-2 size-2 shrink-0 rounded-full bg-primary"
                />
            )}
        </button>
    );
};

const NotificationPanel = () => {
    const navigate = useNavigate();
    const panelOpen = useNotificationStore((s) => s.panelOpen);
    const setPanelOpen = useNotificationStore((s) => s.setPanelOpen);
    const markReadLocal = useNotificationStore((s) => s.markRead);
    const markAllReadLocal = useNotificationStore((s) => s.markAllRead);
    const unreadCount = useNotificationStore((s) => s.unreadCount);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useNotificationsQuery(20);
    const markAsReadMutation = useMarkAsReadMutation();
    const markAllAsReadMutation = useMarkAllAsReadMutation();

    if (!panelOpen) return null;

    const notifications = data?.pages?.flatMap((page) => page.data) ?? [];

    const handleItemClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsReadMutation.mutate(notification.id, {
                onSuccess: () => markReadLocal(notification.id),
            });
        }
        setPanelOpen(false);
        const route = getNotificationRoute(notification);
        navigate(route);
    };

    const handleMarkAllRead = () => {
        markAllAsReadMutation.mutate(undefined, {
            onSuccess: () => markAllReadLocal(),
        });
    };

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                aria-hidden="true"
                onClick={() => setPanelOpen(false)}
            />
            <div
                role="dialog"
                aria-label="Notifications"
                className="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-xl border border-border bg-popover shadow-elevated animate-in fade-in-0 slide-in-from-top-1 sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96"
            >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <span className="tabular rounded-full bg-primary/10 px-1.5 py-px text-[11px] font-semibold text-primary">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleMarkAllRead}
                        disabled={markAllAsReadMutation.isPending}
                        className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                    >
                        {markAllAsReadMutation.isPending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                            <CheckCheck className="size-3.5" />
                        )}
                        Mark all as read
                    </button>
                </div>

                <div className="max-h-[min(28rem,calc(100dvh-9rem))] divide-y divide-border overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4">
                            <ListSkeleton rows={4} />
                        </div>
                    ) : notifications.length === 0 ? (
                        <EmptyState
                            icon={Bell}
                            title="You're all caught up"
                            description="Mentions, assignments and updates will appear here."
                            size="sm"
                        />
                    ) : (
                        <>
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onClick={handleItemClick}
                                />
                            ))}
                            {hasNextPage && (
                                <button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="flex w-full items-center justify-center py-2.5 text-xs font-medium text-primary transition-colors hover:bg-accent/60 disabled:opacity-50"
                                >
                                    {isFetchingNextPage ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        "Load more"
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;
