import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { List, ListOrdered, Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

type Props = {
    value?: string;
    onChange?: (val: string) => void;
    onBlur?: () => void;
    placeholder?: string;
};

export default function RichTextEditor({
    value = "",
    onChange,
    onBlur,
    placeholder = "",
}: Props) {
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
            }),
            Underline,
            Link.configure({ openOnClick: false }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: "tiptap min-h-[150px] max-h-[300px] overflow-y-auto px-3 py-2 focus:outline-none",
            },
        },
        onUpdate({ editor }) {
            onChange?.(editor.getHTML());
        },
        onBlur() {
            onBlur?.();
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [editor, value]);

    if (!editor) return null;

    const btn = (active: boolean) =>
        `px-2 py-1 text-sm rounded-md transition ${
            active
                ? "bg-primary/15 text-primary"
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
        }`;

    return (
        <div className="border border-input rounded-md bg-transparent shadow-xs overflow-hidden transition-[color,box-shadow]">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-input px-2 py-1.5 bg-secondary/50">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                    className={btn(editor.isActive("heading", { level: 1 }))}
                >
                    H1
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className={btn(editor.isActive("heading", { level: 2 }))}
                >
                    H2
                </Button>

                <div className="w-px h-5 bg-border mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={btn(editor.isActive("bold"))}
                >
                    B
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={btn(editor.isActive("italic"))}
                >
                    I
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    className={btn(editor.isActive("underline"))}
                >
                    U
                </Button>

                <div className="w-px h-5 bg-border mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className={btn(editor.isActive("bulletList"))}
                >
                    <List className="w-4 h-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    className={btn(editor.isActive("orderedList"))}
                >
                    <ListOrdered className="w-4 h-4" />
                </Button>

                <div className="w-px h-5 bg-border mx-1" />

                {/* 🔗 Link Button */}
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                        setShowLinkInput((prev) => !prev);
                        setLinkUrl(editor.getAttributes("link").href || "");
                    }}
                    className={btn(editor.isActive("link"))}
                >
                    <LinkIcon className="w-4 h-4" />
                </Button>
            </div>

            {/* ✅ Modern Link Input */}
            {showLinkInput && (
                <div className="flex items-center gap-2 border-b px-2 py-2 bg-muted/40">
                    <input
                        type="text"
                        placeholder="Enter URL..."
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border rounded-md bg-background outline-none"
                        autoFocus
                    />

                    <button
                        type="button"
                        onClick={() => {
                            if (linkUrl) {
                                editor
                                    .chain()
                                    .focus()
                                    .setLink({ href: linkUrl })
                                    .run();
                            } else {
                                editor.chain().focus().unsetLink().run();
                            }
                            setShowLinkInput(false);
                        }}
                        className="px-2 py-1 text-sm bg-primary text-primary-foreground rounded-md cursor-pointer"
                    >
                        Apply
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowLinkInput(false)}
                        className="px-2 py-1 text-sm text-muted-foreground cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Editor */}
            <EditorContent editor={editor} />
        </div>
    );
}
