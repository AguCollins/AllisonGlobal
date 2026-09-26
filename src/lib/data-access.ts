/**
 * Data Access Layer — PostgreSQL is the SINGLE SOURCE OF TRUTH for all
 * editable website content.
 *
 * ARCHITECTURE:
 * - There is NO static fallback. If the database is unavailable, every
 *   reader throws `DatabaseUnavailableError`.
 * - Public route pages call these functions inside `try/catch` and render
 *   an error boundary on failure.
 * - Admin CRUD mutations call `revalidateContent()` to invalidate cached
 *   pages so changes appear on the public site without a redeploy.
 * - The static TypeScript files under `src/lib/seed/` exist ONLY as seed
 *   data for `scripts/seed.ts` and are NOT imported at runtime.
 *
 * If you add a new content type, add:
 *   1. A Prisma model in prisma/schema.prisma
 *   2. A reader function here
 *   3. A field allowlist in src/lib/crud.ts (if admin-editable)
 *   4. A revalidation entry in src/lib/revalidate.ts
 *   5. Seed data in scripts/neon-seed.sql
 */

import { db } from "@/lib/db";
import type {
  Service,
  ServiceCategory,
  Industry,
  Project,
  Testimonial,
  Faq,
  BlogPost,
  Solution,
  Stat,
} from "@/lib/types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for type re-export clarity
import type { ProcessStep, Job } from "@/lib/types";

// ───────────────────────────────────────────────────────────────────────
//  Errors
// ───────────────────────────────────────────────────────────────────────

/** Thrown when the database is required but unreachable. Never swallowed. */
export class DatabaseUnavailableError extends Error {
  constructor(message = "Content database is not available") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

// ───────────────────────────────────────────────────────────────────────
//  DB availability — throws on every miss. No silent fallback.
// ───────────────────────────────────────────────────────────────────────

/**
 * Verify the database is reachable AND has the required tables.
 * Uses a simple Prisma model query (works on both PostgreSQL and SQLite).
 * Throws `DatabaseUnavailableError` if not.
 */
async function requireDb(): Promise<true> {
  try {
    // Probe: query the Service table with a minimal SELECT.
    // If the table doesn't exist, Prisma throws → caught below.
    await db.service.findFirst({ select: { id: true }, take: 1 });
    return true;
  } catch (e) {
    // If the error is "table does not exist", the DB is connected but unseeded
    const msg = e instanceof Error ? e.message : "unknown";
    if (msg.includes("does not exist") || msg.includes("no such table")) {
      throw new DatabaseUnavailableError(
        "Database tables not found. Run scripts/neon-seed.sql (PostgreSQL) or bun run scripts/dev-seed.ts (SQLite).",
      );
    }
    throw new DatabaseUnavailableError(`Cannot connect to database: ${msg.slice(0, 120)}`);
  }
}

// ───────────────────────────────────────────────────────────────────────
//  (getIcon + lucide-react import removed — icons are now resolved
//  client-side via src/components/site/icon.tsx to avoid passing
//  function components across the server→client boundary.)
// ───────────────────────────────────────────────────────────────────────

/**
 * Parse a JSON value that might be stored as a string (SQLite) or already
 * parsed (PostgreSQL). Handles both database backends transparently.
 */
function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Company settings (JSON key/value store)
// ───────────────────────────────────────────────────────────────────────

export interface CompanyInfo {
  name: string;
  legalName: string;
  tagline: string;
  descriptor: string;
  foundedYear: string;
  foundedLabel: string;
  rcNumber: string;
  shortPitch: string;
  longPitch: string;
  location: {
    city: string;
    country: string;
    coverage: string;
    addressLine: string;
  };
  contact: {
    phone: string;
    phoneDisplay: string;
    phoneIntl: string;
    email: string;
    salesEmail: string;
    supportEmail: string;
    whatsapp: string;
    hours: string;
  };
  social: {
    linkedin: string;
    facebook: string;
    instagram: string;
    x: string;
  };
  founder: {
    name: string;
    title: string;
    discipline: string;
    bio: string;
    phone: string;
  };
  values?: { title: string; description: string; icon: string }[];
  capabilityStats?: Stat[];
  guarantees?: { title: string; description: string; icon: string }[];
  technologyPlatforms?: { name: string; domain: string }[];
  differentiators?: { title: string; description: string; icon: string }[];
}

/** Default company shape — used to merge partial DB values. */
const COMPANY_DEFAULTS: CompanyInfo = {
  name: "Allison Global",
  legalName: "Allison Global Ltd",
  tagline: "Technology without limits.",
  descriptor: "ICT, Networking, Cybersecurity & Electronic Security Solutions",
  foundedYear: "2025",
  foundedLabel: "Established October 2025",
  rcNumber: "RC: 8939118",
  shortPitch: "A Nigerian technology and security solutions partner.",
  longPitch: "Allison Global Ltd is a technology and security solutions partner.",
  location: {
    city: "Lagos",
    country: "Nigeria",
    coverage: "Headquartered in Lagos, delivering projects nationwide.",
    addressLine: "Lagos, Nigeria",
  },
  contact: {
    phone: "09152158801",
    phoneDisplay: "+234 915 215 8801",
    phoneIntl: "+2349152158801",
    email: "hello@allisonglobal.tech",
    salesEmail: "sales@allisonglobal.tech",
    supportEmail: "support@allisonglobal.tech",
    whatsapp: "2349152158801",
    hours: "Mon–Sat: 8:00am – 6:00pm · Emergency support 24/7",
  },
  social: { linkedin: "#", facebook: "#", instagram: "#", x: "#" },
  founder: {
    name: "Agu Chisom Alvin",
    title: "Founder & Chief Executive Officer",
    discipline: "Electrical & Electronics Engineer",
    bio: "Agu Chisom Alvin is an Electrical & Electronics Engineer who founded Allison Global Ltd in October 2025.",
    phone: "09152158801",
  },
};

function deepMerge<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;
  if (typeof base !== "object" || base === null) {
    return (override as T) ?? base;
  }
  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as T;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  const ov = override as Record<string, unknown>;
  for (const key of Object.keys(ov)) {
    if (
      typeof out[key] === "object" &&
      out[key] !== null &&
      !Array.isArray(out[key]) &&
      typeof ov[key] === "object" &&
      ov[key] !== null
    ) {
      out[key] = deepMerge(out[key], ov[key]);
    } else {
      out[key] = ov[key];
    }
  }
  return out as T;
}

export async function getCompany(): Promise<CompanyInfo> {
  await requireDb();
  // The admin settings page writes to 6 separate keys:
  // company, contact, social, founder, footer, stats.
  // We merge them all into a single CompanyInfo object.
  const [companyRow, contactRow, socialRow, founderRow] = await Promise.all([
    db.companySettings.findUnique({ where: { key: "company" } }),
    db.companySettings.findUnique({ where: { key: "contact" } }),
    db.companySettings.findUnique({ where: { key: "social" } }),
    db.companySettings.findUnique({ where: { key: "founder" } }),
  ]);

  const companyData = parseJson<Record<string, unknown> | null>(companyRow?.value, null);
  const contactData = parseJson<Record<string, unknown> | null>(contactRow?.value, null);
  const socialData = parseJson<Record<string, unknown> | null>(socialRow?.value, null);
  const founderData = parseJson<Record<string, unknown> | null>(founderRow?.value, null);

  // Start with defaults, then overlay the legacy "company" blob (which may
  // contain nested contact/social/founder), then overlay the granular keys.
  let merged: CompanyInfo = COMPANY_DEFAULTS;
  if (companyData) {
    merged = deepMerge(merged, companyData);
  }
  if (contactData) {
    merged = deepMerge(merged, { contact: contactData });
  }
  if (socialData) {
    merged = deepMerge(merged, { social: socialData });
  }
  if (founderData) {
    merged = deepMerge(merged, { founder: founderData });
  }
  return merged;
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Navigation
// ───────────────────────────────────────────────────────────────────────

export interface NavItem {
  id?: string;
  label: string;
  href: string;
  type: "link" | "dropdown" | "cta";
  visible: boolean;
  openInNewTab: boolean;
  order: number;
  children?: NavItem[];
}

const NAV_DEFAULTS: { main: NavItem[]; utility: NavItem[]; legal: NavItem[] } = {
  main: [
    { label: "Home", href: "/", type: "link", visible: true, openInNewTab: false, order: 0 },
    { label: "About", href: "/about", type: "link", visible: true, openInNewTab: false, order: 1 },
    { label: "Services", href: "/services", type: "dropdown", visible: true, openInNewTab: false, order: 2 },
    { label: "Solutions", href: "/solutions", type: "link", visible: true, openInNewTab: false, order: 3 },
    { label: "Industries", href: "/industries", type: "link", visible: true, openInNewTab: false, order: 4 },
    { label: "Projects", href: "/projects", type: "link", visible: true, openInNewTab: false, order: 5 },
    { label: "Insights", href: "/blog", type: "link", visible: true, openInNewTab: false, order: 6 },
    { label: "Contact", href: "/contact", type: "link", visible: true, openInNewTab: false, order: 7 },
  ],
  utility: [
    { label: "Our Process", href: "/process", type: "link", visible: true, openInNewTab: false, order: 0 },
    { label: "Why Choose Us", href: "/why-choose-us", type: "link", visible: true, openInNewTab: false, order: 1 },
    { label: "Maintenance & Support", href: "/support", type: "link", visible: true, openInNewTab: false, order: 2 },
    { label: "Testimonials", href: "/testimonials", type: "link", visible: true, openInNewTab: false, order: 3 },
    { label: "FAQs", href: "/faqs", type: "link", visible: true, openInNewTab: false, order: 4 },
    { label: "Careers", href: "/careers", type: "link", visible: true, openInNewTab: false, order: 5 },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy", type: "link", visible: true, openInNewTab: false, order: 0 },
    { label: "Terms & Conditions", href: "/terms", type: "link", visible: true, openInNewTab: false, order: 1 },
  ],
};

export async function getNavigation(): Promise<{ main: NavItem[]; utility: NavItem[]; legal: NavItem[] }> {
  await requireDb();
  const settings = await db.companySettings.findUnique({ where: { key: "navigation" } });
  if (!settings) return NAV_DEFAULTS;
  const value = parseJson<{ main?: NavItem[]; utility?: NavItem[]; legal?: NavItem[] }>(settings.value, {});

  // Normalize hrefs — fix legacy "home" → "/" and ensure all hrefs start with "/"
  const normalize = (items: NavItem[]): NavItem[] =>
    items.map((item) => ({
      ...item,
      href: item.href === "home" ? "/" : item.href.startsWith("/") || item.href.startsWith("http") ? item.href : `/${item.href}`,
    }));

  return {
    main: normalize(value.main?.length ? value.main : NAV_DEFAULTS.main),
    utility: normalize(value.utility?.length ? value.utility : NAV_DEFAULTS.utility),
    legal: normalize(value.legal?.length ? value.legal : NAV_DEFAULTS.legal),
  };
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: CTAs
// ───────────────────────────────────────────────────────────────────────

export interface CtaConfig {
  id?: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  theme: "brand" | "ink" | "light" | "amber";
  visible: boolean;
}

const CTA_DEFAULTS: CtaConfig[] = [
  {
    title: "Ready to secure and connect your site?",
    description: "Book a site assessment with our engineering team. We'll assess your needs and design a solution that fits — no obligation, no upselling.",
    primaryLabel: "Request a Quote",
    primaryHref: "/quote",
    secondaryLabel: "Talk to an Engineer",
    secondaryHref: "/contact",
    theme: "brand",
    visible: true,
  },
];

export async function getCtas(): Promise<CtaConfig[]> {
  await requireDb();
  const settings = await db.companySettings.findUnique({ where: { key: "ctas" } });
  if (!settings) return CTA_DEFAULTS;
  const list = parseJson<CtaConfig[]>(settings.value, []);
  return Array.isArray(list) && list.length ? list : CTA_DEFAULTS;
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Process steps
// ───────────────────────────────────────────────────────────────────────

export interface ProcessStepRecord {
  id: string;
  step: number;
  title: string;
  summary: string;
  description: string;
  iconName: string;
  activities: string[];
  deliverable: string;
}

export async function getProcessSteps(): Promise<ProcessStepRecord[]> {
  await requireDb();
  const settings = await db.companySettings.findUnique({ where: { key: "process" } });
  if (!settings) return [];
  const list = parseJson<ProcessStepRecord[]>(settings.value, []);
  return Array.isArray(list) ? list.sort((a, b) => a.step - b.step) : [];
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Jobs / Careers
// ───────────────────────────────────────────────────────────────────────

export interface JobRecord {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
  published: boolean;
}

export interface CareersContent {
  intro: string;
  perks: { title: string; description: string; iconName: string }[];
  jobs: JobRecord[];
}

const CAREERS_DEFAULTS: { intro: string; perks: { title: string; description: string; iconName: string }[] } = {
  intro:
    "Allison Global is an engineering-led technology and security solutions partner. We're building a team that takes ownership of outcomes — engineers, technicians and consultants who treat every client's systems as their own.",
  perks: [
    { title: "Engineering-led culture", description: "Work alongside an Electrical & Electronics Engineer.", iconName: "Cpu" },
    { title: "Real ownership", description: "Take ownership of projects end-to-end.", iconName: "Target" },
    { title: "Diverse engagements", description: "Work across networking, cybersecurity, surveillance, access control and IT.", iconName: "Layers" },
    { title: "Continuous growth", description: "We invest in training and exposure to enterprise-grade technologies.", iconName: "TrendingUp" },
  ],
};

export async function getCareers(): Promise<CareersContent> {
  await requireDb();
  const [jobsSettings, careersSettings] = await Promise.all([
    db.companySettings.findUnique({ where: { key: "jobs" } }),
    db.companySettings.findUnique({ where: { key: "careers" } }),
  ]);
  const jobs = jobsSettings ? parseJson<JobRecord[]>(jobsSettings.value, []) : [];
  const meta = parseJson<{ intro?: string; perks?: { title: string; description: string; iconName: string }[] } | null>(careersSettings?.value, null);
  return {
    intro: meta?.intro ?? CAREERS_DEFAULTS.intro,
    perks: meta?.perks ?? CAREERS_DEFAULTS.perks,
    jobs: Array.isArray(jobs) ? jobs.filter((j) => j.published) : [],
  };
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Legal documents
// ───────────────────────────────────────────────────────────────────────

export interface LegalDocument {
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}

export async function getLegalPrivacy(): Promise<LegalDocument | null> {
  await requireDb();
  const settings = await db.companySettings.findUnique({ where: { key: "legal_privacy" } });
  if (!settings) return null;
  return parseJson<LegalDocument>(settings.value, null as unknown as LegalDocument);
}

export async function getLegalTerms(): Promise<LegalDocument | null> {
  await requireDb();
  const settings = await db.companySettings.findUnique({ where: { key: "legal_terms" } });
  if (!settings) return null;
  return parseJson<LegalDocument>(settings.value, null as unknown as LegalDocument);
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Stats
// ───────────────────────────────────────────────────────────────────────

export async function getStats(): Promise<Stat[]> {
  await requireDb();
  const settings = await db.companySettings.findUnique({ where: { key: "stats" } });
  if (!settings) return [];
  return parseJson<Stat[]>(settings.value, []);
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Categories
// ───────────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<ServiceCategory[]> {
  await requireDb();
  const cats = await db.category.findMany({ orderBy: { sortOrder: "asc" } });
  return cats.map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<ServiceCategory | undefined> {
  await requireDb();
  const cat = await db.category.findUnique({ where: { slug } });
  return cat ? mapCategory(cat) : undefined;
}

function mapCategory(c: {
  id: string; slug: string; name: string; tagline: string; description: unknown;
  iconName: string; accent: string; imageUrl?: string | null;
}): ServiceCategory {
  return {
    id: c.slug, slug: c.slug, name: c.name, tagline: c.tagline,
    description: parseJson<string>(c.description, "") || String(c.description || ""),
    iconName: c.iconName, accent: c.accent,
    services: [],
  };
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Services
// ───────────────────────────────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  await requireDb();
  const svcs = await db.service.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { category: true },
  });
  return svcs.map(mapService);
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  await requireDb();
  const svc = await db.service.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!svc || !svc.published) return undefined;
  return mapService(svc);
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

/** Admin-facing list (includes unpublished drafts). */
export async function getAllServicesForAdmin(): Promise<Service[]> {
  await requireDb();
  const svcs = await db.service.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { category: true },
  });
  return svcs.map(mapService);
}

function mapService(s: {
  id: string; slug: string; name: string; categoryId: string;
  tagline: string; shortDescription: string; overview: unknown;
  problem: unknown; solution: unknown;
  deliverables: unknown; benefits: unknown; tech: unknown;
  relatedServices: unknown; relatedIndustries: unknown;
  faqs: unknown; featured: boolean; published: boolean; iconName: string;
  imageUrl?: string | null;
  category?: { slug: string };
}): Service {
  return {
    slug: s.slug, name: s.name, categoryId: s.category?.slug ?? s.categoryId,
    iconName: s.iconName, tagline: s.tagline, shortDescription: s.shortDescription,
    overview: parseJson<unknown>(s.overview, s.overview),
    problem: parseJson<string[]>(s.problem, []),
    solution: parseJson<unknown>(s.solution, s.solution),
    deliverables: parseJson<Service["deliverables"]>(s.deliverables, []),
    benefits: parseJson<string[]>(s.benefits, []),
    tech: parseJson<string[]>(s.tech, []),
    relatedServices: parseJson<string[]>(s.relatedServices, []),
    relatedIndustries: parseJson<string[]>(s.relatedIndustries, []),
    faqs: parseJson<{ q: string; a: string }[] | null>(s.faqs, null) ?? undefined,
    featured: s.featured,
  };
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Industries
// ───────────────────────────────────────────────────────────────────────

export async function getIndustries(): Promise<Industry[]> {
  await requireDb();
  const inds = await db.industry.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return inds.map(mapIndustry);
}

export async function getIndustryBySlug(slug: string): Promise<Industry | undefined> {
  await requireDb();
  const ind = await db.industry.findUnique({ where: { slug } });
  if (!ind || !ind.published) return undefined;
  return mapIndustry(ind);
}

/** Backwards-compat: lookup by id (slug and id are interchangeable post-migration). */
export async function getIndustryById(idOrSlug: string): Promise<Industry | undefined> {
  return getIndustryBySlug(idOrSlug);
}

function mapIndustry(i: {
  id: string; slug: string; name: string; tagline: string; summary: unknown;
  challenges: unknown; solutions: unknown; outcomes: unknown;
  imageQuery: string; imageUrl?: string | null; iconName: string;
}): Industry {
  return {
    id: i.slug,
    name: i.name, iconName: i.iconName, tagline: i.tagline,
    summary: parseJson<unknown>(i.summary, i.summary),
    challenges: parseJson<string[]>(i.challenges, []),
    solutions: parseJson<string[]>(i.solutions, []),
    outcomes: parseJson<string[]>(i.outcomes, []),
    imageQuery: i.imageUrl || i.imageQuery,
  };
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Projects
// ───────────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  await requireDb();
  const projs = await db.project.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
  return projs.map(mapProject);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const all = await getProjects();
  return all.filter((p) => p.featured);
}

export async function getProjectsByIndustry(industryId: string): Promise<Project[]> {
  const all = await getProjects();
  return all.filter((p) => p.industry === industryId);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  await requireDb();
  const proj = await db.project.findUnique({ where: { slug } });
  if (!proj || !proj.published) return undefined;
  return mapProject(proj);
}

function mapProject(p: {
  id: string; slug: string; title: string; category: string; industry: string;
  services: unknown; location: string; scope: string; description: unknown;
  highlights: unknown; imageQuery: string; year: string; featured: boolean;
}): Project {
  return {
    id: p.slug,
    title: p.title, category: p.category, industry: p.industry,
    services: parseJson<string[]>(p.services, []),
    location: p.location, scope: p.scope,
    description: parseJson<unknown>(p.description, p.description),
    highlights: parseJson<string[]>(p.highlights, []),
    imageQuery: p.imageQuery, year: p.year, featured: p.featured,
  };
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Testimonials
// ───────────────────────────────────────────────────────────────────────

export async function getTestimonials(): Promise<Testimonial[]> {
  await requireDb();
  const tests = await db.testimonial.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return tests.map(mapTestimonial);
}

function mapTestimonial(t: {
  id: string; quote: unknown; authorName: string | null; authorRole: string; sector: string;
  rating: number; projectType: string;
}): Testimonial {
  return {
    id: t.id, quote: parseJson<unknown>(t.quote, t.quote) as string,
    authorName: t.authorName || "Verified Client",
    authorRole: t.authorRole, sector: t.sector,
    rating: t.rating, projectType: t.projectType,
  };
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: FAQs
// ───────────────────────────────────────────────────────────────────────

export async function getFaqs(): Promise<Faq[]> {
  await requireDb();
  const faqs = await db.faq.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return faqs.map(mapFaq);
}

function mapFaq(f: {
  id: string; category: string; question: string; answer: unknown;
}): Faq {
  return {
    id: f.id, category: f.category, question: f.question,
    answer: parseJson<unknown>(f.answer, f.answer) as string,
  };
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Blog posts
// ───────────────────────────────────────────────────────────────────────

export interface BlogBlock {
  type: "paragraph" | "h2" | "h3" | "h4" | "ul" | "ol" | "quote" | "image" | "callout" | "divider" | "code";
  text?: string;
  items?: string[];
  src?: string;
  alt?: string;
  caption?: string;
  variant?: "info" | "warning" | "success";
  level?: number;
}

export interface BlogPostWithMeta extends BlogPost {
  status: string;
  scheduledAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noindex: boolean;
  nofollow: boolean;
  featuredImage?: string | null;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  await requireDb();
  const now = new Date().toISOString();
  const posts = await db.blogPost.findMany({
    where: {
      OR: [
        { status: "published" },
        { status: "scheduled", scheduledAt: { lte: now } },
      ],
    },
    orderBy: { date: "desc" },
  });
  return posts.map(mapBlogPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  await requireDb();
  const now = new Date().toISOString();
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) return undefined;
  // Public users only see published or due-scheduled posts
  if (post.status !== "published" && !(post.status === "scheduled" && post.scheduledAt && post.scheduledAt.toISOString() <= now)) {
    return undefined;
  }
  return mapBlogPost(post);
}

/** Admin-facing: returns full metadata including SEO + status fields. */
export async function getBlogPostForAdmin(slug: string): Promise<BlogPostWithMeta | undefined> {
  await requireDb();
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) return undefined;
  return {
    ...mapBlogPost(post),
    status: post.status,
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    ogTitle: post.ogTitle,
    ogDescription: post.ogDescription,
    ogImage: post.ogImage,
    canonicalUrl: post.canonicalUrl,
    noindex: post.noindex,
    nofollow: post.nofollow,
    featuredImage: post.featuredImage,
  };
}

function mapBlogPost(p: {
  slug: string; title: string; excerpt: string; category: string;
  readTime: string; date: string; author: string; authorRole: string;
  imageQuery: string; featuredImage?: string | null;
  content: unknown; tags: unknown; featured: boolean;
}): BlogPost {
  // Content can be:
  // - TipTap JSON doc: { type: "doc", content: [...] } (new WYSIWYG format)
  // - BlogBlock[]: [{ type: "paragraph", text: "..." }] (old block editor)
  // - Legacy: [{ heading?, body }] (original format)
  // Pass through as-is — the BlogBlockRenderer auto-detects the format.
  const raw = parseJson<unknown>(p.content, []);
  return {
    slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category,
    readTime: p.readTime, date: p.date, author: p.author, authorRole: p.authorRole,
    imageQuery: p.featuredImage || p.imageQuery,
    content: (Array.isArray(raw) ? raw : [raw].filter(Boolean)) as BlogPost["content"],
    tags: parseJson<string[]>(p.tags, []),
    featured: p.featured,
  };
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Solutions
// ───────────────────────────────────────────────────────────────────────

export async function getSolutions(): Promise<Solution[]> {
  await requireDb();
  const sols = await db.solution.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return sols.map(mapSolution);
}

export async function getSolutionBySlug(slug: string): Promise<Solution | undefined> {
  await requireDb();
  const sol = await db.solution.findUnique({ where: { slug } });
  if (!sol || !sol.published) return undefined;
  return mapSolution(sol);
}

function mapSolution(s: {
  id: string; slug: string; name: string; summary: unknown; description: unknown;
  components: unknown; outcomes: unknown; bestFor: unknown; iconName: string;
}): Solution {
  return {
    id: s.slug, // use slug as public id
    name: s.name, iconName: s.iconName,
    summary: parseJson<unknown>(s.summary, s.summary) as string,
    description: parseJson<unknown>(s.description, s.description) as string,
    components: parseJson<string[]>(s.components, []),
    outcomes: parseJson<string[]>(s.outcomes, []),
    bestFor: parseJson<string[]>(s.bestFor, []),
  };
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Redirects
// ───────────────────────────────────────────────────────────────────────

export async function getRedirects(): Promise<{ from: string; to: string; type: number }[]> {
  await requireDb();
  const redirects = await db.redirect.findMany();
  return redirects.map((r) => ({ from: r.from, to: r.to, type: r.type }));
}

export async function getRedirectForPath(path: string): Promise<{ to: string; type: number } | null> {
  await requireDb();
  const r = await db.redirect.findUnique({ where: { from: path } });
  if (!r) return null;
  return { to: r.to, type: r.type };
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Media
// ───────────────────────────────────────────────────────────────────────

export async function getMedia(category?: string): Promise<MediaRecord[]> {
  await requireDb();
  const items = await db.media.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return items.map((m) => ({
    id: m.id, url: m.url, filename: m.filename, mimeType: m.mimeType,
    size: m.size, width: m.width, height: m.height,
    altText: m.altText, caption: m.caption, category: m.category,
    createdAt: m.createdAt.toISOString(),
  }));
}

export interface MediaRecord {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  altText: string;
  caption?: string | null;
  category: string;
  createdAt: string;
}

// ───────────────────────────────────────────────────────────────────────
//  Public content type: Page content (hero text, page sections)
// ───────────────────────────────────────────────────────────────────────

export interface PageHero {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export interface PageSectionRecord {
  id: string;
  type: string; // "text" | "stats" | "service-grid" | "project-grid" | etc.
  title?: string;
  subtitle?: string;
  content?: string;
  image?: string;
  cta?: { label: string; href: string };
  order: number;
  visible: boolean;
  theme?: string;
}

export interface PageContentRecord {
  page: string;
  title?: string | null;
  metaDescription?: string | null;
  hero?: PageHero | null;
  sections?: PageSectionRecord[] | null;
}

export async function getPageContent(page: string): Promise<PageContentRecord | null> {
  await requireDb();
  const record = await db.pageContent.findUnique({ where: { page } });
  if (!record) return null;
  return {
    page: record.page,
    title: record.title,
    metaDescription: record.metaDescription,
    hero: record.hero as PageHero | null,
    sections: record.sections as PageSectionRecord[] | null,
  };
}
