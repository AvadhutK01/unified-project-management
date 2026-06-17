import { useRef, useState, useEffect } from "react";
import { UploadCloud, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectImageUploaderProps {
    value?: File | null;
    onChange: (value: File | null) => void;
    existingImageUrl?: string | null;
    onRemoveExisting?: () => void;
}

export function ProjectImageUploader({
    value,
    onChange,
    existingImageUrl,
    onRemoveExisting,
}: ProjectImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [existingRemoved, setExistingRemoved] = useState(false);

    useEffect(() => {
        if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        if (existingImageUrl && !existingRemoved) {
            setPreviewUrl(existingImageUrl);
            return;
        }
        setPreviewUrl(null);
    }, [value, existingImageUrl, existingRemoved]);

    const processFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        setExistingRemoved(false);
        onChange(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!(value instanceof File) && existingImageUrl && !existingRemoved) {
            setExistingRemoved(true);
            onRemoveExisting?.();
        }
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2">
            <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => !previewUrl && inputRef.current?.click()}
                className={cn(
                    "relative w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 select-none",
                    previewUrl
                        ? "border-solid border-border cursor-default"
                        : "cursor-pointer",
                    isDragging
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : previewUrl
                          ? "border-border"
                          : "border-muted-foreground/25 bg-muted/5 hover:border-primary/50 hover:bg-accent/40",
                )}
            >
                {previewUrl ? (
                    <div className="relative w-full h-full group">
                        <img
                            src={previewUrl}
                            alt="Project cover preview"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => inputRef.current?.click()}
                                className="flex items-center gap-1.5 shadow-sm"
                            >
                                <RefreshCw className="size-3.5" />
                                Change Cover
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemove}
                                className="flex items-center gap-1.5 shadow-sm"
                            >
                                <Trash2 className="size-3.5" />
                                Remove
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 pointer-events-none">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            <UploadCloud className="size-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                                Drag and drop a cover image, or{" "}
                                <span className="text-primary pointer-events-auto cursor-pointer hover:underline">
                                    browse
                                </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                PNG, JPG, or WEBP (landscape recommended)
                            </p>
                        </div>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}
