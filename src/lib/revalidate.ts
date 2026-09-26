/**
 * Centralized cache invalidation.
 *
 * Every CMS mutation calls `revalidateContent(type, id?)` which knows which
 * public routes depend on the mutated content type and calls `revalidatePath`
 * + `revalidateTag` for each.
 *
 * This is the SINGLE place that maps "content type → public routes". Adding
 * a new content type? Add it here. Adding a new public route that depends on
 * a content type? Add the route to the relevant entry here.
 */

import { revalidatePath, revalidateTag } from "next/cache";

type ContentType =
  | "company"
  | "navigation"
  | "ctas"
  | "process"
  | "careers"
  | "legal-privacy"
  | "legal-terms"
  | "stats"
  | "category"
  | "service"
  | "industry"
  | "project"
  | "testimonial"
  | "faq"
  | "solution"
  | "blog"
  | "blog-post"
  | "media"
  | "redirect"
  | "page-content"
  | "all";

const ROUTES: Record<ContentType, string[]> = {
  company: ["/", "/about", "/contact", "/quote", "/careers", "/privacy", "/terms", "/support", "/why-choose-us"],
  navigation: ["/", "/about", "/services", "/solutions", "/industries", "/projects", "/process", "/support", "/why-choose-us", "/testimonials", "/faqs", "/blog", "/contact", "/quote", "/careers", "/privacy", "/terms"],
  ctas: ["/"],
  process: ["/", "/process"],
  careers: ["/", "/careers"],
  "legal-privacy": ["/privacy"],
  "legal-terms": ["/terms"],
  stats: ["/", "/about", "/testimonials"],
  category: ["/", "/services"],
  service: ["/", "/services", "/solutions", "/quote"],
  industry: ["/", "/industries", "/projects", "/solutions", "/why-choose-us"],
  project: ["/", "/projects"],
  testimonial: ["/", "/testimonials", "/about"],
  faq: ["/", "/faqs"],
  solution: ["/", "/solutions"],
  blog: ["/", "/blog"],
  "blog-post": ["/", "/blog"],
  media: ["/"],
  redirect: ["/"],
  "page-content": ["/"],
  all: ["/", "/about", "/services", "/solutions", "/industries", "/projects", "/process", "/support", "/why-choose-us", "/testimonials", "/faqs", "/blog", "/contact", "/quote", "/careers", "/privacy", "/terms"],
};

const TAGS: Record<ContentType, string[]> = {
  company: ["company", "layout"],
  navigation: ["navigation", "layout"],
  ctas: ["ctas", "layout"],
  process: ["process"],
  careers: ["careers"],
  "legal-privacy": ["legal"],
  "legal-terms": ["legal"],
  stats: ["stats"],
  category: ["categories", "services"],
  service: ["services"],
  industry: ["industries"],
  project: ["projects"],
  testimonial: ["testimonials"],
  faq: ["faqs"],
  solution: ["solutions"],
  blog: ["blog"],
  "blog-post": ["blog"],
  media: ["media"],
  redirect: ["redirects"],
  "page-content": ["page-content"],
  all: ["company", "navigation", "ctas", "services", "industries", "projects", "testimonials", "faqs", "solutions", "blog", "process", "careers", "legal"],
};

/**
 * Invalidate all public routes + cache tags that depend on the given
 * content type. Call this from every admin mutation handler AFTER the
 * database write succeeds.
 *
 * @example
 *   await db.service.update({ where: { id }, data });
 *   revalidateContent("service");
 */
export function revalidateContent(type: ContentType, id?: string): void {
  const routes = ROUTES[type] ?? [];
  const tags = TAGS[type] ?? [];

  for (const route of routes) {
    // revalidate the route itself + any nested dynamic routes under it
    revalidatePath(route, "page");
    revalidatePath(`${route}/[slug]`, "page");
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  // Always revalidate the sitemap when content changes
  revalidatePath("/sitemap.xml", "page");
  revalidatePath("/robots.txt", "page");

  // If a specific slug is given, also invalidate that exact URL
  if (id) {
    if (type === "service") revalidatePath(`/services/${id}`, "page");
    if (type === "industry") revalidatePath(`/industries/${id}`, "page");
    if (type === "blog-post") revalidatePath(`/blog/${id}`, "page");
    if (type === "project") revalidatePath(`/projects/${id}`, "page");
    if (type === "solution") revalidatePath(`/solutions/${id}`, "page");
  }
}

/**
 * Invalidate everything — used by "republish all" or maintenance operations.
 */
export function revalidateAll(): void {
  revalidateContent("all");
}
