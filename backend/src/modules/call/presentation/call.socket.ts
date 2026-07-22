import { Socket } from "socket.io";
import { isOrganizationOnPlan } from "../../../shared/middleware/require-premium.js";

/**
 * Handles WebRTC audio and video call signaling events over Socket.io.
 */
export const handleCallConnection = (socket: Socket) => {
    const user = (socket as any).user;
    const orgId = (socket as any).orgId;

    if (!user || !user.id || !orgId) return;

    socket.on(
        "call:initiate",
        async (data: {
            recipientId: string;
            callType?: "voice" | "video";
            callerName?: string;
            callerAvatar?: string;
        }) => {
            const hasPro = await isOrganizationOnPlan(orgId, "pro");
            if (!hasPro) {
                socket.emit("call:error", {
                    message:
                        "Member calling requires a Pro or Premium subscription. Upgrade your plan to use this feature.",
                });
                return;
            }

            const recipientRoom = `user:${data.recipientId}:org:${orgId}`;
            const callId = `call_${user.id}_${Date.now()}`;

            socket.to(recipientRoom).emit("call:incoming", {
                callId,
                callerId: user.id,
                callType: data.callType || "voice",
                callerName: data.callerName || user.email,
                callerAvatar: data.callerAvatar,
            });
        },
    );

    socket.on("call:accept", (data: { callId: string; callerId: string }) => {
        const callerRoom = `user:${data.callerId}:org:${orgId}`;
        socket.to(callerRoom).emit("call:accepted", {
            callId: data.callId,
            recipientId: user.id,
        });
    });

    socket.on("call:decline", (data: { callId: string; callerId: string }) => {
        const callerRoom = `user:${data.callerId}:org:${orgId}`;
        socket.to(callerRoom).emit("call:declined", {
            callId: data.callId,
            recipientId: user.id,
        });
    });

    socket.on(
        "call:offer",
        (data: { callId: string; targetUserId: string; sdp: any }) => {
            const targetRoom = `user:${data.targetUserId}:org:${orgId}`;
            socket.to(targetRoom).emit("call:offer", {
                callId: data.callId,
                senderId: user.id,
                sdp: data.sdp,
            });
        },
    );

    socket.on(
        "call:answer",
        (data: { callId: string; targetUserId: string; sdp: any }) => {
            const targetRoom = `user:${data.targetUserId}:org:${orgId}`;
            socket.to(targetRoom).emit("call:answer", {
                callId: data.callId,
                senderId: user.id,
                sdp: data.sdp,
            });
        },
    );

    socket.on(
        "call:ice-candidate",
        (data: { callId: string; targetUserId: string; candidate: any }) => {
            const targetRoom = `user:${data.targetUserId}:org:${orgId}`;
            socket.to(targetRoom).emit("call:ice-candidate", {
                callId: data.callId,
                senderId: user.id,
                candidate: data.candidate,
            });
        },
    );

    socket.on(
        "call:camera-toggled",
        (data: { callId: string; targetUserId: string; enabled: boolean }) => {
            const targetRoom = `user:${data.targetUserId}:org:${orgId}`;
            socket.to(targetRoom).emit("call:camera-toggled", {
                callId: data.callId,
                senderId: user.id,
                enabled: data.enabled,
            });
        },
    );

    socket.on(
        "call:screenshare-started",
        (data: { callId: string; targetUserId: string; streamId?: string }) => {
            const targetRoom = `user:${data.targetUserId}:org:${orgId}`;
            socket.to(targetRoom).emit("call:screenshare-started", {
                callId: data.callId,
                senderId: user.id,
                streamId: data.streamId,
            });
        },
    );

    socket.on(
        "call:screenshare-stopped",
        (data: { callId: string; targetUserId: string }) => {
            const targetRoom = `user:${data.targetUserId}:org:${orgId}`;
            socket.to(targetRoom).emit("call:screenshare-stopped", {
                callId: data.callId,
                senderId: user.id,
            });
        },
    );

    socket.on("call:end", (data: { callId: string; targetUserId: string }) => {
        const targetRoom = `user:${data.targetUserId}:org:${orgId}`;
        socket.to(targetRoom).emit("call:ended", {
            callId: data.callId,
            senderId: user.id,
        });
    });
};
