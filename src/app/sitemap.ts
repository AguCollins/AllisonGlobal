import type { MetadataRoute } from "next";
import { services } from "@/lib/data/services";
import { industries } from "@/lib/data/industries";
import { blogPosts } from "@/lib/data/blog";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.allisonglobal.tech";

/**
 * Dynamic sitemap covering all static routes + dynamic service/industry/blog
 * detail pages. Legal pages are excluded (noindex) so they don't compete with
 * commercial pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/solutions",
    "/industries",
    "/projects",
    "/process",
    "/support",
    "/why-choose-us",
    "/testimonials",
    "/faqs",
    "/blog",
    "/contact",
    "/quote",
    "/careers",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${siteUrl}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const industryRoutes = industries.map((i) => ({
    url: `${siteUrl}/industries/${i.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blogRoutes = blogPosts.map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...serviceRoutes, ...industryRoutes, ...blogRoutes];
}
