/**
 * Server-side HTML sanitizer — Vercel/serverless compatible.
 *
 * Replaces isomorphic-dompurify (which depends on jsdom and breaks on
 * Vercel's serverless runtime due to ESM/CommonJS incompatibility).
 *
 * Uses a regex-based approach to strip dangerous HTML:
 * - Removes <script> tags and their content
 * - Removes all on* event handler attributes (onclick, onerror, etc.)
 * - Removes javascript: URLs
 * - Removes <iframe>, <object>, <embed> tags
 * - Removes <style> tags (can be used for CSS-based attacks)
 * - Allows safe tags: p, br, strong, em, h2, h3, h4, ul, ol, li, a, img, blockquote, code, span, div, hr
 * - Allows safe attributes: href, src, alt, title, class, rel, target
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "u", "b", "i", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "a", "img", "blockquote", "code", "pre", "span", "div", "hr",
  "table", "thead", "tbody", "tr", "th", "td",
]);

const ALLOWED_ATTRS = new Set([
  "href", "src", "alt", "title", "class", "rel", "target", "colspan", "rowspan",
]);

/** Sanitize HTML content — removes scripts, event handlers, and dangerous URLs. */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";

  let clean = dirty;

  // Remove <script> tags and their content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove <style> tags and their content
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove <iframe>, <object>, <embed>, <applet> tags
  clean = clean.replace(/<\/?(iframe|object|embed|applet|link|meta|base|form|input|button|textarea|select|option)\b[^>]*>/gi, "");

  // Remove all on* event handler attributes (onclick, onerror, onload, etc.)
  clean = clean.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, "");
  clean = clean.replace(/\s+on\w+\s*=\s*'[^']*'/gi, "");
  clean = clean.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, "");

  // Remove javascript: URLs in href and src
  clean = clean.replace(/(href|src)\s*=\s*["']javascript:[^"']*["']/gi, (match) => {
    return match.replace(/javascript:/gi, "blocked:");
  });
  clean = clean.replace(/(href|src)\s*=\s*["']vbscript:[^"']*["']/gi, (match) => {
    return match.replace(/vbscript:/gi, "blocked:");
  });

  // Remove data: URLs in src (can be used for XSS in some browsers)
  clean = clean.replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src="blocked:"');

  // Remove any remaining tags that are not in the allowed list
  clean = clean.replace(/<\/?(\w+)\b[^>]*>/gi, (match, tagName) => {
    if (ALLOWED_TAGS.has(tagName.toLowerCase())) {
      // For allowed tags, strip non-allowed attributes
      return match.replace(/(\w+)\s*=\s*["'][^"']*["']/g, (attrMatch: string, attrName: string) => {
        if (ALLOWED_ATTRS.has(attrName.toLowerCase())) {
          return attrMatch;
        }
        return "";
      }).replace(/(\w+)\s*=\s*[^\s>]+/g, (attrMatch: string, attrName: string) => {
        if (ALLOWED_ATTRS.has(attrName.toLowerCase())) {
          return attrMatch;
        }
        return "";
      });
    }
    // For disallowed tags, remove them but keep inner content
    return "";
  });

  // Add rel="noopener noreferrer" to all <a> tags with target="_blank"
  clean = clean.replace(/<a\b([^>]*)target=["']_blank["']([^>]*)>/gi, (match) => {
    if (!/rel=/i.test(match)) {
      return match.replace(">", ' rel="noopener noreferrer">');
    }
    return match;
  });

  return clean;
}

/** Strip ALL HTML tags — for plain text fields (names, titles, etc.). */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";
  // Remove all HTML tags
  let clean = dirty.replace(/<[^>]*>/g, "");
  // Remove any remaining script-like content
  clean = clean.replace(/javascript:/gi, "");
  clean = clean.replace(/vbscript:/gi, "");
  // Trim and limit
  return clean.trim();
}
