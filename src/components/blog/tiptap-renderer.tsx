/**
 * Public-side renderer for TipTap JSON content.
 *
 * This renders the same JSON that the WYSIWYG editor produces — so what you
 * see in the admin editor is exactly what appears on the public site.
 *
 * Uses React components (no dangerouslySetInnerHTML) for XSS safety.
 */

import * as React from "react";
import Image from "next/image";
import type { TipTapDoc, TipTapNode, TipTapInline } from "./format-converter";

/** Render a single inline text node with its marks (bold, italic, etc.). */
function renderInline(inline: TipTapInline, key: number): React.ReactNode {
  if (inline.type !== "text") return null;
  let content: React.ReactNode = inline.text;
  const marks = inline.marks || [];

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        content = <strong key={`b-${key}`}>{content}</strong>;
        break;
      case "italic":
        content = <em key={`i-${key}`}>{content}</em>;
        break;
      case "underline":
        content = (
          <u key={`u-${key}`}>{content}</u>
        );
        break;
      case "strike":
        content = <s key={`s-${key}`}>{content}</s>;
        break;
      case "code":
        content = (
          <code
            key={`code-${key}`}
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-brand"
          >
            {content}
          </code>
        );
        break;
      case "link": {
        const href = String(mark.attrs?.href || "#");
        content = (
          <a
            key={`link-${key}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand underline underline-offset-2 hover:text-brand/80 transition-colors"
          >
            {content}
          </a>
        );
        break;
      }
      case "textStyle": {
        const color = String(mark.attrs?.color || "");
        if (color) {
          content = (
            <span key={`color-${key}`} style={{ color }}>
              {content}
            </span>
          );
        }
        break;
      }
    }
  }

  return <React.Fragment key={key}>{content}</React.Fragment>;
}

/** Render an array of inline nodes. */
function renderInlines(inlines?: TipTapInline[]): React.ReactNode {
  if (!inlines || inlines.length === 0) return null;
  return inlines.map((inline, i) => renderInline(inline, i));
}

/** Render a single block-level node. */
function renderNode(node: TipTapNode, key: number): React.ReactNode {
  switch (node.type) {
    case "paragraph": {
      const align = (node.attrs?.textAlign as string | undefined) ||
        (node.attrs as Record<string, unknown> | undefined)?.textAlign as string | undefined;
      return (
        <p
          key={key}
          className="mb-4 leading-relaxed text-muted-foreground"
          style={align ? { textAlign: align as "left" | "center" | "right" } : undefined}
        >
          {renderInlines(node.content) || "\u200B"}
        </p>
      );
    }
    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const align = ((node.attrs as Record<string, unknown> | undefined)?.textAlign) as string | undefined;
      const text = renderInlines(node.content);
      const style = align ? { textAlign: align as "left" | "center" | "right" } : undefined;
      if (level === 3) {
        return (
          <h3
            key={key}
            style={style}
            className="mt-8 mb-3 font-display text-xl font-bold leading-tight"
          >
            {text}
          </h3>
        );
      }
      if (level === 4) {
        return (
          <h4
            key={key}
            style={style}
            className="mt-6 mb-2 font-display text-lg font-semibold leading-tight"
          >
            {text}
          </h4>
        );
      }
      return (
        <h2
          key={key}
          style={style}
          className="mt-10 mb-4 font-display text-2xl font-bold leading-tight"
        >
          {text}
        </h2>
      );
    }
    case "bulletList": {
      const children = (node as { content?: TipTapNode[] }).content || [];
      return (
        <ul key={key} className="mb-4 ml-6 list-disc space-y-1.5 text-muted-foreground">
          {children.map((item, i) => (
            <li key={i}>{renderNode(item, i)}</li>
          ))}
        </ul>
      );
    }
    case "orderedList": {
      const children = (node as { content?: TipTapNode[] }).content || [];
      return (
        <ol key={key} className="mb-4 ml-6 list-decimal space-y-1.5 text-muted-foreground">
          {children.map((item, i) => (
            <li key={i}>{renderNode(item, i)}</li>
          ))}
        </ol>
      );
    }
    case "listItem": {
      const children = (node as { content?: TipTapNode[] }).content || [];
      const firstChild = children[0] as { content?: TipTapInline[] } | undefined;
      return (
        <React.Fragment key={key}>
          {renderInlines(firstChild?.content)}
        </React.Fragment>
      );
    }
    case "blockquote": {
      const children = (node as { content?: TipTapNode[] }).content || [];
      return (
        <blockquote
          key={key}
          className="my-6 border-l-4 border-brand/40 pl-6 italic text-muted-foreground"
        >
          {children.map((child, i) => renderNode(child, i))}
        </blockquote>
      );
    }
    case "codeBlock":
      return (
        <pre
          key={key}
          className="my-4 overflow-x-auto rounded-lg bg-muted/50 p-4 font-mono text-sm text-foreground"
        >
          <code>{renderInlines(node.content)}</code>
        </pre>
      );
    case "image": {
      const src = String(node.attrs?.src ?? "");
      const alt = String(node.attrs?.alt ?? "");
      const caption = node.attrs?.caption ? String(node.attrs.caption) : undefined;
      if (!src) return null;
      return (
        <figure key={key} className="my-6">
          <div className="relative w-full overflow-hidden rounded-lg ring-1 ring-border">
            <Image
              src={src}
              alt={alt || ""}
              width={1200}
              height={675}
              className="h-auto w-full object-cover"
              unoptimized
            />
          </div>
          {caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }
    case "horizontalRule":
      return <hr key={key} className="my-8 border-border" />;
    case "hardBreak":
      return <br key={key} />;
    default:
      return null;
  }
}

/** Render a full TipTap document. */
export function TipTapRenderer({ doc }: { doc: TipTapDoc }) {
  return (
    <div className="prose prose-lg max-w-none">
      {(doc.content || []).map((node, i) => renderNode(node, i))}
    </div>
  );
}
