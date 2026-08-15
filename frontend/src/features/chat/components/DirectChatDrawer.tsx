import React, { useState, useRef, useEffect } from "react";
import {
    X,
    Send,
    Paperclip,
    Phone,
    Video,
    FileText,
    Download,
    Check,
    CheckCheck,
    Maximize2,
    FileIcon,
    Sparkles,
    Smile,
    Reply,
    Forward,
    Trash2,
    Ban,
    CheckSquare,
    Square,
    ArrowDown,
} from "lucide-react";
import {
    useDirectChat,
    type DirectMessage,
} from "../context/DirectChatContext";

import { useCall } from "@/features/call/context/CallContext";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { EmojiPicker } from "./EmojiPicker";
import { ForwardModal } from "./ForwardModal";
import { toast } from "sonner";

function formatBytes(bytes?: number | null) {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function isImageMime(mime?: string | null, url?: string | null) {
    if (mime?.startsWith("image/")) return true;
    if (url && /\.(jpg|jpeg|png|gif|webp|svg)/i.test(url)) return true;
    return false;
}

function decodeFileName(name?: string | null, url?: string | null) {
    if (!name && !url) return "attachment";
    let raw = name || url?.split("/").pop() || "attachment";
    try {
        raw = raw.replace(/^\d+_\d*_?/, "");
        const decoded = decodeURIComponent(raw);
        return decoded || raw;
    } catch {
        return raw;
    }
}

import { downloadFile } from "@/utils/fileDownload";

export const DirectChatDrawer: React.FC = () => {
    const {
        isOpen,
        activeRecipient,
        messages,
        isPartnerTyping,
        isLoadingMessages,
        isLoadingMore,
        hasMoreMessages,
        replyToMessage,
        setReplyToMessage,
        closeChat,
        fetchMoreMessages,
        sendMessage,
        deleteMessage,
        forwardMessages,
        uploadAttachment,
        sendTypingStatus,
    } = useDirectChat();

    const { initiateCall } = useCall();

    const [inputText, setInputText] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(
        null,
    );
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedForwardMessageIds, setSelectedForwardMessageIds] = useState<
        string[]
    >([]);
    const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const prevScrollHeightRef = useRef<number>(0);
    const isFetchingMoreRef = useRef<boolean>(false);
    const isInitialLoadRef = useRef<boolean>(true);
    const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
    const typingTimeoutRef = useRef<any>(null);

    const currentUserEmail = localStorage.getItem("email");

    useEffect(() => {
        isInitialLoadRef.current = true;
        setShowScrollBottomBtn(false);
    }, [activeRecipient?.id]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        if (isFetchingMoreRef.current) {
            container.scrollTop =
                container.scrollHeight - prevScrollHeightRef.current;
            isFetchingMoreRef.current = false;
            return;
        }

        const distanceToBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;
        const isNearBottom = distanceToBottom <= 150;
        const lastMsg = messages[messages.length - 1];
        const isLastMsgFromMe = lastMsg?.senderEmail === currentUserEmail;

        if (isInitialLoadRef.current || isLastMsgFromMe || isNearBottom) {
            messagesEndRef.current?.scrollIntoView({
                behavior: isInitialLoadRef.current ? "auto" : "smooth",
            });
            isInitialLoadRef.current = false;
            setShowScrollBottomBtn(false);
        } else {
            setShowScrollBottomBtn(true);
        }
    }, [messages, isPartnerTyping, currentUserEmail]);

    const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;

        const distanceToBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;
        if (distanceToBottom <= 80) {
            setShowScrollBottomBtn(false);
        }

        if (
            container.scrollTop <= 30 &&
            hasMoreMessages &&
            !isLoadingMore &&
            !isLoadingMessages
        ) {
            prevScrollHeightRef.current = container.scrollHeight;
            isFetchingMoreRef.current = true;
            await fetchMoreMessages();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 25 * 1024 * 1024) {
            toast.error("File size exceeds maximum limit of 25MB.");
            return;
        }

        setSelectedFile(file);
        if (file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setFilePreviewUrl(url);
        } else {
            setFilePreviewUrl(null);
        }
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);

        sendTypingStatus(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingStatus(false);
        }, 2000);
    };

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if ((!inputText.trim() && !selectedFile) || isUploading) return;

        let attachmentPayload:
            | {
                  fileUrl: string;
                  fileName: string;
                  fileType: string;
                  fileSize: number;
              }
            | undefined = undefined;

        try {
            if (selectedFile) {
                setIsUploading(true);
                attachmentPayload = await uploadAttachment(selectedFile);
            }

            await sendMessage(inputText, attachmentPayload, replyToMessage);

            setInputText("");
            setShowEmojiPicker(false);
            clearSelectedFile();
            setReplyToMessage(null);
        } catch (err: any) {
            toast.error(err?.message || "Failed to send message.");
        } finally {
            setIsUploading(false);
        }
    };

    const toggleSelectMessage = (msgId: string) => {
        setSelectedForwardMessageIds((prev) =>
            prev.includes(msgId)
                ? prev.filter((id) => id !== msgId)
                : [...prev, msgId],
        );
    };

    const handleSingleForward = (msg: DirectMessage) => {
        setIsSelectionMode(true);
        if (!selectedForwardMessageIds.includes(msg.id)) {
            setSelectedForwardMessageIds((prev) => [...prev, msg.id]);
        }
    };

    const handleConfirmForward = async (recipientIds: string[]) => {
        await forwardMessages(selectedForwardMessageIds, recipientIds);
        setSelectedForwardMessageIds([]);
        setIsSelectionMode(false);
    };

    if (!isOpen || !activeRecipient) return null;

    return (
        <>
            <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-card border-l border-border shadow-2xl transition-all duration-300 ease-in-out">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-md">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <MemberAvatar
                            name={activeRecipient.name}
                            status="Active"
                            size="sm"
                            memberId={activeRecipient.id}
                            userId={activeRecipient.id}
                        />
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-foreground truncate">
                                {activeRecipient.name}
                            </h3>
                            <p className="text-[11px] text-muted-foreground truncate">
                                {activeRecipient.email || "Active now"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() =>
                                initiateCall(
                                    activeRecipient.id,
                                    activeRecipient.name,
                                    "voice",
                                )
                            }
                            className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                            title={`Voice Call ${activeRecipient.name}`}
                        >
                            <Phone className="size-4" />
                        </button>
                        <button
                            onClick={() =>
                                initiateCall(
                                    activeRecipient.id,
                                    activeRecipient.name,
                                    "video",
                                )
                            }
                            className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                            title={`Video Call ${activeRecipient.name}`}
                        >
                            <Video className="size-4" />
                        </button>
                        <button
                            onClick={closeChat}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                            title="Close chat"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>
                {selectedForwardMessageIds.length > 0 && (
                    <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="size-4 text-primary" />
                            <span className="text-xs font-medium text-foreground">
                                {selectedForwardMessageIds.length} message
                                {selectedForwardMessageIds.length > 1
                                    ? "s"
                                    : ""}{" "}
                                selected
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsForwardModalOpen(true)}
                                className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1"
                            >
                                <Forward className="size-3.5" />
                                <span>Forward</span>
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedForwardMessageIds([]);
                                    setIsSelectionMode(false);
                                }}
                                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                title="Cancel selection"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </div>
                )}
                <div className="flex-1 flex flex-col min-h-0 bg-background/50 relative">
                    {showScrollBottomBtn && (
                        <div className="absolute bottom-4 right-4 z-30">
                            <button
                                type="button"
                                onClick={() => {
                                    messagesEndRef.current?.scrollIntoView({
                                        behavior: "smooth",
                                    });
                                    setShowScrollBottomBtn(false);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-xl hover:bg-primary/90 transition-all animate-bounce cursor-pointer"
                            >
                                <ArrowDown className="size-3.5" />
                                <span>New messages</span>
                            </button>
                        </div>
                    )}
                    <div
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-4 space-y-3"
                    >
                        {isLoadingMore && (
                            <div className="flex items-center justify-center py-2">
                                <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        {isLoadingMessages ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-12">
                                <Sparkles className="size-8 text-primary/40" />
                                <p className="text-sm font-medium text-foreground">
                                    Say hello to {activeRecipient.name}!
                                </p>
                                <p className="text-xs text-muted-foreground max-w-xs">
                                    Start a 1-to-1 direct conversation or share
                                    files/images safely.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe =
                                    msg.senderEmail === currentUserEmail;
                                const isImg = isImageMime(
                                    msg.fileType,
                                    msg.fileUrl,
                                );
                                const isSelected =
                                    selectedForwardMessageIds.includes(msg.id);

                                const ageMs =
                                    Date.now() -
                                    new Date(msg.createdAt).getTime();
                                const isWithinOneHour = ageMs <= 60 * 60 * 1000;
                                const canDelete =
                                    isMe && !msg.isDeleted && isWithinOneHour;

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex items-start gap-2 group ${
                                            isMe
                                                ? "flex-row-reverse"
                                                : "flex-row"
                                        }`}
                                    >
                                        {(isSelectionMode ||
                                            selectedForwardMessageIds.length >
                                                0) &&
                                            !msg.isDeleted && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleSelectMessage(
                                                            msg.id,
                                                        )
                                                    }
                                                    className="mt-2 text-primary shrink-0 cursor-pointer"
                                                >
                                                    {isSelected ? (
                                                        <CheckSquare className="size-4" />
                                                    ) : (
                                                        <Square className="size-4 text-muted-foreground" />
                                                    )}
                                                </button>
                                            )}

                                        <div
                                            className={`relative max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs space-y-1.5 ${
                                                msg.isDeleted
                                                    ? "bg-muted/50 border border-border/60 text-muted-foreground italic rounded-xl"
                                                    : isMe
                                                      ? "bg-primary text-primary-foreground rounded-br-xs"
                                                      : "bg-card border border-border text-foreground rounded-bl-xs"
                                            }`}
                                        >
                                            {msg.isDeleted ? (
                                                <div className="flex items-center gap-1.5 text-muted-foreground/80 font-normal py-0.5">
                                                    <Ban className="size-3.5 shrink-0" />
                                                    <span>
                                                        This message was deleted
                                                        by{" "}
                                                        {msg.deletedByUserName ||
                                                            "user"}
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    {msg.isForwarded && (
                                                        <div className="flex items-center gap-1 text-[10px] font-medium opacity-80 border-b border-current/10 pb-1 mb-1">
                                                            <Forward className="size-3 shrink-0" />
                                                            <span>
                                                                Forwarded from{" "}
                                                                {msg.forwardedFromSenderName ||
                                                                    "Member"}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {msg.replyToSnippet && (
                                                        <div className="rounded-lg p-2 bg-black/10 dark:bg-white/10 border-l-2 border-primary text-[11px] space-y-0.5 mb-1">
                                                            <p className="font-semibold text-primary">
                                                                Replying to{" "}
                                                                {msg.replyToSenderName ||
                                                                    "Member"}
                                                            </p>
                                                            <p className="truncate opacity-85">
                                                                {
                                                                    msg.replyToSnippet
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                    {msg.fileUrl && (
                                                        <div className="rounded-xl overflow-hidden bg-black/10 dark:bg-white/5 p-1.5 border border-white/10">
                                                            {isImg ? (
                                                                <div className="relative group/img cursor-pointer rounded-lg overflow-hidden">
                                                                    <img
                                                                        src={
                                                                            msg.fileUrl
                                                                        }
                                                                        alt={
                                                                            msg.fileName ||
                                                                            "attachment"
                                                                        }
                                                                        className="max-h-48 rounded-lg object-cover w-full"
                                                                    />
                                                                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-lg text-white">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setLightboxImageUrl(
                                                                                    msg.fileUrl,
                                                                                )
                                                                            }
                                                                            className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors cursor-pointer"
                                                                            title="Enlarge Image"
                                                                        >
                                                                            <Maximize2 className="size-4" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                downloadFile(
                                                                                    msg.fileUrl!,
                                                                                    msg.fileName,
                                                                                )
                                                                            }
                                                                            className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors cursor-pointer"
                                                                            title="Download Image"
                                                                        >
                                                                            <Download className="size-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                                                    <FileText className="size-5 text-primary shrink-0" />
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="font-medium truncate text-xs">
                                                                            {decodeFileName(
                                                                                msg.fileName,
                                                                                msg.fileUrl,
                                                                            )}
                                                                        </p>
                                                                        <p className="text-[10px] opacity-75">
                                                                            {formatBytes(
                                                                                msg.fileSize,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            downloadFile(
                                                                                msg.fileUrl!,
                                                                                msg.fileName,
                                                                            )
                                                                        }
                                                                        className="p-1 rounded hover:bg-black/20 dark:hover:bg-white/20 transition-colors cursor-pointer shrink-0"
                                                                        title="Download file"
                                                                    >
                                                                        <Download className="size-4 opacity-90" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {msg.message && (
                                                        <p className="whitespace-pre-wrap break-words leading-relaxed">
                                                            {msg.message}
                                                        </p>
                                                    )}
                                                    <div
                                                        className={`flex items-center justify-end gap-1 text-[10px] opacity-70 ${
                                                            isMe
                                                                ? "text-primary-foreground"
                                                                : "text-muted-foreground"
                                                        }`}
                                                    >
                                                        <span>
                                                            {new Date(
                                                                msg.createdAt,
                                                            ).toLocaleTimeString(
                                                                [],
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                },
                                                            )}
                                                        </span>
                                                        {isMe &&
                                                            (msg.isRead ? (
                                                                <CheckCheck className="size-3 text-sky-300" />
                                                            ) : (
                                                                <Check className="size-3 opacity-80" />
                                                            ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {!msg.isDeleted && (
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-card/90 border border-border p-1 rounded-xl shadow-md backdrop-blur-sm self-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setReplyToMessage(msg)
                                                    }
                                                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                                                    title="Reply"
                                                >
                                                    <Reply className="size-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSingleForward(msg)
                                                    }
                                                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                                                    title="Forward"
                                                >
                                                    <Forward className="size-3.5" />
                                                </button>
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteMessage(
                                                                msg.id,
                                                            )
                                                        }
                                                        className="p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 cursor-pointer transition-colors"
                                                        title="Delete (Within 1 Hour)"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                        {isPartnerTyping && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground py-1 px-2">
                                <div className="flex items-center gap-1">
                                    <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                                    <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                                    <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                                </div>
                                <span>{activeRecipient.name} is typing...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                    {selectedFile && (
                        <div className="px-4 py-2 border-t border-border bg-card/60 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                {filePreviewUrl ? (
                                    <img
                                        src={filePreviewUrl}
                                        alt="Preview"
                                        className="size-9 rounded-md object-cover border border-border shrink-0"
                                    />
                                ) : (
                                    <FileIcon className="size-6 text-primary shrink-0" />
                                )}
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-foreground truncate">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {formatBytes(selectedFile.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={clearSelectedFile}
                                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    )}
                    {replyToMessage && (
                        <div className="px-4 py-2 border-t border-border bg-primary/10 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                                <Reply className="size-4 text-primary shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-semibold text-foreground truncate">
                                        Replying to{" "}
                                        {replyToMessage.senderName || "Member"}
                                    </p>
                                    <p className="text-muted-foreground truncate text-[11px]">
                                        {replyToMessage.message ||
                                            (replyToMessage.fileName
                                                ? `[File] ${replyToMessage.fileName}`
                                                : "[Attachment]")}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setReplyToMessage(null)}
                                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    )}
                    {showEmojiPicker && (
                        <EmojiPicker
                            onSelectEmoji={(emoji) => {
                                setInputText((prev) => prev + emoji);
                            }}
                            onClose={() => setShowEmojiPicker(false)}
                            triggerRef={emojiButtonRef}
                        />
                    )}
                    <form
                        onSubmit={handleSend}
                        className="p-3 border-t border-border bg-card flex items-center gap-2 relative"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <button
                            ref={emojiButtonRef}
                            type="button"
                            onClick={() => setShowEmojiPicker((prev) => !prev)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                                showEmojiPicker
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                            title="Insert Emoji"
                        >
                            <Smile className="size-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                            title="Attach file or image"
                        >
                            <Paperclip className="size-4" />
                        </button>

                        <input
                            type="text"
                            placeholder={
                                replyToMessage
                                    ? `Reply to ${replyToMessage.senderName}...`
                                    : `Message ${activeRecipient.name}...`
                            }
                            value={inputText}
                            onChange={handleTextChange}
                            disabled={isUploading}
                            className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        />

                        <button
                            type="submit"
                            disabled={
                                (!inputText.trim() && !selectedFile) ||
                                isUploading
                            }
                            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                            title="Send message"
                        >
                            {isUploading ? (
                                <div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send className="size-4" />
                            )}
                        </button>
                    </form>
                </div>
            </div>
            <ForwardModal
                isOpen={isForwardModalOpen}
                selectedMessagesCount={selectedForwardMessageIds.length}
                activeRecipientId={activeRecipient.id}
                onClose={() => setIsForwardModalOpen(false)}
                onConfirmForward={handleConfirmForward}
            />
            {lightboxImageUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
                    onClick={() => setLightboxImageUrl(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={lightboxImageUrl}
                            alt="Enlarged view"
                            className="max-h-[80vh] w-auto rounded-xl object-contain shadow-2xl"
                        />
                        <div className="mt-3 flex items-center gap-3 bg-card/90 border border-border px-4 py-2 rounded-full backdrop-blur-md shadow-xl">
                            <button
                                onClick={() =>
                                    downloadFile(
                                        lightboxImageUrl,
                                        "image-attachment",
                                    )
                                }
                                className="flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                            >
                                <Download className="size-4 text-primary" />
                                <span>Download Image</span>
                            </button>
                            <div className="w-px h-4 bg-border" />
                            <button
                                onClick={() => setLightboxImageUrl(null)}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                title="Close"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
