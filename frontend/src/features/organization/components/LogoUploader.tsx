import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogoUploaderProps {
    preview: string | null;
    onUpload: (file: File, preview: string) => void;
    onRemove: () => void;
}

export function LogoUploader({
    preview,
    onUpload,
    onRemove,
}: LogoUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const processFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                onUpload(file, e.target.result as string);
            }
        };
        reader.readAsDataURL(file);
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

    if (preview) {
        return (
            <div className="flex items-center gap-4">
                <div className="size-20 rounded-xl overflow-hidden border-2 border-border shrink-0">
                    <img
                        src={preview}
                        alt="Organization logo"
                        className="size-full object-cover"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => inputRef.current?.click()}
                    >
                        <Upload className="size-3.5" />
                        Change Logo
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <X className="size-3.5" />
                        Remove
                    </Button>
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

    return (
        <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={cn(
                "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 select-none",
                isDragging
                    ? "border-primary bg-accent scale-[1.01]"
                    : "border-border bg-muted/20 hover:border-primary/50 hover:bg-accent/40",
            )}
        >
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                    Drop your logo here, or{" "}
                    <span className="text-primary">browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, or SVG — max 2MB
                </p>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
            />
        </div>
    );
}
