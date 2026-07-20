import { formatDistanceToNow } from "date-fns";
import {
    Bell,
    CheckCheck,
    Loader2,
    Info,
    AlertTriangle,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { useNotificationStore } from "@/store/notification.store";
import {
    useNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
} from "@/features/notifications/hooks/useNotifications";
import type { Notification } from "@/features/notifications/types/notification.types";

const typeIcon: Record<string, typeof Bell> = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: XCircle,
};

const NotificationItem = ({
    notification,
    onRead,
}: {
    notification: Notification;
    onRead: (id: string) => void;
}) => {
    const Icon = typeIcon[notification.type] ?? Bell;

    return (
        <button
            onClick={() => {
                if (!notification.isRead) onRead(notification.id);
            }}
            className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${!notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
        >
            <div className="flex items-start gap-3">
                <Icon
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                        notification.type === "error"
                            ? "text-red-500"
                            : notification.type === "warning"
                              ? "text-amber-500"
                              : notification.type === "success"
                                ? "text-emerald-500"
                                : "text-blue-500"
                    }`}
                />
                <div className="flex-1 min-w-0">
                    <p
                        className={`text-sm leading-snug ${!notification.isRead ? "font-semibold text-gray-900 dark:text-gray-100" : "font-medium text-gray-700 dark:text-gray-300"}`}
                    >
                        {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notification.message}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                        })}
                    </p>
                </div>
                {!notification.isRead && (
                    <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                )}
            </div>
        </button>
    );
};

const NotificationPanel = () => {
    const panelOpen = useNotificationStore((s) => s.panelOpen);
    const setPanelOpen = useNotificationStore((s) => s.setPanelOpen);
    const markReadLocal = useNotificationStore((s) => s.markRead);
    const markAllReadLocal = useNotificationStore((s) => s.markAllRead);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useNotificationsQuery(20);
    const markAsReadMutation = useMarkAsReadMutation();
    const markAllAsReadMutation = useMarkAllAsReadMutation();

    if (!panelOpen) return null;

    const notifications = data?.pages?.flatMap((page) => page.data) ?? [];

    const handleMarkRead = (id: string) => {
        markAsReadMutation.mutate(id, {
            onSuccess: () => markReadLocal(id),
        });
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
                onClick={() => setPanelOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Notifications
                    </h3>
                    <button
                        onClick={handleMarkAllRead}
                        disabled={markAllAsReadMutation.isPending}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                        {markAllAsReadMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <CheckCheck className="w-3 h-3" />
                        )}
                        Mark all as read
                    </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="py-12 text-center">
                            <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No notifications yet
                            </p>
                        </div>
                    ) : (
                        <>
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={handleMarkRead}
                                />
                            ))}
                            {hasNextPage && (
                                <button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="w-full py-2.5 text-xs text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {isFetchingNextPage ? (
                                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
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
