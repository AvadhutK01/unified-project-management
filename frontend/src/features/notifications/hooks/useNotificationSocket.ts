import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import { useNotificationStore } from "@/store/notification.store";
import { useMarkAsReadMutation } from "./useNotifications";
import { getNotificationRoute } from "../utils/notification-router";
import type { Notification } from "../types/notification.types";

import { useDirectChat } from "@/features/chat/context/DirectChatContext";

export const useNotificationSocket = () => {
    const socket = useSocket();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { isOpen, activeRecipient } = useDirectChat();
    const addNotification = useNotificationStore((s) => s.addNotification);
    const markReadLocal = useNotificationStore((s) => s.markRead);
    const markAsReadMutation = useMarkAsReadMutation();
    const handledIdsRef = useRef<Set<string>>(new Set());

    const handleNewNotification = useCallback(
        (notification: Notification) => {
            if (handledIdsRef.current.has(notification.id)) return;
            handledIdsRef.current.add(notification.id);

            addNotification(notification);
            queryClient.invalidateQueries({ queryKey: ["notifications"] });

            const isDirectChatNotif =
                notification.entityType === "direct_chat" ||
                notification.type === "direct_message";
            const senderId =
                notification.metadata?.senderUserId || notification.entityId;
            const isReadingCurrentChat =
                isDirectChatNotif && isOpen && activeRecipient?.id === senderId;

            if (isReadingCurrentChat) return;

            const audio = new Audio("/notification.mp3");
            audio.play().catch(() => {});

            const handleToastClick = () => {
                if (!notification.isRead) {
                    markAsReadMutation.mutate(notification.id, {
                        onSuccess: () => markReadLocal(notification.id),
                    });
                }
                const route = getNotificationRoute(notification);
                navigate(route);
            };

            if (document.hasFocus()) {
                toast(notification.title, {
                    description: notification.message,
                    action: {
                        label: "View",
                        onClick: handleToastClick,
                    },
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
        [
            addNotification,
            markReadLocal,
            markAsReadMutation,
            navigate,
            queryClient,
            isOpen,
            activeRecipient,
        ],
    );

    useEffect(() => {
        if (!socket) return;

        socket.on("notification:new", handleNewNotification);

        return () => {
            socket.off("notification:new", handleNewNotification);
        };
    }, [socket, handleNewNotification]);
};
