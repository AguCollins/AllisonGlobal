/**
 * Format conversion utilities for the blog editor.
 *
 * The blog `content` column can store content in two formats:
 *
 * 1. OLD: BlogBlock[] — array of typed blocks like { type: "paragraph", text: "..." }
 * 2. NEW: TipTap JSON — { type: "doc", content: [...] } with inline formatting
 *
 * This module converts between the two so that:
 * - Old posts load correctly in the new WYSIWYG editor
 * - The public renderer handles both formats transparently
 */

import type { BlogBlock, LegacyBlock } from "./blog-block-renderer";

// ─── TipTap JSON types (minimal subset we use) ─────────────────────────

export interface TipTapDoc {
  type: "doc";
  content: TipTapNode[];
}

export type TipTapNode =
  | { type: "paragraph"; content?: TipTapInline[]; attrs?: Record<string, unknown> }
  | { type: "heading"; attrs: { level: number; textAlign?: string }; content?: TipTapInline[] }
  | { type: "bulletList"; content: TipTapNode[]; attrs?: Record<string, unknown> }
  | { type: "orderedList"; content: TipTapNode[]; attrs?: Record<string, unknown> }
  | { type: "listItem"; content: TipTapNode[]; attrs?: Record<string, unknown> }
  | { type: "blockquote"; content: TipTapNode[]; attrs?: Record<string, unknown> }
  | { type: "codeBlock"; content?: TipTapInline[]; attrs?: Record<string, unknown> }
  | { type: "image"; attrs: { src: string; alt?: string; caption?: string } }
  | { type: "horizontalRule"; attrs?: Record<string, unknown> }
  | { type: "hardBreak"; attrs?: Record<string, unknown> };

export interface TipTapInline {
  type: "text";
  text: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

// ─── Detection ─────────────────────────────────────────────────────────

/** Check if a content value is the new TipTap JSON format. */
export function isTipTapDoc(content: unknown): content is TipTapDoc {
  if (!content || typeof content !== "object") return false;
  const obj = content as Record<string, unknown>;
  return obj.type === "doc" && Array.isArray(obj.content);
}

// ─── BlogBlock[] → TipTap JSON ──────────────────────────────────────────

/** Convert old BlogBlock array to TipTap JSON document for the WYSIWYG editor. */
export function blogBlocksToTipTapDoc(blocks: unknown): TipTapDoc {
  // If already a TipTap doc, return as-is
  if (isTipTapDoc(blocks)) return blocks;

  // If it's an array, convert each block
  const arr = Array.isArray(blocks) ? blocks : [];
  const nodes: TipTapNode[] = [];

  for (const raw of arr) {
    if (!raw || typeof raw !== "object") continue;
    const block = raw as Record<string, unknown>;

    // New format: { type: "paragraph", text: "..." }
    if ("type" in block && typeof block.type === "string") {
      switch (block.type) {
        case "paragraph":
          nodes.push(textNode("paragraph", String(block.text ?? "")));
          break;
        case "h2":
          nodes.push(textNode("heading", String(block.text ?? ""), { level: 2 }));
          break;
        case "h3":
          nodes.push(textNode("heading", String(block.text ?? ""), { level: 3 }));
          break;
        case "h4":
          nodes.push(textNode("heading", String(block.text ?? ""), { level: 4 }));
          break;
        case "code":
          nodes.push(textNode("codeBlock", String(block.text ?? "")));
          break;
        case "quote": {
          const quoteText = String(block.text ?? "");
          const nodes2: TipTapNode[] = [textNode("paragraph", quoteText)];
          nodes.push({ type: "blockquote", content: nodes2 });
          break;
        }
        case "callout": {
          // Render callout as a paragraph with a leading emoji
          const variant = block.variant === "warning" ? "⚠️" : block.variant === "success" ? "✅" : "ℹ️";
          nodes.push(textNode("paragraph", `${variant} ${String(block.text ?? "")}`));
          break;
        }
        case "ul": {
          const items = Array.isArray(block.items) ? block.items : [];
          nodes.push({
            type: "bulletList",
            content: items.map((item) => ({
              type: "listItem",
              content: [textNode("paragraph", String(item))],
            })),
          });
          break;
        }
        case "ol": {
          const items = Array.isArray(block.items) ? block.items : [];
          nodes.push({
            type: "orderedList",
            content: items.map((item) => ({
              type: "listItem",
              content: [textNode("paragraph", String(item))],
            })),
          });
          break;
        }
        case "image":
          nodes.push({
            type: "image",
            attrs: {
              src: String(block.src ?? ""),
              alt: String(block.alt ?? ""),
              caption: block.caption ? String(block.caption) : undefined,
            },
          });
          break;
        case "divider":
          nodes.push({ type: "horizontalRule" });
          break;
      }
    } else {
      // Legacy format: { heading?: string, body: string }
      const heading = (block as unknown as LegacyBlock).heading;
      const body = (block as unknown as LegacyBlock).body;
      if (heading) {
        nodes.push(textNode("heading", heading, { level: 2 }));
      }
      if (body) {
        nodes.push(textNode("paragraph", body));
      }
    }
  }

  // Ensure at least one paragraph (TipTap requires non-empty doc)
  if (nodes.length === 0) {
    nodes.push(textNode("paragraph", ""));
  }

  return { type: "doc", content: nodes };
}

function textNode(
  type: "paragraph" | "heading" | "codeBlock",
  text: string,
  attrs?: Record<string, unknown>,
): TipTapNode {
  const node: TipTapNode = {
    type,
    ...(attrs ? { attrs } : {}),
  } as TipTapNode;
  if (text) {
    (node as { content?: TipTapInline[] }).content = [{ type: "text", text }];
  }
  return node;
}

// ─── TipTap JSON → BlogBlock[] (for backward compat with old renderer) ─

/** Convert TipTap JSON back to BlogBlock[] (used by the old public renderer if needed). */
export function tipTapDocToBlogBlocks(doc: TipTapDoc): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  for (const node of doc.content) {
    const block = nodeToBlock(node);
    if (block) blocks.push(block);
  }
  return blocks;
}

function nodeToBlock(node: TipTapNode): BlogBlock | null {
  switch (node.type) {
    case "paragraph": {
      const text = extractText(node.content);
      return { type: "paragraph", text };
    }
    case "heading": {
      const text = extractText(node.content);
      const level = (node.attrs?.level as number) ?? 2;
      if (level === 3) return { type: "h3", text };
      if (level === 4) return { type: "h4", text };
      return { type: "h2", text };
    }
    case "codeBlock": {
      const text = extractText(node.content);
      return { type: "code", text };
    }
    case "blockquote": {
      const children = (node as { content?: TipTapNode[] }).content || [];
      const text = extractText((children[0] as { content?: TipTapInline[] })?.content);
      return { type: "quote", text };
    }
    case "bulletList": {
      const children = (node as { content?: TipTapNode[] }).content || [];
      const items = children.map((li) =>
        extractText(((li as { content?: TipTapNode[] }).content?.[0] as { content?: TipTapInline[] })?.content),
      );
      return { type: "ul", items };
    }
    case "orderedList": {
      const children = (node as { content?: TipTapNode[] }).content || [];
      const items = children.map((li) =>
        extractText(((li as { content?: TipTapNode[] }).content?.[0] as { content?: TipTapInline[] })?.content),
      );
      return { type: "ol", items };
    }
    case "image":
      return {
        type: "image",
        src: String(node.attrs?.src ?? ""),
        alt: String(node.attrs?.alt ?? ""),
        caption: node.attrs?.caption ? String(node.attrs.caption) : undefined,
      };
    case "horizontalRule":
      return { type: "divider" };
    default:
      return null;
  }
}

function extractText(inlines?: TipTapInline[]): string {
  if (!inlines) return "";
  return inlines.map((i) => (i.type === "text" ? i.text : "")).join("");
}

// ─── Word/character count helpers ──────────────────────────────────────

/** Count words in a TipTap document. */
export function countTipTapWords(doc: TipTapDoc): number {
  let words = 0;
  for (const node of doc.content) {
    words += countNodeWords(node);
  }
  return words;
}

function countNodeWords(node: TipTapNode): number {
  switch (node.type) {
    case "paragraph":
    case "heading":
    case "codeBlock":
      return countWords(extractText(node.content));
    case "blockquote":
      return (node.content || []).reduce((sum, n) => sum + countNodeWords(n), 0);
    case "bulletList":
    case "orderedList":
      return (node.content || []).reduce(
        (sum, li) => sum + countNodeWords(li),
        0,
      );
    default:
      return 0;
  }
}

function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/** Estimate read time in minutes (200 wpm). */
export function estimateTipTapReadTime(doc: TipTapDoc): number {
  return Math.max(1, Math.round(countTipTapWords(doc) / 200));
}
