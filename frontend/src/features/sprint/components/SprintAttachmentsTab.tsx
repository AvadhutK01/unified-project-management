import { useEffect, useRef } from "react";
import { format } from "date-fns";
import {
    Loader2,
    Paperclip,
    FileText,
    FileImage,
    Download,
    Trash2,
} from "lucide-react";
import { formatBytes } from "../utils/sprint.utils";
import { downloadFile } from "@/utils/fileDownload";
import type { SprintAttachmentsTabProps } from "../types/sprint.types";

const SprintAttachmentsTab = ({
    mediaList,
    isMediaLoading,
    currentUserEmail,
    isUploading,
    fileInputRef,
    onFileUpload,
    onDeleteMedia,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
}: SprintAttachmentsTabProps) => {
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage) return;
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
    return (
        <div className="p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs space-y-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Sprint Attachments
            </h3>

            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/60 hover:border-primary/50 bg-secondary/10 hover:bg-secondary/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 group"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={onFileUpload}
                    className="hidden"
                />
                {isUploading ? (
                    <Loader2 className="size-8 text-primary animate-spin" />
                ) : (
                    <Paperclip className="size-8 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                )}
                <div className="text-sm font-semibold text-foreground mt-1">
                    {isUploading
                        ? "Uploading file..."
                        : "Click to select a file"}
                </div>
                <p className="text-xs text-muted-foreground">
                    Supported format up to 10MB
                </p>
            </div>

            <div className="space-y-3">
                {isMediaLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                ) : mediaList.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6 italic">
                        No files attached to this sprint.
                    </p>
                ) : (
                    mediaList.map((m: any) => {
                        const isImage = m.fileType?.startsWith("image/");
                        const isUploader = m.uploaderEmail === currentUserEmail;

                        return (
                            <div
                                key={m.id}
                                className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-secondary/10 group transition-all duration-200"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2.5 bg-background rounded-lg border border-border/40 text-primary">
                                        {isImage ? (
                                            <FileImage className="size-4" />
                                        ) : (
                                            <FileText className="size-4" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-[320px]">
                                            {m.name}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground mt-0.5">
                                            <span>
                                                {formatBytes(m.fileSize)}
                                            </span>
                                            <span>•</span>
                                            <span>By {m.uploaderName}</span>
                                            <span>•</span>
                                            <span>
                                                {m.createdAt
                                                    ? format(
                                                          new Date(m.createdAt),
                                                          "PP",
                                                      )
                                                    : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 ml-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            downloadFile(m.url, m.name)
                                        }
                                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                        title="Download File"
                                    >
                                        <Download className="size-4" />
                                    </button>
                                    {isUploader && (
                                        <button
                                            onClick={() => onDeleteMedia(m.id)}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                                            title="Delete File"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                {isFetchingNextPage && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                )}
                {hasNextPage && !isFetchingNextPage && (
                    <div ref={sentinelRef} className="h-4" />
                )}
            </div>
        </div>
    );
};

export default SprintAttachmentsTab;
