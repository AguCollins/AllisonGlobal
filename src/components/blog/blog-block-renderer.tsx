/**
 * Shared block types for the Allison Global blog editor + public renderer.
 *
 * A blog post's `content` JSON column is an array of `BlogBlock`. This file
 * holds the canonical type plus a small renderer that is used both by the
 * admin editor's live preview and by the public blog-post view, so the two
 * always stay in sync.
 */

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Info,
  TriangleAlert,
  CheckCircle2,
} from "lucide-react";
import { TipTapRenderer as TipTapRendererLazy } from "./tiptap-renderer";

// ───────────────────────── Block type ─────────────────────────

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "h4"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string; caption?: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "callout"; text: string; variant: "info" | "warning" | "success" }
  | { type: "divider" }
  | { type: "code"; text: string };

/** Legacy format used by older posts before the block editor shipped. */
export interface LegacyBlock {
  heading?: string;
  body: string;
}

export type ContentBlock = BlogBlock | LegacyBlock;

export const BLOG_BLOCK_TYPES: {
  type: BlogBlock["type"];
  label: string;
  description: string;
}[] = [
  { type: "paragraph", label: "Paragraph", description: "Body text" },
  { type: "h2", label: "Heading 2", description: "Section title" },
  { type: "h3", label: "Heading 3", description: "Sub-section title" },
  { type: "h4", label: "Heading 4", description: "Minor heading" },
  { type: "ul", label: "Bullet list", description: "Unordered list" },
  { type: "ol", label: "Numbered list", description: "Ordered list" },
  { type: "quote", label: "Quote", description: "Block quote with caption" },
  { type: "image", label: "Image", description: "Image with caption" },
  { type: "callout", label: "Callout", description: "Highlighted note" },
  { type: "divider", label: "Divider", description: "Horizontal rule" },
  { type: "code", label: "Code", description: "Monospace code block" },
];

/** Create a blank block of the given type. */
export function createEmptyBlock(type: BlogBlock["type"]): BlogBlock {
  switch (type) {
    case "paragraph":
    case "h2":
    case "h3":
    case "h4":
    case "code":
      return { type, text: "" };
    case "ul":
    case "ol":
      return { type, items: [] };
    case "quote":
      return { type, text: "" };
    case "image":
      return { type, src: "", alt: "" };
    case "callout":
      return { type, text: "", variant: "info" };
    case "divider":
      return { type };
  }
}

/** Coerce any persisted JSON value into a clean BlogBlock array. Accepts
 *  both new typed blocks and the legacy { heading, body } shape. */
export function normalizeBlocks(input: unknown): BlogBlock[] {
  if (!Array.isArray(input)) return [];
  const out: BlogBlock[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const block = raw as Record<string, unknown>;
    if ("type" in block && typeof block.type === "string") {
      switch (block.type) {
        case "paragraph":
        case "h2":
        case "h3":
        case "h4":
        case "code":
          out.push({ type: block.type, text: String(block.text ?? "") });
          break;
        case "ul":
        case "ol":
          out.push({
            type: block.type,
            items: Array.isArray(block.items)
              ? block.items.map((i) => String(i))
              : [],
          });
          break;
        case "quote":
          out.push({
            type: "quote",
            text: String(block.text ?? ""),
            caption: block.caption ? String(block.caption) : undefined,
          });
          break;
        case "image":
          out.push({
            type: "image",
            src: String(block.src ?? ""),
            alt: String(block.alt ?? ""),
            caption: block.caption ? String(block.caption) : undefined,
          });
          break;
        case "callout":
          out.push({
            type: "callout",
            text: String(block.text ?? ""),
            variant:
              block.variant === "warning" || block.variant === "success"
                ? block.variant
                : "info",
          });
          break;
        case "divider":
          out.push({ type: "divider" });
          break;
      }
    } else if ("body" in block || "heading" in block) {
      const heading = block.heading ? String(block.heading) : "";
      const body = block.body ? String(block.body) : "";
      if (heading) out.push({ type: "h2", text: heading });
      if (body) out.push({ type: "paragraph", text: body });
    }
  }
  return out;
}

// ───────────────────────── Renderer ─────────────────────────

const CALLOUT_STYLES: Record<
  "info" | "warning" | "success",
  { box: string; icon: typeof Info; iconColor: string }
> = {
  info: {
    box: "border-sky-500/30 bg-sky-50/60 dark:bg-sky-500/10",
    icon: Info,
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  warning: {
    box: "border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/10",
    icon: TriangleAlert,
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  success: {
    box: "border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/10",
    icon: CheckCircle2,
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
};

function isTypedBlock(b: ContentBlock): b is BlogBlock {
  return (
    typeof (b as { type?: unknown }).type === "string" &&
    (b as { type?: unknown }).type !== undefined
  );
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  // Legacy { heading?, body } — render as heading + paragraph pair
  if (!isTypedBlock(block)) {
    return (
      <>
        {block.heading ? (
          <h2 className="mt-8 mb-3 font-display text-2xl font-bold leading-tight">
            {block.heading}
          </h2>
        ) : null}
        {block.body ? (
          <p className="mb-4 leading-relaxed text-muted-foreground">
            {block.body}
          </p>
        ) : null}
      </>
    );
  }

  switch (block.type) {
    case "paragraph":
      return block.text ? (
        <p className="mb-4 leading-relaxed text-muted-foreground">
          {block.text}
        </p>
      ) : null;

    case "h2":
      return block.text ? (
        <h2 className="mt-8 mb-3 font-display text-2xl font-bold leading-tight">
          {block.text}
        </h2>
      ) : null;

    case "h3":
      return block.text ? (
        <h3 className="mt-6 mb-2 font-display text-xl font-semibold leading-tight">
          {block.text}
        </h3>
      ) : null;

    case "h4":
      return block.text ? (
        <h4 className="mt-5 mb-2 font-display text-lg font-semibold leading-tight">
          {block.text}
        </h4>
      ) : null;

    case "ul":
      return block.items.length > 0 ? (
        <ul className="mb-4 ml-6 list-disc space-y-1.5 text-muted-foreground">
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      ) : null;

    case "ol":
      return block.items.length > 0 ? (
        <ol className="mb-4 ml-6 list-decimal space-y-1.5 text-muted-foreground">
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ol>
      ) : null;

    case "quote":
      return block.text ? (
        <figure className="my-6 border-l-4 border-brand pl-5">
          <blockquote className="font-display text-lg italic leading-relaxed text-foreground">
            {block.text}
          </blockquote>
          {block.caption ? (
            <figcaption className="mt-2 text-sm text-muted-foreground">
              — {block.caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null;

    case "image":
      return block.src ? (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt}
            className="w-full rounded-xl border border-border object-cover"
          />
          {block.caption ? (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null;

    case "callout": {
      const style = CALLOUT_STYLES[block.variant];
      const Icon = style.icon;
      return block.text ? (
        <div
          className={`my-6 flex gap-3 rounded-lg border p-4 ${style.box}`}
        >
          <Icon className={`mt-0.5 size-5 shrink-0 ${style.iconColor}`} />
          <p className="text-sm leading-relaxed text-foreground">
            {block.text}
          </p>
        </div>
      ) : null;
    }

    case "divider":
      return <hr className="my-8 border-border" />;

    case "code":
      return block.text ? (
        <pre className="my-6 overflow-x-auto rounded-lg border border-border bg-muted/50 p-4">
          <code className="font-mono text-sm text-foreground">
            {block.text}
          </code>
        </pre>
      ) : null;

    default:
      return null;
  }
}

export interface BlogBlockRendererProps {
  /** Content — can be BlogBlock[], legacy {heading, body}[], or TipTap JSON. */
  content: unknown;
  /** Optional className for the wrapper. */
  className?: string;
}

/**
 * Render blog content — auto-detects format:
 * - TipTap JSON ({ type: "doc", ... }) → TipTapRenderer (new WYSIWYG format)
 * - BlogBlock[] or legacy {heading, body}[] → block renderer (old format)
 */
export function BlogBlockRenderer({ content, className }: BlogBlockRendererProps) {
  // TipTap JSON format → use the new renderer
  if (content && typeof content === "object" && (content as Record<string, unknown>).type === "doc") {
    return <TipTapRendererLazy doc={content as import("./format-converter").TipTapDoc} />;
  }

  // Old format: array of blocks
  const blocks = normalizeBlocks(content);
  if (!blocks || blocks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No content yet. Start writing in the editor above.
      </p>
    );
  }
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const key = isTypedBlock(block)
          ? `${block.type}-${i}`
          : `legacy-${i}`;
        return <BlockRenderer key={key} block={block} />;
      })}
    </div>
  );
}

/** Small badge showing a block's type. */
export function ContentBlockBadge({ type }: { type: BlogBlock["type"] }) {
  const labels: Record<BlogBlock["type"], string> = {
    paragraph: "Paragraph",
    h2: "H2",
    h3: "H3",
    h4: "H4",
    ul: "Bullet list",
    ol: "Numbered list",
    quote: "Quote",
    image: "Image",
    callout: "Callout",
    divider: "Divider",
    code: "Code",
  };
  return (
    <Badge variant="secondary" className="font-mono text-[10px] uppercase">
      {labels[type]}
    </Badge>
  );
}
