/**
 * Data Access Layer — PostgreSQL is the production source of truth.
 *
 * ARCHITECTURE:
 * - generateStaticParams() in route pages uses STATIC seed data to generate
 *   the path list at build time (no DB query needed — just the slugs).
 * - Route page components are force-dynamic → they call these functions at
 *   RUNTIME, which query PostgreSQL.
 * - Admin CRUD calls revalidatePath() to invalidate cached pages.
 * - If the DB is unreachable at runtime, functions throw a controlled error
 *   that the page catches and renders as a user-friendly error state.
 * - There is NO static fallback in production. The database IS the source.
 *
 * The static TypeScript files (src/lib/data/*.ts) exist ONLY as:
 *   1. Seed source (for scripts/seed.ts)
 *   2. Build-time path generation (generateStaticParams — slugs only)
 *   3. Local development fallback (when no DATABASE_URL is set)
 */

import { db } from "@/lib/db";
import {
  services as staticServices,
  serviceCategories as staticCategories,
  categoryMap as staticCategoryMap,
  getServiceBySlug as staticGetService,
  relatedServices as _staticRelated,
} from "@/lib/data/services";
import {
  industries as staticIndustries,
  industryMap as staticIndustryMap,
} from "@/lib/data/industries";
import { projects as staticProjects } from "@/lib/data/projects";
import { testimonials as staticTestimonials } from "@/lib/data/testimonials";
import { faqs as staticFaqs } from "@/lib/data/faqs";
import { blogPosts as staticBlogPosts } from "@/lib/data/blog";
import { solutions as staticSolutions } from "@/lib/data/solutions";
import { company as staticCompany } from "@/lib/data/company";
import type { Service, ServiceCategory } from "@/lib/types";
import type { Industry } from "@/lib/types";
import type { Project } from "@/lib/types";
import type { Testimonial } from "@/lib/types";
import type { Faq } from "@/lib/types";
import type { BlogPost } from "@/lib/types";
import type { Solution } from "@/lib/types";

/**
 * Error thrown when the database is required but unavailable.
 * Pages catch this and render a user-friendly error state.
 */
export class DatabaseUnavailableError extends Error {
  constructor(message = "Content database is not available") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

/**
 * Check if we're in a development/preview environment where static fallback
 * is acceptable. In production with a real DATABASE_URL, the DB is required.
 */
function isDevFallback(): boolean {
  // No DATABASE_URL → local dev, use static data
  if (!process.env.DATABASE_URL) return true;
  // SQLite (file:) → local dev, use static data
  if (process.env.DATABASE_URL.startsWith("file:")) return true;
  return false;
}

/**
 * Check if the database has the required tables.
 * Throws DatabaseUnavailableError if DB is reachable but tables are missing.
 */
async function requireDb(): Promise<boolean> {
  if (isDevFallback()) return false; // use static data in dev

  try {
    await db.$queryRaw`SELECT 1`;
    // Check if the Service table exists
    const result = await db.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Service'
      ) as exists
    `;
    if (!result[0]?.exists) {
      throw new DatabaseUnavailableError(
        "Database tables not found. Run: prisma migrate deploy && bun run seed",
      );
    }
    return true;
  } catch (e) {
    if (e instanceof DatabaseUnavailableError) throw e;
    throw new DatabaseUnavailableError("Cannot connect to database");
  }
}

// ─── Categories ─────────────────────────────────────────────────────────

export async function getCategories(): Promise<ServiceCategory[]> {
  if (await requireDb()) {
    const cats = await db.category.findMany({ orderBy: { sortOrder: "asc" } });
    return cats.map(mapCategory);
  }
  return staticCategories;
}

export async function getCategoryBySlug(slug: string): Promise<ServiceCategory | undefined> {
  if (await requireDb()) {
    const cat = await db.category.findUnique({ where: { slug } });
    return cat ? mapCategory(cat) : undefined;
  }
  return staticCategoryMap[slug];
}

// ─── Services ───────────────────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  if (await requireDb()) {
    const svcs = await db.service.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { category: true },
    });
    return svcs.map(mapService);
  }
  return staticServices;
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  if (await requireDb()) {
    const svc = await db.service.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!svc || !svc.published) return undefined;
    return mapService(svc);
  }
  return staticGetService(slug);
}

export async function getServicesByCategory(categoryId: string): Promise<Service[]> {
  const all = await getServices();
  return all.filter((s) => s.categoryId === categoryId);
}

export async function getFeaturedServices(): Promise<Service[]> {
  const all = await getServices();
  return all.filter((s) => s.featured);
}

export async function getRelatedServices(slug: string): Promise<Service[]> {
  const svc = await getServiceBySlug(slug);
  if (!svc) return [];
  const all = await getServices();
  return svc.relatedServices
    .map((s) => all.find((x) => x.slug === s))
    .filter(Boolean) as Service[];
}

// ─── Industries ─────────────────────────────────────────────────────────

export async function getIndustries(): Promise<Industry[]> {
  if (await requireDb()) {
    const inds = await db.industry.findMany({ orderBy: { sortOrder: "asc" } });
    return inds.map(mapIndustry);
  }
  return staticIndustries;
}

export async function getIndustryById(id: string): Promise<Industry | undefined> {
  if (await requireDb()) {
    const ind = await db.industry.findUnique({ where: { id } });
    return ind ? mapIndustry(ind) : undefined;
  }
  return staticIndustryMap[id];
}

// ─── Projects ───────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  if (await requireDb()) {
    const projs = await db.project.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    return projs.map(mapProject);
  }
  return staticProjects;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const all = await getProjects();
  return all.filter((p) => p.featured);
}

export async function getProjectsByIndustry(industryId: string): Promise<Project[]> {
  const all = await getProjects();
  return all.filter((p) => p.industry === industryId);
}

// ─── Testimonials ───────────────────────────────────────────────────────

export async function getTestimonials(): Promise<Testimonial[]> {
  if (await requireDb()) {
    const tests = await db.testimonial.findMany({ orderBy: { createdAt: "desc" } });
    return tests.map(mapTestimonial);
  }
  return staticTestimonials;
}

// ─── FAQs ───────────────────────────────────────────────────────────────

export async function getFaqs(): Promise<Faq[]> {
  if (await requireDb()) {
    const faqs = await db.faq.findMany({ orderBy: { sortOrder: "asc" } });
    return faqs.map(mapFaq);
  }
  return staticFaqs;
}

// ─── Blog Posts ─────────────────────────────────────────────────────────

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (await requireDb()) {
    const posts = await db.blogPost.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
    });
    return posts.map(mapBlogPost);
  }
  return staticBlogPosts;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  if (await requireDb()) {
    const post = await db.blogPost.findUnique({ where: { slug } });
    if (!post || !post.published) return undefined;
    return mapBlogPost(post);
  }
  return staticBlogPosts.find((p) => p.slug === slug);
}

// ─── Solutions ──────────────────────────────────────────────────────────

export async function getSolutions(): Promise<Solution[]> {
  if (await requireDb()) {
    const sols = await db.solution.findMany({ orderBy: { sortOrder: "asc" } });
    return sols.map(mapSolution);
  }
  return staticSolutions;
}

// ─── Company ─────────────────────────────────────────────────────────────

export async function getCompany() {
  if (await requireDb()) {
    const settings = await db.companySettings.findUnique({ where: { key: "company" } });
    if (settings) return settings.value as typeof staticCompany;
  }
  return staticCompany;
}

// ─── Mappers (DB row → app type) ────────────────────────────────────────

import type { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

function getIcon(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] || Icons.ShieldCheck;
}

function mapCategory(c: {
  id: string; slug: string; name: string; tagline: string; description: string;
  iconName: string; accent: string; sortOrder: number;
}): ServiceCategory {
  return {
    id: c.slug, slug: c.slug, name: c.name, tagline: c.tagline,
    description: c.description, icon: getIcon(c.iconName), accent: c.accent,
    services: [],
  };
}

function mapService(s: {
  id: string; slug: string; name: string; categoryId: string;
  tagline: string; shortDescription: string; overview: string;
  problem: unknown; solution: string;
  deliverables: unknown; benefits: unknown; tech: unknown;
  relatedServices: unknown; relatedIndustries: unknown;
  faqs: unknown; featured: boolean; iconName: string;
  category?: { slug: string };
}): Service {
  return {
    slug: s.slug, name: s.name, categoryId: s.category?.slug ?? s.categoryId,
    icon: getIcon(s.iconName), tagline: s.tagline, shortDescription: s.shortDescription,
    overview: s.overview,
    problem: (s.problem as string[]) ?? [],
    solution: s.solution,
    deliverables: (s.deliverables as Service["deliverables"]) ?? [],
    benefits: (s.benefits as string[]) ?? [],
    tech: (s.tech as string[]) ?? [],
    relatedServices: (s.relatedServices as string[]) ?? [],
    relatedIndustries: (s.relatedIndustries as string[]) ?? [],
    faqs: s.faqs as { q: string; a: string }[] | undefined,
    featured: s.featured,
  };
}

function mapIndustry(i: {
  id: string; name: string; tagline: string; summary: string;
  challenges: unknown; solutions: unknown; outcomes: unknown;
  imageQuery: string; iconName: string;
}): Industry {
  return {
    id: i.id, name: i.name, icon: getIcon(i.iconName), tagline: i.tagline,
    summary: i.summary,
    challenges: (i.challenges as string[]) ?? [],
    solutions: (i.solutions as string[]) ?? [],
    outcomes: (i.outcomes as string[]) ?? [],
    imageQuery: i.imageQuery,
  };
}

function mapProject(p: {
  id: string; title: string; category: string; industry: string;
  services: unknown; location: string; scope: string; description: string;
  highlights: unknown; imageQuery: string; year: string; featured: boolean;
}): Project {
  return {
    id: p.id, title: p.title, category: p.category, industry: p.industry,
    services: (p.services as string[]) ?? [],
    location: p.location, scope: p.scope, description: p.description,
    highlights: (p.highlights as string[]) ?? [],
    imageQuery: p.imageQuery, year: p.year, featured: p.featured,
  };
}

function mapTestimonial(t: {
  id: string; quote: string; authorRole: string; sector: string;
  rating: number; projectType: string;
}): Testimonial {
  return {
    id: t.id, quote: t.quote, authorRole: t.authorRole, sector: t.sector,
    rating: t.rating, projectType: t.projectType,
  };
}

function mapFaq(f: {
  id: string; category: string; question: string; answer: string;
}): Faq {
  return { id: f.id, category: f.category, question: f.question, answer: f.answer };
}

function mapBlogPost(p: {
  slug: string; title: string; excerpt: string; category: string;
  readTime: string; date: string; author: string; authorRole: string;
  imageQuery: string; content: unknown; tags: unknown; featured: boolean;
}): BlogPost {
  return {
    slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category,
    readTime: p.readTime, date: p.date, author: p.author, authorRole: p.authorRole,
    imageQuery: p.imageQuery,
    content: (p.content as { heading?: string; body: string }[]) ?? [],
    tags: (p.tags as string[]) ?? [],
    featured: p.featured,
  };
}

function mapSolution(s: {
  id: string; name: string; summary: string; description: string;
  components: unknown; outcomes: unknown; bestFor: unknown; iconName: string;
}): Solution {
  return {
    id: s.id, name: s.name, icon: getIcon(s.iconName),
    summary: s.summary, description: s.description,
    components: (s.components as string[]) ?? [],
    outcomes: (s.outcomes as string[]) ?? [],
    bestFor: (s.bestFor as string[]) ?? [],
  };
}
