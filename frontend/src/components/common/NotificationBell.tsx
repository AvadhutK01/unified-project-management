import { Bell } from "lucide-react";
import { useNotificationStore } from "@/store/notification.store";

const NotificationBell = () => {
    const unreadCount = useNotificationStore((s) => s.unreadCount);
    const togglePanel = useNotificationStore((s) => s.togglePanel);

    return (
        <button
            onClick={togglePanel}
            className="relative w-10 h-10 flex items-center justify-center transition-colors cursor-pointer"
        >
            <Bell className="w-5 h-5 text-foreground" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}
        </button>
    );
};

export default NotificationBell;
