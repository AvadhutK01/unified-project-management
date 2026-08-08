import { useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { usePresenceStore } from "../store/presence.store";

/**
 * Hook to track user activity (mousemove, keydown, click, scroll) and transition presence to 'away' after 1 minute of inactivity.
 * Also listens to presence synchronization events from the server to update the global presence store.
 */
export const useUserActivityTracker = () => {
    const socket = useSocket();
    const setPresence = usePresenceStore((s) => s.setPresence);
    const syncPresence = usePresenceStore((s) => s.syncPresence);
    const clearPresence = usePresenceStore((s) => s.clearPresence);

    const isAwayRef = useRef(false);
    const timeoutRef = useRef<any>(null);

    useEffect(() => {
        if (!socket) {
            clearPresence();
            return;
        }

        const handleSync = (
            map: Record<string, "active" | "away" | "offline">,
        ) => {
            syncPresence(map);
        };

        const handleUpdate = (data: {
            memberId: string;
            status: "active" | "away" | "offline";
        }) => {
            setPresence(data.memberId, data.status);
        };

        socket.on("presence:sync", handleSync);
        socket.on("presence:update", handleUpdate);

        const requestSync = () => {
            socket.emit("presence:request_sync");
        };

        socket.on("connect", requestSync);

        if (socket.connected) {
            requestSync();
        }

        const resetTimer = () => {
            if (isAwayRef.current) {
                isAwayRef.current = false;
                socket.emit("user:status_change", { status: "active" });
            }

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                isAwayRef.current = true;
                socket.emit("user:status_change", { status: "away" });
            }, 60000);
        };

        const events = ["mousemove", "keydown", "click", "scroll", "mousedown"];
        events.forEach((event) => window.addEventListener(event, resetTimer));

        resetTimer();

        return () => {
            socket.off("presence:sync", handleSync);
            socket.off("presence:update", handleUpdate);
            socket.off("connect", requestSync);
            events.forEach((event) =>
                window.removeEventListener(event, resetTimer),
            );
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [socket, setPresence, syncPresence, clearPresence]);
};
export default useUserActivityTracker;
