import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import { useOrganizationStore } from "@/store/organization.store";
import { useNotificationStore } from "@/store/notification.store";
import { api } from "@/lib/axios";
import { toast } from "sonner";

export interface DirectMessage {
    id: string;
    organizationId: string;
    senderId: string;
    receiverId: string;
    message: string | null;
    fileUrl: string | null;
    fileName: string | null;
    fileType: string | null;
    fileSize: number | null;
    isRead: boolean;
    replyToId?: string | null;
    replyToSenderName?: string | null;
    replyToSnippet?: string | null;
    isForwarded?: boolean;
    forwardedFromSenderName?: string | null;
    isDeleted?: boolean;
    deletedByUserName?: string | null;
    createdAt: string;
    senderName?: string;
    senderEmail?: string;
}

interface ActiveRecipient {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
}

interface DirectChatContextType {
    isOpen: boolean;
    activeRecipient: ActiveRecipient | null;
    messages: DirectMessage[];
    isPartnerTyping: boolean;
    isLoadingMessages: boolean;
    isLoadingMore: boolean;
    hasMoreMessages: boolean;
    replyToMessage: DirectMessage | null;
    unreadCounts: Record<string, number>;
    setReplyToMessage: (msg: DirectMessage | null) => void;
    openChatWithMember: (
        memberId: string,
        name: string,
        email?: string,
    ) => void;
    closeChat: () => void;
    fetchMoreMessages: () => Promise<void>;
    sendMessage: (
        text?: string,
        attachment?: {
            fileUrl: string;
            fileName: string;
            fileType: string;
            fileSize: number;
        },
        replyTo?: DirectMessage | null,
    ) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    forwardMessages: (
        messageIds: string[],
        recipientIds: string[],
    ) => Promise<void>;
    uploadAttachment: (file: File) => Promise<{
        fileUrl: string;
        fileName: string;
        fileType: string;
        fileSize: number;
    }>;
    sendTypingStatus: (isTyping: boolean) => void;
}

const DirectChatContext = createContext<DirectChatContextType | undefined>(
    undefined,
);

export const DirectChatProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const socket = useSocket();
    const queryClient = useQueryClient();
    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );
    const orgId = activeOrganization?.id;

    const [isOpen, setIsOpen] = useState(false);
    const [activeRecipient, setActiveRecipient] =
        useState<ActiveRecipient | null>(null);
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [page, setPage] = useState(1);
    const [replyToMessage, setReplyToMessage] = useState<DirectMessage | null>(
        null,
    );
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>(
        {},
    );

    const activeRecipientRef = useRef<ActiveRecipient | null>(null);
    const isOpenRef = useRef(false);

    const updateActiveRecipient = (recipient: ActiveRecipient | null) => {
        activeRecipientRef.current = recipient;
        setActiveRecipient(recipient);
    };

    const updateIsOpen = (open: boolean) => {
        isOpenRef.current = open;
        setIsOpen(open);
    };

    const fetchMessages = useCallback(
        async (recipientId: string, pageNum = 1, limitNum = 10) => {
            if (!orgId || !recipientId) return;
            try {
                setIsLoadingMessages(true);
                const res = await api.get(
                    `/members/chat/${recipientId}?page=${pageNum}&limit=${limitNum}`,
                    {
                        headers: { "x-organization-id": orgId },
                    },
                );
                if (res.data?.status === "success") {
                    const items = Array.isArray(res.data.data)
                        ? res.data.data
                        : res.data.data?.data || [];
                    setMessages(items);

                    const pagination = res.data.pagination;
                    if (pagination) {
                        setHasMoreMessages(
                            pagination.page < pagination.totalPages,
                        );
                        setPage(pagination.page);
                    } else {
                        setHasMoreMessages(items.length >= limitNum);
                    }

                    useNotificationStore
                        .getState()
                        .markReadForEntity(recipientId, "direct_chat");
                    queryClient.invalidateQueries({
                        queryKey: ["notifications"],
                    });
                }
            } catch (error: any) {
                console.error("Failed to fetch direct chat messages:", error);
                toast.error(
                    error?.response?.data?.message ||
                        "Failed to load chat history.",
                );
            } finally {
                setIsLoadingMessages(false);
            }
        },
        [orgId],
    );

    const fetchMoreMessages = useCallback(async () => {
        const recipient = activeRecipientRef.current;
        if (!recipient || !orgId || isLoadingMore || !hasMoreMessages) return;

        const nextPage = page + 1;
        try {
            setIsLoadingMore(true);
            const res = await api.get(
                `/members/chat/${recipient.id}?page=${nextPage}&limit=10`,
                {
                    headers: { "x-organization-id": orgId },
                },
            );

            if (res.data?.status === "success") {
                const items = Array.isArray(res.data.data)
                    ? res.data.data
                    : res.data.data?.data || [];

                setMessages((prev) => [...items, ...prev]);
                setPage(nextPage);

                const pagination = res.data.pagination;
                if (pagination) {
                    setHasMoreMessages(pagination.page < pagination.totalPages);
                } else {
                    setHasMoreMessages(items.length >= 10);
                }
            }
        } catch (error: any) {
            console.error("Failed to fetch more chat messages:", error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [orgId, page, isLoadingMore, hasMoreMessages]);

    const openChatWithMember = useCallback(
        (memberId: string, name: string, email?: string) => {
            updateActiveRecipient({ id: memberId, name, email });
            updateIsOpen(true);
            setIsPartnerTyping(false);
            setReplyToMessage(null);
            setPage(1);
            setHasMoreMessages(true);
            setUnreadCounts((prev) => {
                const next = { ...prev };
                delete next[memberId];
                return next;
            });
            fetchMessages(memberId, 1, 10);
        },
        [fetchMessages],
    );

    const location = useLocation();

    const closeChat = useCallback(() => {
        updateIsOpen(false);
        updateActiveRecipient(null);
        setMessages([]);
        setIsPartnerTyping(false);
        setReplyToMessage(null);
        setPage(1);
        setHasMoreMessages(true);
    }, []);

    useEffect(() => {
        if (isOpen && !location.pathname.includes("/members")) {
            closeChat();
        }
    }, [location.pathname, isOpen, closeChat]);

    const sendTypingStatus = useCallback(
        (isTyping: boolean) => {
            if (!socket || !activeRecipientRef.current) return;
            socket.emit("direct_message:typing", {
                recipientId: activeRecipientRef.current.id,
                isTyping,
            });
        },
        [socket],
    );

    const sendMessage = useCallback(
        async (
            text?: string,
            attachment?: {
                fileUrl: string;
                fileName: string;
                fileType: string;
                fileSize: number;
            },
            replyTo?: DirectMessage | null,
        ) => {
            if (!socket) {
                toast.error("Real-time socket connection unavailable.");
                return;
            }
            const recipient = activeRecipientRef.current;
            if (!recipient) return;

            if (!text?.trim() && !attachment) return;

            sendTypingStatus(false);

            const snippet = replyTo
                ? replyTo.message ||
                  (replyTo.fileName
                      ? `[File] ${replyTo.fileName}`
                      : "[Attachment]")
                : null;

            const payload = {
                recipientId: recipient.id,
                message: text?.trim() || null,
                fileUrl: attachment?.fileUrl || null,
                fileName: attachment?.fileName || null,
                fileType: attachment?.fileType || null,
                fileSize: attachment?.fileSize || null,
                replyToId: replyTo?.id || null,
                replyToSenderName: replyTo?.senderName || null,
                replyToSnippet: snippet,
            };

            socket.emit("direct_message:send", payload, (response: any) => {
                if (response?.status === "ok" && response.message) {
                    setMessages((prev) => [...prev, response.message]);
                    setReplyToMessage(null);
                } else if (response?.error) {
                    toast.error(response.error);
                }
            });
        },
        [socket, sendTypingStatus],
    );

    const deleteMessage = useCallback(
        async (messageId: string) => {
            if (!socket) {
                toast.error("Real-time socket connection unavailable.");
                return;
            }

            const recipient = activeRecipientRef.current;

            socket.emit(
                "direct_message:delete",
                { messageId, recipientId: recipient?.id },
                (response: any) => {
                    if (response?.status === "ok") {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === messageId
                                    ? {
                                          ...m,
                                          isDeleted: true,
                                          deletedByUserName:
                                              response.deletedByUserName,
                                          message: null,
                                          fileUrl: null,
                                          fileName: null,
                                          fileType: null,
                                          fileSize: null,
                                      }
                                    : m,
                            ),
                        );
                        toast.success("Message deleted.");
                    } else if (response?.error) {
                        toast.error(response.error);
                    }
                },
            );
        },
        [socket],
    );

    const forwardMessages = useCallback(
        async (messageIds: string[], recipientIds: string[]) => {
            if (!socket) {
                toast.error("Real-time socket connection unavailable.");
                return;
            }

            if (!messageIds.length || !recipientIds.length) return;

            socket.emit(
                "direct_message:forward",
                { messageIds, recipientIds },
                (response: any) => {
                    if (response?.status === "ok") {
                        toast.success(
                            `Forwarded ${messageIds.length} message(s) successfully!`,
                        );
                    } else if (response?.error) {
                        toast.error(response.error);
                    }
                },
            );
        },
        [socket],
    );

    const uploadAttachment = useCallback(
        async (file: File) => {
            if (!orgId) throw new Error("Organization ID missing");

            const formData = new FormData();
            formData.append("file", file);

            const res = await api.post(`/members/chat/upload`, formData, {
                headers: {
                    "x-organization-id": orgId,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data?.status === "success" && res.data.data) {
                return res.data.data;
            } else {
                throw new Error("File upload failed");
            }
        },
        [orgId],
    );

    useEffect(() => {
        if (!socket) return;

        const onReceived = (message: DirectMessage) => {
            const currentRecipient = activeRecipientRef.current;
            const currentIsOpen = isOpenRef.current;

            if (
                currentIsOpen &&
                (currentRecipient?.id === message.senderId ||
                    currentRecipient?.id === message.receiverId)
            ) {
                setMessages((prev) => [...prev, message]);
                if (currentRecipient?.id === message.senderId) {
                    socket.emit("direct_message:read", {
                        senderId: message.senderId,
                    });
                    useNotificationStore
                        .getState()
                        .markReadForEntity(message.senderId, "direct_chat");
                    queryClient.invalidateQueries({
                        queryKey: ["notifications"],
                    });
                }
            } else {
                const sId = message.senderId;
                setUnreadCounts((prev) => ({
                    ...prev,
                    [sId]: (prev[sId] || 0) + 1,
                }));
            }
        };

        const onDeleted = (data: {
            messageId: string;
            deletedByUserName: string;
        }) => {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === data.messageId
                        ? {
                              ...m,
                              isDeleted: true,
                              deletedByUserName: data.deletedByUserName,
                              message: null,
                              fileUrl: null,
                              fileName: null,
                              fileType: null,
                              fileSize: null,
                          }
                        : m,
                ),
            );
        };

        const onTyping = (data: { senderId: string; isTyping: boolean }) => {
            const currentRecipient = activeRecipientRef.current;
            if (currentRecipient?.id === data.senderId) {
                setIsPartnerTyping(data.isTyping);
            }
        };

        const onRead = (data: { readBy: string }) => {
            const currentRecipient = activeRecipientRef.current;
            if (currentRecipient?.id === data.readBy) {
                setMessages((prev) =>
                    prev.map((msg) => ({ ...msg, isRead: true })),
                );
            }
        };

        socket.on("direct_message:received", onReceived);
        socket.on("direct_message:deleted", onDeleted);
        socket.on("direct_message:typing", onTyping);
        socket.on("direct_message:read", onRead);

        return () => {
            socket.off("direct_message:received", onReceived);
            socket.off("direct_message:deleted", onDeleted);
            socket.off("direct_message:typing", onTyping);
            socket.off("direct_message:read", onRead);
        };
    }, [socket]);

    return (
        <DirectChatContext.Provider
            value={{
                isOpen,
                activeRecipient,
                messages,
                isPartnerTyping,
                isLoadingMessages,
                isLoadingMore,
                hasMoreMessages,
                replyToMessage,
                unreadCounts,
                setReplyToMessage,
                openChatWithMember,
                closeChat,
                fetchMoreMessages,
                sendMessage,
                deleteMessage,
                forwardMessages,
                uploadAttachment,
                sendTypingStatus,
            }}
        >
            {children}
        </DirectChatContext.Provider>
    );
};

export const useDirectChat = () => {
    const context = useContext(DirectChatContext);
    if (!context) {
        throw new Error(
            "useDirectChat must be used within a DirectChatProvider",
        );
    }
    return context;
};
