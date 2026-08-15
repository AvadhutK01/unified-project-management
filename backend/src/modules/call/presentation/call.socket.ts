import { Socket } from "socket.io";
import { isOrganizationOnPlan } from "../../../shared/middleware/require-premium.js";
import type {
    AuthenticatedSocket,
    CallInitiateData,
    CallAcceptData,
    CallDeclineData,
    CallOfferData,
    CallAnswerData,
    CallIceCandidateData,
    CallCameraToggleData,
    CallScreenshareData,
} from "../../../types/socket.js";

/**
 * Handles WebRTC audio and video call signaling events over Socket.io.
 */
export const handleCallConnection = (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const user = authSocket.user;
    const orgId = authSocket.orgId;

    if (!user || !user.id || !orgId) return;

    socket.on("call:initiate", async (data: CallInitiateData) => {
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
    });

    socket.on("call:accept", (data: CallAcceptData) => {
        const callerRoom = `user:${data.callerId}:org:${orgId}`;
        socket.to(callerRoom).emit("call:accepted", {
            callId: data.callId,
            recipientId: user.id,
        });
    });

    socket.on("call:decline", (data: CallDeclineData) => {
        const callerRoom = `user:${data.callerId}:org:${orgId}`;
        socket.to(callerRoom).emit("call:declined", {
            callId: data.callId,
            recipientId: user.id,
        });
    });

    socket.on("call:offer", (data: CallOfferData) => {
        const targetRoom = `user:${data.targetUserId}:org:${orgId}`;
        socket.to(targetRoom).emit("call:offer", {
            callId: data.callId,
            senderId: user.id,
            sdp: data.sdp,
        });
    });

    socket.on("call:answer", (data: CallAnswerData) => {
        const targetRoom = `user:${data.targetUserId}:org:${orgId}`;
        socket.to(targetRoom).emit("call:answer", {
            callId: data.callId,
            senderId: user.id,
            sdp: data.sdp,
        });
    });

    socket.on("call:ice-candidate", (data: CallIceCandidateData) => {
        const targetRoom = `user:${data.targetUserId}:org:${orgId}`;
        socket.to(targetRoom).emit("call:ice-candidate", {
            callId: data.callId,
            senderId: user.id,
            candidate: data.candidate,
        });
    });

    socket.on("call:camera-toggled", (data: CallCameraToggleData) => {
        const targetRoom = `user:${data.targetUserId}:org:${orgId}`;
        socket.to(targetRoom).emit("call:camera-toggled", {
            callId: data.callId,
            senderId: user.id,
            enabled: data.enabled,
        });
    });

    socket.on("call:screenshare-started", (data: CallScreenshareData) => {
        const targetRoom = `user:${data.targetUserId}:org:${orgId}`;
        socket.to(targetRoom).emit("call:screenshare-started", {
            callId: data.callId,
            senderId: user.id,
            streamId: data.streamId,
        });
    });

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
