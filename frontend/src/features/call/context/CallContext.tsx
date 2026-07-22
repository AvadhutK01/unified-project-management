import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
} from "react";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";

export type CallStatus =
    | "idle"
    | "calling"
    | "incoming"
    | "connected"
    | "declined";
export type CallType = "voice" | "video";

interface ActiveCall {
    callId: string;
    targetId: string;
    targetName: string;
    targetAvatar?: string;
    callType: CallType;
    isCaller: boolean;
}

interface CallContextType {
    callStatus: CallStatus;
    activeCall: ActiveCall | null;
    isMuted: boolean;
    isVideoEnabled: boolean;
    isScreenSharing: boolean;
    isRemoteScreenSharing: boolean;
    isRemoteCameraEnabled: boolean;
    callDuration: number;
    remoteStream: MediaStream | null;
    remoteScreenStream: MediaStream | null;
    localCameraStream: MediaStream | null;
    localScreenStream: MediaStream | null;
    initiateCall: (
        recipientId: string,
        recipientName: string,
        callType?: CallType,
        recipientAvatar?: string,
    ) => void;
    acceptCall: () => void;
    declineCall: () => void;
    endCall: () => void;
    toggleMute: () => void;
    toggleCamera: () => Promise<void>;
    toggleScreenShare: () => Promise<void>;
}

const ICE_SERVERS = {
    iceServers: [
        {
            urls: import.meta.env.VITE_ICE_SERVER_URL,
            username: import.meta.env.VITE_ICE_SERVER_USERNAME,
            credential: import.meta.env.VITE_ICE_SERVER_CREDENTIAL,
        },
    ],
};

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const socket = useSocket();
    const [callStatus, setCallStatus] = useState<CallStatus>("idle");
    const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);
    const [isRemoteCameraEnabled, setIsRemoteCameraEnabled] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [remoteScreenStream, setRemoteScreenStream] =
        useState<MediaStream | null>(null);
    const [localCameraStream, setLocalCameraStream] =
        useState<MediaStream | null>(null);
    const [localScreenStream, setLocalScreenStream] =
        useState<MediaStream | null>(null);

    const activeCallRef = useRef<ActiveCall | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const pendingIceCandidatesRef = useRef<any[]>([]);
    const localAudioStreamRef = useRef<MediaStream | null>(null);
    const localCameraStreamRef = useRef<MediaStream | null>(null);
    const localScreenStreamRef = useRef<MediaStream | null>(null);
    const videoSenderRef = useRef<RTCRtpSender | null>(null);
    const screenSenderRef = useRef<RTCRtpSender | null>(null);
    const remoteScreenStreamIdRef = useRef<string | null>(null);
    const ringtoneAudioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<any>(null);

    const updateActiveCall = (call: ActiveCall | null) => {
        activeCallRef.current = call;
        setActiveCall(call);
    };

    const stopRingtone = () => {
        if (ringtoneAudioRef.current) {
            ringtoneAudioRef.current.pause();
            ringtoneAudioRef.current.currentTime = 0;
        }
    };

    const cleanupCall = () => {
        stopRingtone();

        if (localAudioStreamRef.current) {
            localAudioStreamRef.current
                .getTracks()
                .forEach((track) => track.stop());
            localAudioStreamRef.current = null;
        }

        if (localCameraStreamRef.current) {
            localCameraStreamRef.current
                .getTracks()
                .forEach((track) => track.stop());
            localCameraStreamRef.current = null;
        }

        if (localScreenStreamRef.current) {
            localScreenStreamRef.current
                .getTracks()
                .forEach((track) => track.stop());
            localScreenStreamRef.current = null;
        }

        videoSenderRef.current = null;
        screenSenderRef.current = null;
        remoteScreenStreamIdRef.current = null;
        pendingIceCandidatesRef.current = [];

        if (peerConnectionRef.current) {
            pcUnsubscribe(peerConnectionRef.current);
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setCallStatus("idle");
        updateActiveCall(null);
        setIsMuted(false);
        setIsVideoEnabled(false);
        setIsScreenSharing(false);
        setIsRemoteScreenSharing(false);
        setIsRemoteCameraEnabled(false);
        setCallDuration(0);
        setRemoteStream(null);
        setRemoteScreenStream(null);
        setLocalCameraStream(null);
        setLocalScreenStream(null);
    };

    const pcUnsubscribe = (pc: RTCPeerConnection) => {
        pc.ontrack = null;
        pc.onicecandidate = null;
    };

    useEffect(() => {
        const ringtone = new Audio("/viber_call.mp3");
        ringtone.loop = true;
        ringtoneAudioRef.current = ringtone;

        return () => {
            ringtone.pause();
            ringtone.currentTime = 0;
        };
    }, []);

    useEffect(() => {
        if (callStatus === "incoming") {
            if (ringtoneAudioRef.current) {
                ringtoneAudioRef.current.currentTime = 0;
                ringtoneAudioRef.current.play().catch(() => {});
            }
        } else {
            stopRingtone();
        }
    }, [callStatus]);

    const processPendingIceCandidates = async () => {
        const pc = peerConnectionRef.current;
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            while (pendingIceCandidatesRef.current.length > 0) {
                const candidate = pendingIceCandidatesRef.current.shift();
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("Error processing pending ice candidate", e);
                }
            }
        }
    };

    const setupPeerConnection = (callId: string, targetUserId: string) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        pc.ontrack = (event) => {
            const track = event.track;
            const stream = event.streams[0];
            if (!stream) return;

            if (track.kind === "audio") {
                const audioStream = new MediaStream([track]);
                setRemoteStream((prev) => {
                    if (prev) {
                        const existingTracks = prev
                            .getTracks()
                            .filter((t) => t.kind !== "audio");
                        return new MediaStream([...existingTracks, track]);
                    }
                    return audioStream;
                });
            } else if (track.kind === "video") {
                if (stream.id === remoteScreenStreamIdRef.current) {
                    setRemoteScreenStream(stream);
                } else {
                    setRemoteStream((prev) => {
                        if (prev) {
                            const existingTracks = prev
                                .getTracks()
                                .filter((t) => t.kind !== "video");
                            return new MediaStream([...existingTracks, track]);
                        }
                        return new MediaStream([track]);
                    });
                }
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit("call:ice-candidate", {
                    callId,
                    targetUserId,
                    candidate: event.candidate,
                });
            }
        };

        return pc;
    };

    const setupLocalMediaTracks = async (
        pc: RTCPeerConnection,
        type: CallType,
    ) => {
        const wantVideo = type === "video";
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
                video: wantVideo,
            });

            const audioTrack = mediaStream.getAudioTracks()[0];
            if (audioTrack) {
                localAudioStreamRef.current = new MediaStream([audioTrack]);
                pc.addTrack(audioTrack, mediaStream);
            }

            const videoTrack = mediaStream.getVideoTracks()[0];
            if (videoTrack) {
                const camStream = new MediaStream([videoTrack]);
                localCameraStreamRef.current = camStream;
                setLocalCameraStream(camStream);
                setIsVideoEnabled(true);
                videoSenderRef.current = pc.addTrack(videoTrack, mediaStream);
            }
        } catch (err) {
            if (wantVideo) {
                const audioOnly = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                });
                const audioTrack = audioOnly.getAudioTracks()[0];
                if (audioTrack) {
                    localAudioStreamRef.current = new MediaStream([audioTrack]);
                    pc.addTrack(audioTrack, audioOnly);
                }
            } else {
                throw err;
            }
        }
    };

    useEffect(() => {
        if (!socket) return;

        const onIncoming = (data: {
            callId: string;
            callerId: string;
            callType?: CallType;
            callerName: string;
            callerAvatar?: string;
        }) => {
            if (callStatus !== "idle") {
                socket.emit("call:decline", {
                    callId: data.callId,
                    callerId: data.callerId,
                });
                return;
            }

            updateActiveCall({
                callId: data.callId,
                targetId: data.callerId,
                callType: data.callType || "voice",
                targetName: data.callerName,
                targetAvatar: data.callerAvatar,
                isCaller: false,
            });
            setIsRemoteCameraEnabled(data.callType === "video");
            setCallStatus("incoming");
        };

        const onAccepted = async (data: {
            callId: string;
            recipientId: string;
        }) => {
            stopRingtone();
            setCallStatus("connected");
            startCallTimer();

            try {
                const type = activeCallRef.current?.callType || "voice";
                setIsRemoteCameraEnabled(type === "video");
                const pc = setupPeerConnection(data.callId, data.recipientId);
                await setupLocalMediaTracks(pc, type);

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                socket.emit("call:offer", {
                    callId: data.callId,
                    targetUserId: data.recipientId,
                    sdp: offer,
                });
            } catch (err) {
                toast.error("Could not access microphone/camera.");
                endCall();
            }
        };

        const onDeclined = () => {
            stopRingtone();
            setCallStatus("declined");
            toast.error("Call was declined.");
            setTimeout(() => {
                cleanupCall();
            }, 1500);
        };

        const onOffer = async (data: {
            callId: string;
            senderId: string;
            sdp: any;
        }) => {
            try {
                let pc = peerConnectionRef.current;
                if (!pc) {
                    const type = activeCallRef.current?.callType || "voice";
                    pc = setupPeerConnection(data.callId, data.senderId);
                    await setupLocalMediaTracks(pc, type);
                }

                await pc.setRemoteDescription(
                    new RTCSessionDescription(data.sdp),
                );
                await processPendingIceCandidates();

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.emit("call:answer", {
                    callId: data.callId,
                    targetUserId: data.senderId,
                    sdp: answer,
                });
            } catch (err) {
                toast.error("Error establishing connection.");
                endCall();
            }
        };

        const onAnswer = async (data: {
            callId: string;
            senderId: string;
            sdp: any;
        }) => {
            const pc = peerConnectionRef.current;
            if (pc) {
                await pc.setRemoteDescription(
                    new RTCSessionDescription(data.sdp),
                );
                await processPendingIceCandidates();
            }
        };

        const onIceCandidate = async (data: { candidate: any }) => {
            const pc = peerConnectionRef.current;
            if (data.candidate) {
                if (pc && pc.remoteDescription && pc.remoteDescription.type) {
                    try {
                        await pc.addIceCandidate(
                            new RTCIceCandidate(data.candidate),
                        );
                    } catch (e) {
                        console.error("Error adding ice candidate", e);
                    }
                } else {
                    pendingIceCandidatesRef.current.push(data.candidate);
                }
            }
        };

        const onCameraToggled = (data: { enabled: boolean }) => {
            setIsRemoteCameraEnabled(data.enabled);
        };

        const onScreenshareStarted = (data: { streamId?: string }) => {
            if (data.streamId) {
                remoteScreenStreamIdRef.current = data.streamId;
            }
            setIsRemoteScreenSharing(true);
        };

        const onScreenshareStopped = () => {
            remoteScreenStreamIdRef.current = null;
            setRemoteScreenStream(null);
            setIsRemoteScreenSharing(false);
        };

        const onEnded = () => {
            stopRingtone();
            toast.info("Call ended.");
            cleanupCall();
        };

        socket.on("call:incoming", onIncoming);
        socket.on("call:accepted", onAccepted);
        socket.on("call:declined", onDeclined);
        socket.on("call:offer", onOffer);
        socket.on("call:answer", onAnswer);
        socket.on("call:ice-candidate", onIceCandidate);
        socket.on("call:camera-toggled", onCameraToggled);
        socket.on("call:screenshare-started", onScreenshareStarted);
        socket.on("call:screenshare-stopped", onScreenshareStopped);
        socket.on("call:ended", onEnded);

        return () => {
            socket.off("call:incoming", onIncoming);
            socket.off("call:accepted", onAccepted);
            socket.off("call:declined", onDeclined);
            socket.off("call:offer", onOffer);
            socket.off("call:answer", onAnswer);
            socket.off("call:ice-candidate", onIceCandidate);
            socket.off("call:camera-toggled", onCameraToggled);
            socket.off("call:screenshare-started", onScreenshareStarted);
            socket.off("call:screenshare-stopped", onScreenshareStopped);
            socket.off("call:ended", onEnded);
        };
    }, [socket, callStatus]);

    const startCallTimer = () => {
        setCallDuration(0);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);
    };

    const initiateCall = (
        recipientId: string,
        recipientName: string,
        callType: CallType = "voice",
        recipientAvatar?: string,
    ) => {
        if (!socket) {
            toast.error("Socket connection unavailable.");
            return;
        }

        const callId = `call_${Date.now()}`;
        updateActiveCall({
            callId,
            targetId: recipientId,
            targetName: recipientName,
            targetAvatar: recipientAvatar,
            callType,
            isCaller: true,
        });
        setIsRemoteCameraEnabled(callType === "video");
        setCallStatus("calling");

        socket.emit("call:initiate", {
            recipientId,
            callType,
            callerName: localStorage.getItem("name") || "Team Member",
        });
    };

    const acceptCall = () => {
        if (!socket || !activeCallRef.current) return;
        stopRingtone();

        setCallStatus("connected");
        startCallTimer();
        socket.emit("call:accept", {
            callId: activeCallRef.current.callId,
            callerId: activeCallRef.current.targetId,
        });
    };

    const declineCall = () => {
        if (!socket || !activeCallRef.current) return;
        stopRingtone();
        socket.emit("call:decline", {
            callId: activeCallRef.current.callId,
            callerId: activeCallRef.current.targetId,
        });
        cleanupCall();
    };

    const endCall = () => {
        stopRingtone();
        if (socket && activeCallRef.current) {
            socket.emit("call:end", {
                callId: activeCallRef.current.callId,
                targetUserId: activeCallRef.current.targetId,
            });
        }
        cleanupCall();
    };

    const toggleMute = () => {
        if (localAudioStreamRef.current) {
            localAudioStreamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsMuted((prev) => !prev);
        }
    };

    const toggleCamera = async () => {
        if (isVideoEnabled) {
            if (localCameraStreamRef.current) {
                localCameraStreamRef.current
                    .getVideoTracks()
                    .forEach((t) => t.stop());
                localCameraStreamRef.current = null;
            }
            setLocalCameraStream(null);
            setIsVideoEnabled(false);

            if (peerConnectionRef.current) {
                if (isScreenSharing) {
                    if (videoSenderRef.current) {
                        try {
                            peerConnectionRef.current.removeTrack(
                                videoSenderRef.current,
                            );
                        } catch (e) {
                            console.error(e);
                        }
                        videoSenderRef.current = null;
                    }
                } else {
                    if (videoSenderRef.current) {
                        await videoSenderRef.current.replaceTrack(null);
                    }
                }

                const offer = await peerConnectionRef.current.createOffer();
                await peerConnectionRef.current.setLocalDescription(offer);
                socket?.emit("call:offer", {
                    callId: activeCallRef.current?.callId,
                    targetUserId: activeCallRef.current?.targetId,
                    sdp: offer,
                });
            }

            if (socket && activeCallRef.current) {
                socket.emit("call:camera-toggled", {
                    callId: activeCallRef.current.callId,
                    targetUserId: activeCallRef.current.targetId,
                    enabled: false,
                });
            }
        } else {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                const videoTrack = mediaStream.getVideoTracks()[0];
                localCameraStreamRef.current = mediaStream;
                setLocalCameraStream(mediaStream);
                setIsVideoEnabled(true);

                if (peerConnectionRef.current) {
                    if (videoSenderRef.current) {
                        await videoSenderRef.current.replaceTrack(videoTrack);
                    } else {
                        videoSenderRef.current =
                            peerConnectionRef.current.addTrack(
                                videoTrack,
                                mediaStream,
                            );
                    }

                    const offer = await peerConnectionRef.current.createOffer();
                    await peerConnectionRef.current.setLocalDescription(offer);
                    socket?.emit("call:offer", {
                        callId: activeCallRef.current?.callId,
                        targetUserId: activeCallRef.current?.targetId,
                        sdp: offer,
                    });
                }

                if (socket && activeCallRef.current) {
                    socket.emit("call:camera-toggled", {
                        callId: activeCallRef.current.callId,
                        targetUserId: activeCallRef.current.targetId,
                        enabled: true,
                    });
                }
            } catch (err) {
                toast.error("Could not access camera.");
            }
        }
    };

    const stopScreenShareInternal = async () => {
        if (localScreenStreamRef.current) {
            localScreenStreamRef.current.getTracks().forEach((t) => t.stop());
            localScreenStreamRef.current = null;
        }
        setLocalScreenStream(null);
        setIsScreenSharing(false);

        if (peerConnectionRef.current && screenSenderRef.current) {
            try {
                peerConnectionRef.current.removeTrack(screenSenderRef.current);
            } catch (e) {
                console.error("Error removing screen track:", e);
            }
            screenSenderRef.current = null;

            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            socket?.emit("call:offer", {
                callId: activeCallRef.current?.callId,
                targetUserId: activeCallRef.current?.targetId,
                sdp: offer,
            });
        }

        if (socket && activeCallRef.current) {
            socket.emit("call:screenshare-stopped", {
                callId: activeCallRef.current.callId,
                targetUserId: activeCallRef.current.targetId,
            });
        }
    };

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            await stopScreenShareInternal();
            return;
        }

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getDisplayMedia
        ) {
            toast.error(
                "Screen sharing is not supported on this mobile browser.",
            );
            return;
        }

        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            });

            localScreenStreamRef.current = screenStream;
            setLocalScreenStream(screenStream);
            setIsScreenSharing(true);

            const screenTrack = screenStream.getVideoTracks()[0];
            screenTrack.onended = () => {
                stopScreenShareInternal();
            };

            if (peerConnectionRef.current) {
                screenSenderRef.current = peerConnectionRef.current.addTrack(
                    screenTrack,
                    screenStream,
                );
                const offer = await peerConnectionRef.current.createOffer();
                await peerConnectionRef.current.setLocalDescription(offer);
                socket?.emit("call:offer", {
                    callId: activeCallRef.current?.callId,
                    targetUserId: activeCallRef.current?.targetId,
                    sdp: offer,
                });
            }

            if (socket && activeCallRef.current) {
                socket.emit("call:screenshare-started", {
                    callId: activeCallRef.current.callId,
                    targetUserId: activeCallRef.current.targetId,
                    streamId: screenStream.id,
                });
            }
        } catch (err: any) {
            console.error("Screen share error:", err);
            if (err?.name !== "NotAllowedError") {
                toast.error("Screen sharing is not available on this device.");
            }
            setIsScreenSharing(false);
            setLocalScreenStream(null);
        }
    };

    return (
        <CallContext.Provider
            value={{
                callStatus,
                activeCall,
                isMuted,
                isVideoEnabled,
                isScreenSharing,
                isRemoteScreenSharing,
                isRemoteCameraEnabled,
                callDuration,
                remoteStream,
                remoteScreenStream,
                localCameraStream,
                localScreenStream,
                initiateCall,
                acceptCall,
                declineCall,
                endCall,
                toggleMute,
                toggleCamera,
                toggleScreenShare,
            }}
        >
            {children}
        </CallContext.Provider>
    );
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error("useCall must be used within a CallProvider");
    }
    return context;
};
