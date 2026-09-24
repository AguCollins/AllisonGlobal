import createDOMPurify from "isomorphic-dompurify";

/**
 * Server-side HTML sanitizer.
 *
 * All admin-provided rich content (blog post bodies, project descriptions,
 * etc.) must pass through this before being stored OR rendered.
 *
 * Never render arbitrary admin HTML with dangerouslySetInnerHTML without
 * passing through sanitize() first.
 */

const purify = createDOMPurify();

/**
 * Sanitize HTML content — removes <script>, onerror, javascript: URLs,
 * and all XSS vectors. Returns safe HTML.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "h2", "h3", "h4", "ul", "ol", "li",
      "a", "img", "blockquote", "code", "pre", "span", "div", "hr",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "rel", "target"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize plain text — strips ALL HTML tags. Used for fields that should
 * never contain HTML (names, titles, subjects, etc.).
 */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";
  return purify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
