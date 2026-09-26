"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Separator,
} from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ChevronDown,
  Type,
  Undo2,
  Redo2,
} from "lucide-react";

// ───────────────────────────── Lightweight WYSIWYG ─────────────────────────

/**
 * A simpler WYSIWYG editor for shorter content fields (service overview,
 * project description, etc.). Has a smaller toolbar than the full blog
 * editor — no images, no color picker, no code blocks.
 *
 * Stores content as TipTap JSON (same format as the blog editor).
 * Falls back to plain text if the parent passes a string.
 */

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
        "size-8 shrink-0",
        isActive && "bg-brand/15 text-brand hover:bg-brand/20 hover:text-brand",
      )}
    >
      {children}
    </Button>
  );
}

export interface RichTextFieldProps {
  /** Current value — can be a string (plain text) or TipTap JSON. */
  value: unknown;
  /** Called with TipTap JSON on every change. */
  onChange: (doc: unknown) => void;
  /** Placeholder text. */
  placeholder?: string;
  /** Min height of the editor surface. */
  minHeight?: number;
  /** Label for the field (accessibility). */
  label?: string;
}

export function RichTextField({
  value,
  onChange,
  placeholder = "Start typing…",
  minHeight = 200,
  label,
}: RichTextFieldProps) {
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [lastLinkUrl, setLastLinkUrl] = React.useState("");

  // Convert string to TipTap doc if needed
  const initialDoc = React.useMemo(() => {
    if (!value) {
      return { type: "doc", content: [{ type: "paragraph" }] };
    }
    if (typeof value === "string") {
      return {
        type: "doc",
        content: value
          .split(/\n\n+/)
          .filter(Boolean)
          .map((para) => ({
            type: "paragraph",
            content: [{ type: "text", text: para }],
          })),
      };
    }
    // Already TipTap JSON
    if (typeof value === "object" && (value as Record<string, unknown>).type === "doc") {
      return value;
    }
    // Fallback: treat as plain text
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: String(value) }],
        },
      ],
    };
  }, [value]);

  const skipNextChange = React.useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand underline underline-offset-2 hover:text-brand/80",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-['attr(before)'] before:text-muted-foreground/50 before:float-left before:h-0 before:pointer-events-none",
      }),
    ],
    content: initialDoc,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none leading-relaxed",
        style: `min-height: ${minHeight}px`,
        "aria-label": label || "Rich text editor",
      },
    },
    onUpdate: ({ editor }) => {
      if (skipNextChange.current) {
        skipNextChange.current = false;
        return;
      }
      onChange(editor.getJSON());
    },
    immediatelyRender: false,
  });

  React.useEffect(() => {
    if (editor && value !== undefined) {
      // Only reset if the external value differs significantly
      const current = JSON.stringify(editor.getJSON());
      const incoming = JSON.stringify(initialDoc);
      if (current !== incoming) {
        skipNextChange.current = true;
        editor.commands.setContent(initialDoc as object);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDoc]);

  if (!editor) {
    return (
      <div
        className="rounded-lg border bg-muted/20 animate-pulse"
        style={{ minHeight }}
      />
    );
  }

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

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-1.5">
        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 className="size-3.5" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
              <Type className="size-3.5" />
              <span className="text-xs">Style</span>
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={cn(editor.isActive("paragraph") && "bg-brand/10 text-brand")}
            >
              <Type className="size-3.5 mr-2" /> Paragraph
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(editor.isActive("heading", { level: 2 }) && "bg-brand/10 text-brand")}
            >
              <Heading2 className="size-3.5 mr-2" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn(editor.isActive("heading", { level: 3 }) && "bg-brand/10 text-brand")}
            >
              <Heading3 className="size-3.5 mr-2" /> Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <ToolbarButton
          title="Bold (Ctrl+B)"
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic (Ctrl+I)"
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Underline (Ctrl+U)"
          isActive={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          isActive={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-3.5" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <ToolbarButton
          title="Bullet list"
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Quote"
          isActive={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-3.5" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <ToolbarButton title="Insert link" onClick={addLink}>
          <LinkIcon className="size-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor surface */}
      <div className="blog-wysiwyg-surface bg-background px-4 py-3">
        <EditorContent editor={editor} />
      </div>

      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        onSubmit={handleLinkSubmit}
        initialUrl={lastLinkUrl}
      />
    </div>
  );
}
