import React from "react";
import {
    Phone,
    PhoneOff,
    Mic,
    MicOff,
    Video,
    VideoOff,
    Volume2,
    Monitor,
    MonitorOff,
} from "lucide-react";
import { useCall } from "@/features/call/context/CallContext";
import { MemberAvatar } from "@/components/common/MemberAvatar";

const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const CallModal: React.FC = () => {
    const {
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
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        toggleCamera,
        toggleScreenShare,
    } = useCall();

    const hasRemoteScreen = !!remoteScreenStream && isRemoteScreenSharing;
    const hasRemoteCamera = !!remoteStream && isRemoteCameraEnabled;
    const hasLocalScreen = !!localScreenStream;
    const hasLocalCamera = !!localCameraStream && isVideoEnabled;
    const isVideoActive =
        hasRemoteScreen || hasRemoteCamera || hasLocalScreen || hasLocalCamera;

    if (callStatus === "idle" || !activeCall) {
        return null;
    }

    const bindVideo =
        (stream: MediaStream | null) => (el: HTMLVideoElement | null) => {
            if (el && stream) {
                if (el.srcObject !== stream) {
                    el.srcObject = stream;
                }
                el.play().catch(() => {});
            }
        };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 p-0 md:p-4">
            <audio
                ref={(el) => {
                    if (el && remoteStream) {
                        const audioTracks = remoteStream.getAudioTracks();
                        if (audioTracks.length > 0) {
                            const audioStream = new MediaStream(audioTracks);
                            if (el.srcObject !== audioStream) {
                                el.srcObject = audioStream;
                            }
                            el.play().catch(() => {});
                        } else {
                            el.srcObject = null;
                        }
                    }
                }}
                autoPlay
                className="hidden"
            />
            <div
                className={`relative w-full flex flex-col justify-between overflow-y-auto text-center text-white transition-all duration-300 bg-slate-900/95 border-white/10 ${
                    isVideoActive
                        ? "h-full md:h-auto max-h-[100vh] md:max-h-[92vh] rounded-none md:rounded-3xl border-0 md:border p-3 md:p-5 max-w-full md:max-w-6xl shadow-2xl"
                        : "max-w-sm h-auto p-8 rounded-3xl border shadow-2xl"
                }`}
            >
                {isVideoActive ? (
                    <div className="relative w-full flex-1 md:flex-initial max-h-[72vh] md:max-h-[67vh] aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-black/80 border border-white/10 mb-3 md:mb-4 flex items-center justify-center mx-auto">
                        {hasLocalScreen ? (
                            <video
                                ref={bindVideo(localScreenStream)}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-contain"
                            />
                        ) : hasRemoteScreen ? (
                            <video
                                ref={bindVideo(remoteScreenStream)}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-contain"
                            />
                        ) : hasRemoteCamera ? (
                            <video
                                ref={bindVideo(remoteStream)}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center">
                                <MemberAvatar
                                    name={activeCall.targetName}
                                    status="active"
                                    size="lg"
                                    className="mb-3"
                                />
                                <p className="text-xs text-slate-400 font-medium">
                                    Waiting for {activeCall.targetName}'s
                                    camera...
                                </p>
                            </div>
                        )}

                        {(hasLocalCamera ||
                            (hasRemoteCamera &&
                                (hasLocalScreen || hasRemoteScreen))) && (
                            <div className="absolute bottom-3 right-3 flex items-end gap-2 z-20">
                                {hasRemoteCamera &&
                                    (hasLocalScreen || hasRemoteScreen) && (
                                        <div className="relative w-20 md:w-32 aspect-video rounded-lg overflow-hidden bg-slate-950 border border-white/20 shadow-2xl">
                                            <video
                                                ref={bindVideo(remoteStream)}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-1 left-1.5 bg-black/60 backdrop-blur-md px-1 rounded text-[8px] md:text-[9px] text-white">
                                                {activeCall.targetName}
                                            </div>
                                        </div>
                                    )}

                                {hasLocalCamera && (
                                    <div className="relative w-20 md:w-32 aspect-video rounded-lg overflow-hidden bg-slate-950 border border-white/20 shadow-2xl">
                                        <video
                                            ref={bindVideo(localCameraStream)}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover scale-x-[-1]"
                                        />
                                        <div className="absolute bottom-1 left-1.5 bg-black/60 backdrop-blur-md px-1 rounded text-[8px] md:text-[9px] text-white">
                                            You
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[11px] font-medium text-white">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {hasLocalScreen
                                ? "You are sharing screen"
                                : hasRemoteScreen
                                  ? `${activeCall.targetName} is sharing screen`
                                  : `${activeCall.targetName}'s Feed`}
                        </div>
                    </div>
                ) : (
                    <div className="relative mx-auto flex h-24 w-24 items-center justify-center mb-4">
                        {(callStatus === "calling" ||
                            callStatus === "incoming" ||
                            callStatus === "connected") && (
                            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 duration-1000" />
                        )}
                        <MemberAvatar
                            name={activeCall.targetName}
                            status="active"
                            size="lg"
                            className="scale-125"
                        />
                    </div>
                )}

                <div
                    className={`space-y-0.5 ${isVideoActive ? "mb-2 md:mb-3" : "mb-6"}`}
                >
                    <h3
                        className={`font-bold tracking-tight text-white ${isVideoActive ? "text-base" : "text-xl"}`}
                    >
                        {activeCall.targetName}
                    </h3>
                    <p className="text-[11px] md:text-xs font-medium text-slate-400">
                        {callStatus === "calling" &&
                            `Calling (${activeCall.callType === "video" ? "Video" : "Voice"})...`}
                        {callStatus === "incoming" &&
                            `Incoming ${activeCall.callType === "video" ? "Video" : "Voice"} Call...`}
                        {callStatus === "connected" && (
                            <span className="flex items-center justify-center gap-1.5 text-emerald-400 font-mono text-xs">
                                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                                {formatDuration(callDuration)}
                            </span>
                        )}
                        {callStatus === "declined" && "Call Declined"}
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2.5 md:gap-3 mt-auto md:mt-0">
                    {callStatus === "incoming" && (
                        <>
                            <button
                                onClick={declineCall}
                                className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                title="Decline Call"
                            >
                                <PhoneOff className="h-4.5 w-4.5 md:h-5 md:w-5" />
                            </button>
                            <button
                                onClick={acceptCall}
                                className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                title="Accept Call"
                            >
                                <Phone className="h-4.5 w-4.5 md:h-5 md:w-5" />
                            </button>
                        </>
                    )}

                    {callStatus === "calling" && (
                        <button
                            onClick={endCall}
                            className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                            title="Cancel Call"
                        >
                            <PhoneOff className="h-4.5 w-4.5 md:h-5 md:w-5" />
                        </button>
                    )}

                    {callStatus === "connected" && (
                        <>
                            <button
                                onClick={toggleMute}
                                className={`flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border transition-all hover:scale-105 cursor-pointer ${
                                    isMuted
                                        ? "bg-amber-500 text-slate-950 border-amber-400"
                                        : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                                }`}
                                title={
                                    isMuted
                                        ? "Unmute Microphone"
                                        : "Mute Microphone"
                                }
                            >
                                {isMuted ? (
                                    <MicOff className="h-4.5 w-4.5 md:h-5 md:w-5" />
                                ) : (
                                    <Mic className="h-4.5 w-4.5 md:h-5 md:w-5" />
                                )}
                            </button>
                            <button
                                onClick={toggleCamera}
                                className={`flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border transition-all hover:scale-105 cursor-pointer ${
                                    isVideoEnabled
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                                }`}
                                title={
                                    isVideoEnabled
                                        ? "Turn Off Camera"
                                        : "Turn On Camera"
                                }
                            >
                                {isVideoEnabled ? (
                                    <Video className="h-4.5 w-4.5 md:h-5 md:w-5" />
                                ) : (
                                    <VideoOff className="h-4.5 w-4.5 md:h-5 md:w-5" />
                                )}
                            </button>
                            <button
                                onClick={toggleScreenShare}
                                className={`flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border transition-all hover:scale-105 cursor-pointer ${
                                    isScreenSharing
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                                }`}
                                title={
                                    isScreenSharing
                                        ? "Stop Sharing Screen"
                                        : "Share Screen"
                                }
                            >
                                {isScreenSharing ? (
                                    <MonitorOff className="h-4.5 w-4.5 md:h-5 md:w-5" />
                                ) : (
                                    <Monitor className="h-4.5 w-4.5 md:h-5 md:w-5" />
                                )}
                            </button>
                            <button
                                onClick={endCall}
                                className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                title="End Call"
                            >
                                <PhoneOff className="h-4.5 w-4.5 md:h-5 md:w-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CallModal;
