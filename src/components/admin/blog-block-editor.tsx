"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  ChevronDown,
  Type,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  AlertCircle,
  Minus,
  Code,
  FileText,
} from "lucide-react";
import {
  type BlogBlock,
  BLOG_BLOCK_TYPES,
  createEmptyBlock,
  BlogBlockRenderer,
  ContentBlockBadge,
} from "@/components/blog/blog-block-renderer";

// ───────────────────────── Helpers ─────────────────────────

/** Counts words across text-based blocks; lists count each item. */
export function countBlockWords(blocks: BlogBlock[]): number {
  let words = 0;
  for (const b of blocks) {
    switch (b.type) {
      case "paragraph":
      case "h2":
      case "h3":
      case "h4":
      case "code":
      case "quote":
      case "callout": {
        const t = "text" in b ? (b.text as string) : "";
        words += t.trim() ? t.trim().split(/\s+/).length : 0;
        break;
      }
      case "ul":
      case "ol": {
        for (const it of b.items) {
          words += it.trim() ? it.trim().split(/\s+/).length : 0;
        }
        break;
      }
      case "image":
      case "divider":
        break;
    }
  }
  return words;
}

/** Rough estimated read time in minutes (200 wpm). */
export function estimateReadTime(blocks: BlogBlock[]): number {
  const words = countBlockWords(blocks);
  return Math.max(1, Math.round(words / 200));
}

function blockIcon(type: BlogBlock["type"]) {
  switch (type) {
    case "paragraph":
      return Type;
    case "h2":
      return Heading2;
    case "h3":
      return Heading3;
    case "h4":
      return Heading4;
    case "ul":
      return List;
    case "ol":
      return ListOrdered;
    case "quote":
      return Quote;
    case "image":
      return ImageIcon;
    case "callout":
      return AlertCircle;
    case "divider":
      return Minus;
    case "code":
      return Code;
    default:
      return FileText;
  }
}

// ───────────────────────── Per-block editor ─────────────────────────

interface BlockEditorProps {
  block: BlogBlock;
  onChange: (next: BlogBlock) => void;
}

function SingleLineTextBlock({
  block,
  onChange,
  placeholder,
  label,
}: {
  block: Extract<BlogBlock, { text: string }>;
  onChange: (next: BlogBlock) => void;
  placeholder?: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        className="h-10"
        placeholder={placeholder}
      />
    </div>
  );
}

function MultiLineTextBlock({
  block,
  onChange,
  placeholder,
  label,
  mono = false,
  rows = 5,
}: {
  block: Extract<BlogBlock, { text: string }>;
  onChange: (next: BlogBlock) => void;
  placeholder?: string;
  label: string;
  mono?: boolean;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Textarea
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        rows={rows}
        className={mono ? "font-mono text-sm" : ""}
        placeholder={placeholder}
      />
    </div>
  );
}

function ItemsBlock({
  block,
  onChange,
}: {
  block: Extract<BlogBlock, { items: string[] }>;
  onChange: (next: BlogBlock) => void;
}) {
  const value = block.items.join("\n");
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">
        Items (one per line)
      </Label>
      <Textarea
        value={value}
        onChange={(e) =>
          onChange({
            ...block,
            items: e.target.value.split("\n").map((s) => s),
          })
        }
        rows={4}
        placeholder={"First item\nSecond item\nThird item"}
      />
      {block.items.filter(Boolean).length > 0 && (
        <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
          <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">
            Preview
          </p>
          {block.type === "ul" ? (
            <ul className="ml-4 list-disc space-y-0.5">
              {block.items.filter(Boolean).map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          ) : (
            <ol className="ml-4 list-decimal space-y-0.5">
              {block.items.filter(Boolean).map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

function QuoteBlockEditor({
  block,
  onChange,
}: {
  block: Extract<BlogBlock, { type: "quote" }>;
  onChange: (next: BlogBlock) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Quote text</Label>
      <Textarea
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        rows={3}
        placeholder="The quote…"
      />
      <Label className="text-xs text-muted-foreground">Caption (optional)</Label>
      <Input
        value={block.caption ?? ""}
        onChange={(e) =>
          onChange({ ...block, caption: e.target.value || undefined })
        }
        className="h-10"
        placeholder="Author / source"
      />
    </div>
  );
}

function ImageBlockEditor({
  block,
  onChange,
}: {
  block: Extract<BlogBlock, { type: "image" }>;
  onChange: (next: BlogBlock) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Image URL</Label>
      <Input
        value={block.src}
        onChange={(e) => onChange({ ...block, src: e.target.value })}
        className="h-10"
        placeholder="https://…"
        type="url"
      />
      <Label className="text-xs text-muted-foreground">Alt text</Label>
      <Input
        value={block.alt}
        onChange={(e) => onChange({ ...block, alt: e.target.value })}
        className="h-10"
        placeholder="Describe the image for screen readers"
      />
      <Label className="text-xs text-muted-foreground">
        Caption (optional)
      </Label>
      <Input
        value={block.caption ?? ""}
        onChange={(e) =>
          onChange({ ...block, caption: e.target.value || undefined })
        }
        className="h-10"
        placeholder="Caption shown under the image"
      />
      {block.src && (
        <div className="overflow-hidden rounded-md border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt}
            className="max-h-64 w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
            }}
          />
        </div>
      )}
    </div>
  );
}

function CalloutBlockEditor({
  block,
  onChange,
}: {
  block: Extract<BlogBlock, { type: "callout" }>;
  onChange: (next: BlogBlock) => void;
}) {
  const variants: { value: "info" | "warning" | "success"; label: string }[] = [
    { value: "info", label: "Info" },
    { value: "warning", label: "Warning" },
    { value: "success", label: "Success" },
  ];
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Variant</Label>
      <div className="flex gap-1.5">
        {variants.map((v) => (
          <Button
            key={v.value}
            type="button"
            variant={block.variant === v.value ? "default" : "outline"}
            size="sm"
            className="min-h-9"
            onClick={() => onChange({ ...block, variant: v.value })}
          >
            {v.label}
          </Button>
        ))}
      </div>
      <Label className="text-xs text-muted-foreground">Text</Label>
      <Textarea
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        rows={3}
        placeholder="Callout message…"
      />
    </div>
  );
}

function BlockEditor({ block, onChange }: BlockEditorProps) {
  switch (block.type) {
    case "paragraph":
      return (
        <MultiLineTextBlock
          block={block}
          onChange={onChange}
          label="Paragraph text"
          placeholder="Write your paragraph…"
          rows={4}
        />
      );
    case "h2":
      return (
        <SingleLineTextBlock
          block={block}
          onChange={onChange}
          label="Heading 2"
          placeholder="Section title"
        />
      );
    case "h3":
      return (
        <SingleLineTextBlock
          block={block}
          onChange={onChange}
          label="Heading 3"
          placeholder="Sub-section title"
        />
      );
    case "h4":
      return (
        <SingleLineTextBlock
          block={block}
          onChange={onChange}
          label="Heading 4"
          placeholder="Minor heading"
        />
      );
    case "ul":
      return <ItemsBlock block={block} onChange={onChange} />;
    case "ol":
      return <ItemsBlock block={block} onChange={onChange} />;
    case "quote":
      return <QuoteBlockEditor block={block} onChange={onChange} />;
    case "image":
      return <ImageBlockEditor block={block} onChange={onChange} />;
    case "callout":
      return <CalloutBlockEditor block={block} onChange={onChange} />;
    case "code":
      return (
        <MultiLineTextBlock
          block={block}
          onChange={onChange}
          label="Code"
          placeholder={"const x = 1;\nconsole.log(x);"}
          mono
          rows={6}
        />
      );
    case "divider":
      return (
        <div className="flex items-center gap-3 py-2 text-sm text-muted-foreground">
          <Minus className="size-4" />
          Horizontal divider — renders as a thin rule.
        </div>
      );
    default:
      return null;
  }
}

// ───────────────────────── Editor ─────────────────────────

export interface BlogBlockEditorProps {
  blocks: BlogBlock[];
  onChange: (blocks: BlogBlock[]) => void;
}

export function BlogBlockEditor({ blocks, onChange }: BlogBlockEditorProps) {
  function updateBlock(i: number, next: BlogBlock) {
    onChange(blocks.map((b, idx) => (idx === i ? next : b)));
  }
  function removeBlock(i: number) {
    onChange(blocks.filter((_, idx) => idx !== i));
  }
  function moveBlock(i: number, dir: -1 | 1) {
    const target = i + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  }
  function addBlock(type: BlogBlock["type"]) {
    onChange([...blocks, createEmptyBlock(type)]);
  }

  const words = countBlockWords(blocks);
  const readTime = estimateReadTime(blocks);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Content blocks</CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{words} words</span>
            <span aria-hidden>·</span>
            <span>~{readTime} min read</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {blocks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No content yet. Click <span className="font-medium">Add block</span> below to start writing.
            </div>
          ) : (
            blocks.map((block, i) => {
              const Icon = blockIcon(block.type);
              return (
                <div
                  key={i}
                  className="space-y-3 rounded-lg border border-border bg-muted/20 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />
                      <ContentBlockBadge type={block.type} />
                      <span className="text-xs text-muted-foreground">
                        #{i + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        onClick={() => moveBlock(i, -1)}
                        disabled={i === 0}
                        title="Move up"
                        aria-label="Move block up"
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        onClick={() => moveBlock(i, 1)}
                        disabled={i === blocks.length - 1}
                        title="Move down"
                        aria-label="Move block down"
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 hover:text-destructive"
                        onClick={() => removeBlock(i)}
                        title="Delete block"
                        aria-label="Delete block"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <BlockEditor
                    block={block}
                    onChange={(next) => updateBlock(i, next)}
                  />
                </div>
              );
            })
          )}

          {/* Add block dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="min-h-10 w-full justify-center border-dashed"
              >
                <Plus className="size-4" />
                Add block
                <ChevronDown className="size-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-72">
              <DropdownMenuLabel>Add a block</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {BLOG_BLOCK_TYPES.map((bt) => {
                const Icon = blockIcon(bt.type);
                return (
                  <DropdownMenuItem
                    key={bt.type}
                    onClick={() => addBlock(bt.type)}
                    className="min-h-9 cursor-pointer"
                  >
                    <Icon className="size-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{bt.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {bt.description}
                      </span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Live preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none rounded-lg border border-border bg-background p-6">
            <BlogBlockRenderer content={blocks} />
          </div>
        </CardContent>
      </Card>

      <Separator />
    </div>
  );
}
