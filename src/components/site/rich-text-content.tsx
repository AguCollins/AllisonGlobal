"use client";

import * as React from "react";
import { TipTapRenderer } from "@/components/blog/tiptap-renderer";
import type { TipTapDoc } from "@/components/blog/format-converter";

/**
 * Renders rich text content that can be either:
 * - Plain text (string) — rendered as paragraphs
 * - TipTap JSON ({ type: "doc", ... }) — rendered via TipTapRenderer
 * - Array of blocks (legacy) — rendered as paragraphs
 *
 * Used by public views (service detail, project detail) to render
 * WYSIWYG-formatted content from the admin editors.
 */
export function RichTextContent({
  content,
  className,
}: {
  content: unknown;
  className?: string;
}) {
  // TipTap JSON → use the TipTap renderer
  if (content && typeof content === "object" && (content as Record<string, unknown>).type === "doc") {
    return <TipTapRenderer doc={content as TipTapDoc} />;
  }

  // Array of blocks (legacy {heading, body}[] or BlogBlock[])
  if (Array.isArray(content)) {
    return (
      <div className={className}>
        {content.map((block, i) => {
          const b = block as Record<string, unknown>;
          if (typeof b.text === "string") {
            return <p key={i} className="mb-3">{b.text}</p>;
          }
          if (typeof b.body === "string") {
            return (
              <React.Fragment key={i}>
                {typeof b.heading === "string" && (
                  <h3 className="mt-4 mb-1 font-semibold">{b.heading}</h3>
                )}
                <p className="mb-3">{b.body}</p>
              </React.Fragment>
            );
          }
          return null;
        })}
      </div>
    );
  }

  // Plain string — render as text (preserving newlines)
  if (typeof content === "string" && content) {
    return <span className={className}>{content}</span>;
  }

  // Fallback
  return null;
}
