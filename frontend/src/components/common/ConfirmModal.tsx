import { AlertTriangle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface ConfirmModalProps {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    open,
    title = "Are you sure?",
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    return (
        <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
            <AlertDialogContent size="sm" className="gap-5">
                <AlertDialogHeader className="place-items-start text-left">
                    <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <AlertTriangle className="size-5" />
                    </div>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && (
                        <AlertDialogDescription className="leading-relaxed">
                            {description}
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>

                <AlertDialogFooter className="grid grid-cols-2 gap-2">
                    <AlertDialogCancel variant="outline" onClick={onCancel}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction variant="danger" onClick={onConfirm}>
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
