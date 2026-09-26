import type { MetadataRoute } from "next";
import { getServices, getIndustries, getBlogPosts } from "@/lib/data-access";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.allisonglobal.tech";

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

  // Fetch dynamic routes from database — NO static fallback.
  // If DB is unavailable, only static routes are returned.
  let serviceRoutes: MetadataRoute.Sitemap = [];
  let industryRoutes: MetadataRoute.Sitemap = [];
  let blogRoutes: MetadataRoute.Sitemap = [];

  try {
    const [services, industries, blogPosts] = await Promise.all([
      getServices(),
      getIndustries(),
      getBlogPosts(),
    ]);

    serviceRoutes = services.map((s) => ({
      url: `${siteUrl}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    industryRoutes = industries.map((i) => ({
      url: `${siteUrl}/industries/${i.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    blogRoutes = blogPosts.map((p) => ({
      url: `${siteUrl}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    // DB unavailable — return only static routes (sitemaps can be partial)
    console.error("[sitemap] Database unavailable — returning static routes only");
  }

  return [...staticRoutes, ...serviceRoutes, ...industryRoutes, ...blogRoutes];
}
