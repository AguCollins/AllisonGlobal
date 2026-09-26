"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Image as ImageIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  ChevronDown,
  Type,
  Palette,
  RemoveFormatting,
} from "lucide-react";
import {
  blogBlocksToTipTapDoc,
  type TipTapDoc,
  countTipTapWords,
  estimateTipTapReadTime,
} from "@/components/blog/format-converter";

// ───────────────────────────── Toolbar Button ─────────────────────────

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "size-9 shrink-0",
        isActive &&
          "bg-brand/15 text-brand hover:bg-brand/20 hover:text-brand",
      )}
    >
      {children}
    </Button>
  );
}

// ───────────────────────────── Link Dialog ─────────────────────────────

function LinkDialog({
  open,
  onOpenChange,
  onSubmit,
  initialUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string) => void;
  initialUrl?: string;
}) {
  const [url, setUrl] = React.useState("");
  React.useEffect(() => {
    setUrl(initialUrl || "");
  }, [initialUrl, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Link</DialogTitle>
        </DialogHeader>
        <Input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && url.trim()) {
              onSubmit(url.trim());
              onOpenChange(false);
            }
          }}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => {
              if (url.trim()) {
                onSubmit(url.trim());
                onOpenChange(false);
              }
            }}
          >
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ───────────────────────────── Image Dialog ────────────────────────────

function ImageDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (src: string, alt: string) => void;
}) {
  const [src, setSrc] = React.useState("");
  const [alt, setAlt] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setSrc("");
      setAlt("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Image URL</label>
            <Input
              type="url"
              placeholder="https://..."
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Alt text (description)</label>
            <Input
              placeholder="Describe the image"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
            />
          </div>
          {src && (
            <div className="overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="max-h-48 w-full object-contain bg-muted/30"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => {
              if (src.trim()) {
                onSubmit(src.trim(), alt.trim());
                onOpenChange(false);
              }
            }}
          >
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ───────────────────────────── Color Picker ────────────────────────────

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Brand", value: "#0b3d39" },
  { label: "Red", value: "#dc2626" },
  { label: "Orange", value: "#ea580c" },
  { label: "Amber", value: "#d97706" },
  { label: "Green", value: "#16a34a" },
  { label: "Blue", value: "#2563eb" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Pink", value: "#db2777" },
  { label: "Gray", value: "#6b7280" },
];

// ───────────────────────────── Main Editor ──────────────────────────────

export interface WysiwygEditorProps {
  /** Current content — can be TipTap JSON, BlogBlock[], or legacy {heading,body}[] */
  value: unknown;
  /** Called with TipTap JSON on every change */
  onChange: (doc: TipTapDoc) => void;
  /** Placeholder text for empty editor */
  placeholder?: string;
}

export function WysiwygEditor({
  value,
  onChange,
  placeholder = "Start writing your article...",
}: WysiwygEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [wordCount, setWordCount] = React.useState(0);
  const [lastLinkUrl, setLastLinkUrl] = React.useState("");
  const initialDoc = React.useMemo(() => blogBlocksToTipTapDoc(value), [value]);
  const skipNextChange = React.useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand underline underline-offset-2 hover:text-brand/80",
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-lg my-4 max-w-full h-auto",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-['attr(before)'] before:text-muted-foreground/50 before:float-left before:h-0 before:pointer-events-none",
      }),
      TextStyle,
      Color,
    ],
    content: initialDoc,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none focus:outline-none min-h-[400px] px-6 py-4 leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      if (skipNextChange.current) {
        skipNextChange.current = false;
        return;
      }
      const json = editor.getJSON() as TipTapDoc;
      onChange(json);
      setWordCount(countTipTapWords(json));
    },
    immediatelyRender: false,
  });

  // Update word count on mount
  React.useEffect(() => {
    if (editor) {
      setWordCount(countTipTapWords(editor.getJSON() as TipTapDoc));
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-[500px] rounded-lg border bg-muted/20 animate-pulse" />
    );
  }

  const readTime = Math.max(1, Math.round(wordCount / 200));

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLastLinkUrl(previousUrl);
    setLinkDialogOpen(true);
  };

  const handleLinkSubmit = (url: string) => {
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    setImageDialogOpen(true);
  };

  const handleImageSubmit = (src: string, alt: string) => {
    editor.chain().focus().setImage({ src, alt }).run();
  };

  const setTextColor = (color: string) => {
    if (color) {
      editor.chain().focus().setColor(color).run();
    } else {
      editor.chain().focus().unsetColor().run();
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      {/* ─── Toolbar ─── */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-2">
        {/* Undo/Redo */}
        <ToolbarButton
          title="Undo (Ctrl+Z)"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Redo (Ctrl+Shift+Z)"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Paragraph / Headings dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 px-3">
              <Type className="size-4" />
              <span className="text-sm">Style</span>
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().setParagraph().run()
              }
              className={cn(
                editor.isActive("paragraph") && "bg-brand/10 text-brand",
              )}
            >
              <Type className="size-4 mr-2" /> Paragraph
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={cn(
                editor.isActive("heading", { level: 2 }) && "bg-brand/10 text-brand",
              )}
            >
              <Heading2 className="size-4 mr-2" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={cn(
                editor.isActive("heading", { level: 3 }) && "bg-brand/10 text-brand",
              )}
            >
              <Heading3 className="size-4 mr-2" /> Heading 3
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 4 }).run()
              }
              className={cn(
                editor.isActive("heading", { level: 4 }) && "bg-brand/10 text-brand",
              )}
            >
              <Heading4 className="size-4 mr-2" /> Heading 4
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Inline formatting */}
        <ToolbarButton
          title="Bold (Ctrl+B)"
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic (Ctrl+I)"
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Underline (Ctrl+U)"
          isActive={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          isActive={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Inline code"
          isActive={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="size-4" />
        </ToolbarButton>

        {/* Color picker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9" title="Text color">
              <Palette className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {TEXT_COLORS.map((c) => (
              <DropdownMenuItem
                key={c.label}
                onClick={() => setTextColor(c.value)}
                className="gap-2"
              >
                {c.value ? (
                  <span
                    className="size-4 rounded border"
                    style={{ backgroundColor: c.value }}
                  />
                ) : (
                  <RemoveFormatting className="size-4" />
                )}
                {c.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolbarButton
          title="Clear formatting"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          <RemoveFormatting className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Lists */}
        <ToolbarButton
          title="Bullet list"
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Alignment */}
        <ToolbarButton
          title="Align left"
          isActive={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Align center"
          isActive={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Align right"
          isActive={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Block elements */}
        <ToolbarButton
          title="Quote"
          isActive={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Code block"
          isActive={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Insert */}
        <ToolbarButton title="Insert link" onClick={addLink}>
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Insert image" onClick={addImage}>
          <ImageIcon className="size-4" />
        </ToolbarButton>
      </div>

      {/* ─── Editor surface ─── */}
      <div className="blog-wysiwyg-surface bg-background">
        <EditorContent editor={editor} />
      </div>

      {/* ─── Status bar ─── */}
      <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>~{readTime} min read</span>
        </div>
        <div className="flex items-center gap-2">
          {editor.isActive("link") && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="text-brand hover:underline"
            >
              Remove link
            </button>
          )}
        </div>
      </div>

      {/* ─── Dialogs ─── */}
      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        onSubmit={handleLinkSubmit}
        initialUrl={lastLinkUrl}
      />
      <ImageDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onSubmit={handleImageSubmit}
      />
    </div>
  );
}

/** Expose count helpers for the parent editor (tabs, autosave, etc.) */
export { countTipTapWords, estimateTipTapReadTime };
export type { TipTapDoc };
