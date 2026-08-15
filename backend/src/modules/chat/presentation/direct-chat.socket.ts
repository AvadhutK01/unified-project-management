import { Socket } from "socket.io";
import { isOrganizationOnPlan } from "../../../shared/middleware/require-premium.js";
import {
    saveDirectMessage,
    markDirectMessagesAsRead,
    deleteDirectMessage,
    forwardDirectMessages,
} from "../infrastructure/chat.repository.js";
import { notifyDirectMessage } from "../../notifications/application/notification.service.js";
import type {
    AuthenticatedSocket,
    SocketCallbackResponse,
} from "../../../types/socket.js";

/**
 * Sanitizes errors to prevent exposing raw database or system errors to clients.
 */
function getSafeErrorMessage(error: unknown, fallback: string): string {
    if (!error || typeof error !== "object") return fallback;
    const err = error as { isOperational?: boolean; message?: string };

    if (err.isOperational && typeof err.message === "string") {
        return err.message;
    }

    const safeAllowedPhrases = [
        "Messages can only be deleted within 1 hour of sending.",
        "Recipient ID and message or file attachment are required.",
        "Member direct chat requires a Pro or Premium subscription",
        "Missing messages or recipients",
        "You can only delete your own messages",
        "Message not found",
    ];

    if (typeof err.message === "string") {
        for (const phrase of safeAllowedPhrases) {
            if (err.message.includes(phrase)) {
                return err.message;
            }
        }
    }

    return fallback;
}

/**
 * Handles real-time 1-to-1 direct chat messaging events over Socket.io.
 */
export const handleDirectChatConnection = (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const user = authSocket.user as
        | { id: string; email: string; username?: string; name?: string }
        | undefined;
    const orgId = authSocket.orgId;

    if (!user || !user.id || !orgId) return;

    socket.on(
        "direct_message:send",
        async (
            data: {
                recipientId: string;
                message?: string;
                fileUrl?: string;
                fileName?: string;
                fileType?: string;
                fileSize?: number;
                replyToId?: string;
                replyToSenderName?: string;
                replyToSnippet?: string;
                isForwarded?: boolean;
                forwardedFromSenderName?: string;
            },
            callback?: (response: SocketCallbackResponse) => void,
        ) => {
            try {
                const hasPro = await isOrganizationOnPlan(orgId, "pro");
                if (!hasPro) {
                    const errPayload = {
                        error: "Member direct chat requires a Pro or Premium subscription. Upgrade your plan to use this feature.",
                    };
                    socket.emit("direct_message:error", errPayload);
                    if (callback) callback({ status: "error", ...errPayload });
                    return;
                }

                if (!data.recipientId || (!data.message && !data.fileUrl)) {
                    const errPayload = {
                        error: "Recipient ID and message or file attachment are required.",
                    };
                    socket.emit("direct_message:error", errPayload);
                    if (callback) callback({ status: "error", ...errPayload });
                    return;
                }

                const savedMessage = await saveDirectMessage({
                    organizationId: orgId,
                    senderId: user.id,
                    receiverId: data.recipientId,
                    message: data.message ?? null,
                    fileUrl: data.fileUrl ?? null,
                    fileName: data.fileName ?? null,
                    fileType: data.fileType ?? null,
                    fileSize: data.fileSize ?? null,
                    replyToId: data.replyToId ?? null,
                    replyToSenderName: data.replyToSenderName ?? null,
                    replyToSnippet: data.replyToSnippet ?? null,
                    isForwarded: data.isForwarded ?? false,
                    forwardedFromSenderName:
                        data.forwardedFromSenderName ?? null,
                });

                const recipientRoom = `user:${data.recipientId}:org:${orgId}`;

                socket
                    .to(recipientRoom)
                    .emit("direct_message:received", savedMessage);

                if (savedMessage) {
                    const realSenderName =
                        savedMessage.senderName ||
                        savedMessage.senderEmail ||
                        "Member";
                    notifyDirectMessage(
                        user.id,
                        savedMessage.receiverId,
                        orgId,
                        data.message ||
                            (data.fileName
                                ? `[File] ${data.fileName}`
                                : "[Attachment]"),
                        realSenderName,
                    ).catch((err) =>
                        console.error("Direct chat notification error:", err),
                    );
                }

                if (callback) {
                    callback({ status: "ok", message: savedMessage });
                } else {
                    socket.emit("direct_message:sent", savedMessage);
                }
            } catch (error: unknown) {
                console.error("Socket direct message send error:", error);
                const safeMessage = getSafeErrorMessage(
                    error,
                    "Failed to send direct message. Please try again later.",
                );
                const errPayload = { error: safeMessage };
                socket.emit("direct_message:error", errPayload);
                if (callback) callback({ status: "error", ...errPayload });
            }
        },
    );

    socket.on(
        "direct_message:delete",
        async (
            data: { messageId: string; recipientId: string },
            callback?: (response: SocketCallbackResponse) => void,
        ) => {
            try {
                if (!data.messageId) return;

                const deleterName = user.username || user.name || "Member";
                await deleteDirectMessage(
                    orgId,
                    data.messageId,
                    user.id,
                    deleterName,
                );

                const deletePayload = {
                    messageId: data.messageId,
                    deletedByUserName: deleterName,
                };

                if (data.recipientId) {
                    const recipientRoom = `user:${data.recipientId}:org:${orgId}`;
                    socket
                        .to(recipientRoom)
                        .emit("direct_message:deleted", deletePayload);
                }

                if (callback) {
                    callback({ status: "ok", ...deletePayload });
                } else {
                    socket.emit("direct_message:deleted", deletePayload);
                }
            } catch (error: unknown) {
                console.error("Socket direct message delete error:", error);
                const safeMessage = getSafeErrorMessage(
                    error,
                    "Failed to delete message. Please try again later.",
                );
                const errPayload = { error: safeMessage };
                socket.emit("direct_message:error", errPayload);
                if (callback) callback({ status: "error", ...errPayload });
            }
        },
    );

    socket.on(
        "direct_message:forward",
        async (
            data: { messageIds: string[]; recipientIds: string[] },
            callback?: (response: SocketCallbackResponse) => void,
        ) => {
            try {
                if (!data.messageIds?.length || !data.recipientIds?.length) {
                    if (callback)
                        callback({
                            status: "error",
                            error: "Missing messages or recipients",
                        });
                    return;
                }

                const senderName = user.username || user.name || "Member";
                const forwardedMessages = await forwardDirectMessages({
                    organizationId: orgId,
                    senderId: user.id,
                    messageIds: data.messageIds,
                    recipientIds: data.recipientIds,
                    senderName,
                });

                for (const msg of forwardedMessages) {
                    if (!msg) continue;
                    const recipientRoom = `user:${msg.receiverId}:org:${orgId}`;
                    socket
                        .to(recipientRoom)
                        .emit("direct_message:received", msg);
                    const realSenderName =
                        msg.senderName || msg.senderEmail || "Member";
                    notifyDirectMessage(
                        user.id,
                        msg.receiverId,
                        orgId,
                        "Forwarded message(s)",
                        realSenderName,
                    ).catch((err) =>
                        console.error(
                            "Direct chat forward notification error:",
                            err,
                        ),
                    );
                }

                if (callback) {
                    callback({
                        status: "ok",
                        count: forwardedMessages.length,
                        messages: forwardedMessages,
                    });
                }
            } catch (error: unknown) {
                console.error("Socket direct message forward error:", error);
                const safeMessage = getSafeErrorMessage(
                    error,
                    "Failed to forward messages. Please try again later.",
                );
                const errPayload = { error: safeMessage };
                socket.emit("direct_message:error", errPayload);
                if (callback) callback({ status: "error", ...errPayload });
            }
        },
    );

    socket.on(
        "direct_message:typing",
        (data: { recipientId: string; isTyping: boolean }) => {
            if (!data.recipientId) return;
            const recipientRoom = `user:${data.recipientId}:org:${orgId}`;
            socket.to(recipientRoom).emit("direct_message:typing", {
                senderId: user.id,
                isTyping: !!data.isTyping,
            });
        },
    );

    socket.on("direct_message:read", async (data: { senderId: string }) => {
        if (!data.senderId) return;
        try {
            await markDirectMessagesAsRead(orgId, data.senderId, user.id);
            const senderRoom = `user:${data.senderId}:org:${orgId}`;
            socket.to(senderRoom).emit("direct_message:read", {
                readBy: user.id,
            });
        } catch (error) {
            console.error("Socket direct message read error:", error);
        }
    });
};
