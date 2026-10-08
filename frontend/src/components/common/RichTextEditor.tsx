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
        `h-7 min-w-7 px-1.5 text-[13px] font-semibold rounded-md transition-colors ${
            active
                ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary dark:bg-primary/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`;

    return (
        <div className="overflow-hidden rounded-md border border-input bg-card shadow-xs transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25 dark:bg-input/20">
            {/* Toolbar */}
            <div
                role="toolbar"
                aria-label="Text formatting"
                className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/50 px-1.5 py-1"
            >
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                    className={btn(editor.isActive("heading", { level: 1 }))}
                    aria-label="Heading 1"
                    title="Heading 1"
                    aria-pressed={editor.isActive("heading", { level: 1 })}
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
                    aria-label="Heading 2"
                    title="Heading 2"
                    aria-pressed={editor.isActive("heading", { level: 2 })}
                >
                    H2
                </Button>

                <div aria-hidden="true" className="mx-1 h-4 w-px bg-border" />

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={btn(editor.isActive("bold"))}
                    aria-label="Bold"
                    title="Bold"
                    aria-pressed={editor.isActive("bold")}
                >
                    B
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={btn(editor.isActive("italic"))}
                    aria-label="Italic"
                    title="Italic"
                    aria-pressed={editor.isActive("italic")}
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
                    aria-label="Underline"
                    title="Underline"
                    aria-pressed={editor.isActive("underline")}
                >
                    U
                </Button>

                <div aria-hidden="true" className="mx-1 h-4 w-px bg-border" />

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className={btn(editor.isActive("bulletList"))}
                    aria-label="Bulleted list"
                    title="Bulleted list"
                    aria-pressed={editor.isActive("bulletList")}
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
                    aria-label="Numbered list"
                    title="Numbered list"
                    aria-pressed={editor.isActive("orderedList")}
                >
                    <ListOrdered className="w-4 h-4" />
                </Button>

                <div aria-hidden="true" className="mx-1 h-4 w-px bg-border" />

                {/* 🔗 Link Button */}
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                        setShowLinkInput((prev) => !prev);
                        setLinkUrl(editor.getAttributes("link").href || "");
                    }}
                    className={btn(editor.isActive("link"))}
                    aria-label="Link"
                    title="Link"
                    aria-pressed={editor.isActive("link")}
                >
                    <LinkIcon className="w-4 h-4" />
                </Button>
            </div>

            {/* Link input */}
            {showLinkInput && (
                <div className="flex items-center gap-2 border-b border-input bg-muted/40 px-2 py-2">
                    <input
                        type="text"
                        placeholder="Enter URL..."
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        aria-label="Link URL"
                        className="h-8 flex-1 rounded-md border border-input bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
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
                        className="h-8 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Apply
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowLinkInput(false)}
                        className="h-8 rounded-md px-2.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground"
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
