/**
 * Smart SEO suggestion engine.
 *
 * Analyzes the content the user has written (title, excerpt, body text,
 * keywords, tags) and generates suggested meta titles, meta descriptions,
 * and OG text that the user can accept with one click or edit further.
 *
 * All suggestions are generated CLIENT-SIDE — no AI API calls, no data
 * leaves the browser. The logic is heuristic-based: it extracts the most
 * meaningful sentences, trims them to SEO-optimal lengths, and formats
 * them for search engines.
 */

// ───────────────────────────── Types ─────────────────────────────

export interface SeoSuggestionInput {
  /** Primary title (blog post title, service name, project title). */
  title: string;
  /** Short summary / excerpt. */
  excerpt?: string;
  /** Full body text (plain text — HTML stripped). */
  bodyText?: string;
  /** Category or type label (e.g. "Cybersecurity", "Network Installation"). */
  category?: string;
  /** Tags or keywords. */
  tags?: string[];
  /** Site/brand name for title suffix. */
  brandName?: string;
}

export interface SeoSuggestion {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
}

// ───────────────────────────── Helpers ─────────────────────────────

const BRAND = "Allison Global";

/** Strip HTML tags from a string (for body text analysis). */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract plain text from a TipTap JSON doc or BlogBlock array. */
function extractPlainText(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") return stripHtml(content);
  if (typeof content !== "object") return "";

  // TipTap JSON: { type: "doc", content: [...] }
  if ((content as Record<string, unknown>).type === "doc") {
    return extractTipTapText(content);
  }

  // Array of blocks (BlogBlock[] or legacy {heading, body}[])
  if (Array.isArray(content)) {
    return content
      .map((block) => {
        const b = block as Record<string, unknown>;
        if ("text" in b) return String(b.text);
        if ("body" in b) return String(b.body);
        if ("heading" in b) return String(b.heading);
        if ("items" in b && Array.isArray(b.items)) return b.items.join(" ");
        return "";
      })
      .join(" ");
  }

  return "";
}

function extractTipTapText(doc: unknown): string {
  const parts: string[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;
    if (n.type === "text" && typeof n.text === "string") {
      parts.push(n.text);
    }
    if (Array.isArray(n.content)) {
      n.content.forEach(walk);
    }
  };
  walk(doc);
  return parts.join(" ");
}

/** Split text into sentences. */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}

/** Truncate to a max length, breaking at a word boundary. */
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > maxLen - 20) return cut.slice(0, lastSpace).trim() + "…";
  return cut.trim() + "…";
}

/** Capitalize the first letter. */
function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Count words. */
function wordCount(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

// ───────────────────────────── Suggestion engine ─────────────────────────────

/**
 * Generate SEO suggestions from the content the user has written.
 *
 * Strategy:
 * - metaTitle: Title + brand suffix (trimmed to 60 chars)
 * - metaDescription: First 1-2 meaningful sentences from excerpt/body (trimmed to 160 chars)
 * - ogTitle: Same as metaTitle but can be slightly longer
 * - ogDescription: Same as metaDescription
 */
export function generateSeoSuggestions(
  input: SeoSuggestionInput,
): SeoSuggestion | null {
  const {
    title,
    excerpt,
    bodyText,
    category,
    tags = [],
    brandName = BRAND,
  } = input;

  const cleanTitle = title.trim();
  const cleanExcerpt = (excerpt || "").trim();
  const cleanBody = stripHtml(extractPlainText(bodyText));

  // If there's no title and no body, we can't suggest anything
  if (!cleanTitle && !cleanExcerpt && !cleanBody) {
    return null;
  }

  // ── Meta Title ──
  // Pattern: "{Title} | {Brand}" or "{Title} — {Category} | {Brand}"
  let metaTitle = "";
  if (cleanTitle) {
    const suffix = ` | ${brandName}`;
    const maxTitleLen = 60;
    if (category) {
      // Try: "Title — Category | Brand"
      const withCat = `${cleanTitle} — ${category}`;
      if (withCat.length + suffix.length <= maxTitleLen) {
        metaTitle = withCat + suffix;
      } else if (withCat.length <= maxTitleLen) {
        metaTitle = withCat;
      } else if (cleanTitle.length + suffix.length <= maxTitleLen) {
        metaTitle = cleanTitle + suffix;
      } else {
        metaTitle = truncate(cleanTitle, maxTitleLen);
      }
    } else {
      if (cleanTitle.length + suffix.length <= maxTitleLen) {
        metaTitle = cleanTitle + suffix;
      } else if (cleanTitle.length <= maxTitleLen) {
        metaTitle = cleanTitle;
      } else {
        metaTitle = truncate(cleanTitle, maxTitleLen);
      }
    }
  }

  // ── Meta Description ──
  // Strategy: prefer excerpt; fall back to first 1-2 sentences of body
  let metaDescription = "";
  const maxDescLen = 160;

  if (cleanExcerpt) {
    metaDescription = truncate(cleanExcerpt, maxDescLen);
  } else if (cleanBody) {
    const sentences = splitSentences(cleanBody);
    if (sentences.length > 0) {
      // Take first sentence; if short enough, add the second
      let desc = sentences[0];
      if (sentences.length > 1 && desc.length < 100) {
        const combined = desc + " " + sentences[1];
        if (combined.length <= maxDescLen) {
          desc = combined;
        }
      }
      metaDescription = truncate(desc, maxDescLen);
    }
  }

  // If we still have no description, build one from title + category + tags
  if (!metaDescription && cleanTitle) {
    const parts: string[] = [cleanTitle];
    if (category) parts.push(`— ${category}`);
    const baseDesc = cap(parts.join(" ")) + ".";
    if (tags.length > 0) {
      const tagDesc = ` Covers ${tags.slice(0, 5).join(", ")}.`;
      metaDescription = truncate(baseDesc + " " + tagDesc, maxDescLen);
    } else {
      metaDescription = truncate(baseDesc + " Expert ICT & security solutions by " + brandName + ".", maxDescLen);
    }
  }

  // ── OG Title ── (can be slightly longer, no brand suffix needed)
  const ogTitle = cleanTitle
    ? truncate(cleanTitle, 80)
    : metaTitle;

  // ── OG Description ── (same as meta description, or slightly longer)
  const ogDescription = metaDescription || truncate(cleanExcerpt || cleanBody, 200);

  return {
    metaTitle,
    metaDescription,
    ogTitle,
    ogDescription,
  };
}

// ───────────────────────────── Quality scoring ─────────────────────────────

export interface SeoQualityScore {
  score: number; // 0-100
  checks: {
    label: string;
    passed: boolean;
    detail: string;
  }[];
}

/**
 * Score the SEO quality of the current values.
 * Returns 0-100 and a list of pass/fail checks with explanations.
 */
export function scoreSeoQuality(params: {
  metaTitle: string;
  metaDescription: string;
  title: string;
  bodyText?: string;
  slug?: string;
}): SeoQualityScore {
  const { metaTitle, metaDescription, title, bodyText = "", slug = "" } = params;
  const checks: SeoQualityScore["checks"] = [];

  // 1. Meta title length (50-60 chars ideal)
  const titleLen = metaTitle.length;
  checks.push({
    label: "Meta title length",
    passed: titleLen >= 30 && titleLen <= 60,
    detail:
      titleLen === 0
        ? "Meta title is empty — defaults to page title"
        : titleLen < 30
          ? `Too short (${titleLen} chars) — aim for 50-60`
          : titleLen > 60
            ? `Too long (${titleLen} chars) — Google may truncate`
            : `Good (${titleLen} chars)`,
  });

  // 2. Meta description length (150-160 chars ideal)
  const descLen = metaDescription.length;
  checks.push({
    label: "Meta description length",
    passed: descLen >= 120 && descLen <= 160,
    detail:
      descLen === 0
        ? "Meta description is empty — search engines will auto-generate"
        : descLen < 120
          ? `Too short (${descLen} chars) — aim for 150-160`
          : descLen > 160
            ? `Too long (${descLen} chars) — Google may truncate`
            : `Good (${descLen} chars)`,
  });

  // 3. Title contains primary keyword
  const bodyWords = bodyText.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
  const titleWords = title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const titleKeywordInBody = titleWords.some((w) => bodyWords.includes(w));
  checks.push({
    label: "Title keyword in content",
    passed: titleKeywordInBody,
    detail: titleKeywordInBody
      ? "Title keywords appear in body content"
      : "Title keywords not found in body — consider aligning them",
  });

  // 4. Slug is URL-friendly
  const slugOk = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  checks.push({
    label: "Slug format",
    passed: slugOk,
    detail: slugOk
      ? "Slug is URL-friendly (lowercase, hyphens)"
      : "Slug should be lowercase with hyphens only",
  });

  // 5. Body has enough content (300+ words)
  const words = wordCount(stripHtml(extractPlainText(bodyText)));
  checks.push({
    label: "Content length",
    passed: words >= 300,
    detail:
      words < 300
        ? `Only ${words} words — aim for 300+ for better ranking`
        : `Good (${words} words)`,
  });

  // 6. Meta description includes title keyword
  const descHasKeyword = titleWords.some((w) =>
    metaDescription.toLowerCase().includes(w),
  );
  checks.push({
    label: "Keyword in description",
    passed: descHasKeyword,
    detail: descHasKeyword
      ? "Primary keyword appears in meta description"
      : "Add the primary keyword to the meta description",
  });

  const passed = checks.filter((c) => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);

  return { score, checks };
}
