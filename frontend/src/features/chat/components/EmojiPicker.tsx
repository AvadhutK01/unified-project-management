import React, { useEffect, useRef } from "react";
import EmojiPickerReact, {
    Theme,
    type EmojiClickData,
} from "emoji-picker-react";
import { useTheme } from "next-themes";

interface EmojiPickerProps {
    onSelectEmoji: (emoji: string) => void;
    onClose: () => void;
    triggerRef?: React.RefObject<HTMLElement | null>;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
    onSelectEmoji,
    onClose,
    triggerRef,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                containerRef.current &&
                !containerRef.current.contains(target) &&
                (!triggerRef?.current || !triggerRef.current.contains(target))
            ) {
                onClose();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, triggerRef]);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onSelectEmoji(emojiData.emoji);
    };

    return (
        <div
            ref={containerRef}
            className="absolute bottom-14 left-2 z-50 rounded-2xl shadow-2xl transition-all duration-200 overflow-hidden border border-border/60"
        >
            <EmojiPickerReact
                onEmojiClick={handleEmojiClick}
                theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
                width={320}
                height={380}
                searchPlaceHolder="Search emojis..."
                previewConfig={{ showPreview: false }}
            />
        </div>
    );
};
