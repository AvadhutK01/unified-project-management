import { Socket } from "socket.io";

export interface AuthenticatedSocket extends Socket {
    user?: {
        id: string;
        email: string;
        username?: string;
        name?: string;
    };
    orgId?: string;
}

import type { DirectMessageSelect } from "./database.js";

export interface SocketCallbackResponse {
    status: "ok" | "error";
    error?: string;
    message?: DirectMessageSelect | undefined;
    messages?: (DirectMessageSelect | undefined)[];
    count?: number;
    messageId?: string;
    deletedByUserName?: string;
}

export interface CallInitiateData {
    recipientId: string;
    callType?: "voice" | "video";
    callerName?: string;
    callerAvatar?: string;
}

export interface CallAcceptData {
    callId: string;
    callerId: string;
}

export interface CallDeclineData {
    callId: string;
    callerId: string;
}

export interface CallOfferData {
    callId: string;
    targetUserId: string;
    sdp: {
        type: string;
        sdp: string;
    };
}

export interface CallAnswerData {
    callId: string;
    targetUserId: string;
    sdp: {
        type: string;
        sdp: string;
    };
}

export interface CallIceCandidateData {
    callId: string;
    targetUserId: string;
    candidate: {
        candidate: string;
        sdpMid?: string | null;
        sdpMLineIndex?: number | null;
    };
}

export interface CallCameraToggleData {
    callId: string;
    targetUserId: string;
    enabled: boolean;
}

export interface CallScreenshareData {
    callId: string;
    targetUserId: string;
    streamId?: string;
}
