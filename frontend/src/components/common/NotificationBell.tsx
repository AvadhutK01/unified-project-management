import { Bell } from "lucide-react";
import { useNotificationStore } from "@/store/notification.store";
import { cn } from "@/lib/utils";

const NotificationBell = () => {
    const unreadCount = useNotificationStore((s) => s.unreadCount);
    const togglePanel = useNotificationStore((s) => s.togglePanel);
    const panelOpen = useNotificationStore((s) => s.panelOpen);

    return (
        <button
            onClick={togglePanel}
            aria-label={
                unreadCount > 0
                    ? `Notifications, ${unreadCount} unread`
                    : "Notifications"
            }
            aria-expanded={panelOpen}
            aria-haspopup="dialog"
            className={cn(
                "relative flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40",
                panelOpen && "bg-accent text-foreground",
            )}
        >
            <Bell className="size-[18px]" />
            {unreadCount > 0 && (
                <span className="tabular absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white ring-2 ring-background">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}
        </button>
    );
};

export default NotificationBell;
