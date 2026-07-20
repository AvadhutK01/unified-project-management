import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import { useNotificationStore } from "@/store/notification.store";
import type { Notification } from "../types/notification.types";

export const useNotificationSocket = () => {
    const socket = useSocket();
    const queryClient = useQueryClient();
    const addNotification = useNotificationStore((s) => s.addNotification);
    const handledIdsRef = useRef<Set<string>>(new Set());

    const handleNewNotification = useCallback(
        (notification: Notification) => {
            if (handledIdsRef.current.has(notification.id)) return;
            handledIdsRef.current.add(notification.id);

            addNotification(notification);
            queryClient.invalidateQueries({ queryKey: ["notifications"] });

            const audio = new Audio("/notification.mp3");
            audio.play().catch(() => {});

            if (document.hasFocus()) {
                toast(notification.title, {
                    description: notification.message,
                });
            } else if (
                "serviceWorker" in navigator &&
                Notification.permission === "granted"
            ) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification(notification.title, {
                        body: notification.message,
                        icon: "/favicon.svg",
                    });
                });
            }
        },
        [addNotification],
    );

    useEffect(() => {
        if (!socket) return;

        socket.on("notification:new", handleNewNotification);

        return () => {
            socket.off("notification:new", handleNewNotification);
        };
    }, [socket, handleNewNotification]);
};
