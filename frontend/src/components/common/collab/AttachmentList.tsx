import { useEffect, useRef } from "react";
import { format } from "date-fns";
import {
    Loader2,
    UploadCloud,
    FileText,
    FileImage,
    FileArchive,
    FileSpreadsheet,
    File as FileIcon,
    Download,
    Trash2,
    Paperclip,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/Skeletons";
import { IconAction } from "@/components/common/Toolbar";
import { cn } from "@/lib/utils";
import { downloadFile } from "@/utils/fileDownload";

export interface MediaItem {
    id: string;
    name: string;
    url: string;
    fileType?: string;
    fileSize: number;
    uploaderName?: string;
    uploaderEmail?: string;
    createdAt?: string;
}

export interface AttachmentListProps {
    mediaList: MediaItem[];
    isMediaLoading: boolean;
    currentUserEmail: string;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteMedia: (mediaId: string) => void;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    formatBytes: (bytes: number) => string;
    /** e.g. "sprint", "work item" — used in empty-state copy. */
    entityLabel: string;
}

function fileVisual(type: string | undefined, name: string | undefined) {
    const t = type ?? "";
    const ext = (name ?? "").split(".").pop()?.toLowerCase() ?? "";
    if (t.startsWith("image/"))
        return { icon: FileImage, tone: "bg-violet/10 text-violet" };
    if (t === "application/pdf" || ext === "pdf")
        return { icon: FileText, tone: "bg-danger/10 text-danger" };
    if (/sheet|excel|csv/.test(t) || ["xls", "xlsx", "csv"].includes(ext))
        return { icon: FileSpreadsheet, tone: "bg-success/10 text-success" };
    if (
        /zip|compressed|tar/.test(t) ||
        ["zip", "rar", "7z", "gz"].includes(ext)
    )
        return { icon: FileArchive, tone: "bg-warning/10 text-warning" };
    if (t.startsWith("text/") || /word|document/.test(t))
        return { icon: FileText, tone: "bg-info/10 text-info" };
    return { icon: FileIcon, tone: "bg-muted text-muted-foreground" };
}

/** Upload zone + file cards with download / delete. */
export function AttachmentList({
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
    formatBytes,
    entityLabel,
}: AttachmentListProps) {
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

    const openPicker = () => {
        if (!isUploading) fileInputRef.current?.click();
    };

    return (
        <div className="space-y-5">
            <div
                role="button"
                tabIndex={0}
                aria-disabled={isUploading}
                aria-label="Upload a file"
                onClick={openPicker}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openPicker();
                    }
                }}
                className={cn(
                    "group flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-card px-6 py-8 text-center transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25",
                    isUploading
                        ? "cursor-progress"
                        : "cursor-pointer hover:border-primary/50 hover:bg-primary/[0.03]",
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={onFileUpload}
                    className="hidden"
                    tabIndex={-1}
                />
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    {isUploading ? (
                        <Loader2 className="size-5 animate-spin text-primary" />
                    ) : (
                        <UploadCloud className="size-5" />
                    )}
                </span>
                <div>
                    <p className="text-sm font-medium text-foreground">
                        {isUploading ? (
                            "Uploading file…"
                        ) : (
                            <>
                                <span className="text-primary">
                                    Click to upload
                                </span>{" "}
                                a file
                            </>
                        )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Any file type, up to 10 MB
                    </p>
                </div>
            </div>

            {isMediaLoading ? (
                <ListSkeleton rows={3} />
            ) : mediaList.length === 0 ? (
                <EmptyState
                    icon={Paperclip}
                    title="No attachments"
                    description={`Files attached to this ${entityLabel} will appear here.`}
                    size="sm"
                />
            ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                    {mediaList.map((m) => {
                        const isUploader = m.uploaderEmail === currentUserEmail;
                        const { icon: Icon, tone } = fileVisual(
                            m.fileType,
                            m.name,
                        );
                        return (
                            <li
                                key={m.id}
                                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-card"
                            >
                                <span
                                    className={cn(
                                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                                        tone,
                                    )}
                                >
                                    <Icon className="size-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p
                                        className="truncate text-[13px] font-medium text-foreground"
                                        title={m.name}
                                    >
                                        {m.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {formatBytes(m.fileSize)} ·{" "}
                                        {m.uploaderName}
                                        {m.createdAt
                                            ? ` · ${format(new Date(m.createdAt), "PP")}`
                                            : ""}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            downloadFile(m.url, m.name)
                                        }
                                        aria-label={`Download ${m.name}`}
                                        title="Download"
                                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    >
                                        <Download className="size-4" />
                                    </button>
                                    {isUploader && (
                                        <IconAction
                                            label={`Delete ${m.name}`}
                                            icon={Trash2}
                                            tone="danger"
                                            onClick={() => onDeleteMedia(m.id)}
                                        />
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            {isFetchingNextPage && (
                <div className="flex items-center justify-center py-2">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
            )}
            {hasNextPage && !isFetchingNextPage && (
                <div ref={sentinelRef} className="h-4" />
            )}
        </div>
    );
}
