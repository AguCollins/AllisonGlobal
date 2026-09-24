import type { ViewId, NavParam } from "@/lib/types";

/**
 * Maps a (view, params) tuple to a real URL path for the Next.js App Router.
 * Every view now has its own unique link, e.g. /about, /services/structured-cabling.
 */
export function href(view: ViewId, params: NavParam = {}): string {
  switch (view) {
    case "home":
      return "/";
    case "about":
      return "/about";
    case "services":
      return withAnchor("/services", params.anchor);
    case "service-detail":
      return `/services/${params.slug}`;
    case "solutions":
      return withAnchor("/solutions", params.anchor);
    case "industries":
      return "/industries";
    case "industry-detail":
      return `/industries/${params.slug}`;
    case "projects":
      return "/projects";
    case "process":
      return "/process";
    case "support":
      return "/support";
    case "why-choose-us":
      return "/why-choose-us";
    case "testimonials":
      return "/testimonials";
    case "faqs":
      return "/faqs";
    case "blog":
      return "/blog";
    case "blog-post":
      return `/blog/${params.slug}`;
    case "contact":
      return withQuery("/contact", params.subject);
    case "quote":
      return withQuery("/quote", params.subject);
    case "careers":
      return "/careers";
    case "privacy":
      return "/privacy";
    case "terms":
      return "/terms";
    default:
      return "/";
  }
}

function withAnchor(path: string, anchor?: string): string {
  return anchor ? `${path}#${anchor}` : path;
}

function withQuery(path: string, subject?: string): string {
  if (!subject) return path;
  return `${path}?subject=${encodeURIComponent(subject)}`;
}

/** Active-route matching: returns true if the current pathname matches a view. */
export function isActiveView(view: ViewId, pathname: string): boolean {
  const base = href(view).split("#")[0].split("?")[0];
  if (base === "/") return pathname === "/";
  // exact match OR a child route (e.g. /services matches /services/structured-cabling)
  return pathname === base || pathname.startsWith(base + "/");
}
