/**
 * Generator script for neon-seed.sql INSERT statements.
 * Run once: `bun scripts/generate-seed-inserts.ts > /tmp/seed-inserts.sql`
 * Output is consumed by the assembler script.
 */
import {
  company,
  mainNav,
  utilityNav,
  legalNav,
  capabilityStats,
  values,
  guarantees,
  technologyPlatforms,
  differentiators,
} from "../src/lib/data/company";
import { serviceCategories, services } from "../src/lib/data/services";
import { industries } from "../src/lib/data/industries";
import { projects } from "../src/lib/data/projects";
import { blogPosts } from "../src/lib/data/blog";
import { testimonials } from "../src/lib/data/testimonials";
import { faqs } from "../src/lib/data/faqs";
import { solutions } from "../src/lib/data/solutions";
import { processSteps } from "../src/lib/data/process";
import { jobs, careersIntro, careersPerks } from "../src/lib/data/careers";
import { privacyPolicy, termsAndConditions } from "../src/lib/data/legal";

// ─── SQL helpers ──────────────────────────────────────────────────────────

/** Escape a string for SQL single-quoted literal. */
function sqlStr(s: string): string {
  return `'${String(s).replace(/'/g, "''")}'`;
}

/** SQL NULL literal */
const SQL_NULL = "NULL";

/** Convert any value to a JSONB literal: `'...'::jsonb` */
function jsonb(value: unknown): string {
  return `${sqlStr(JSON.stringify(value))}::jsonb`;
}

// ─── Icon name resolution ──────────────────────────────────────────────────
// lucide-react exports each icon under two aliases:
//   1. `LucideNetwork` (the prefixed alias)
//   2. `Network`       (the bare alias — what we want to store)
// Both point to the same component. We PREFER the bare alias because that's
// what the source data files import (e.g. `import { Network } from "lucide-react"`).
// Some icons also have legacy aliases (e.g. `Home` is exported alongside the
// canonical `House`). For those, the first non-`Lucide`-prefixed alias wins,
// which is typically the legacy/short name that matches our source code.
import * as AllIcons from "lucide-react";

const iconRefToName = new Map<unknown, string>();
for (const [key, value] of Object.entries(AllIcons)) {
  // Skip React internal exports
  if (typeof value !== "object" || value === null) continue;
  const existing = iconRefToName.get(value);
  if (existing === undefined) {
    iconRefToName.set(value, key);
    continue;
  }
  // Prefer the non-`Lucide`-prefixed alias.
  const existingHasLucide = existing.startsWith("Lucide");
  const newHasLucide = key.startsWith("Lucide");
  if (existingHasLucide && !newHasLucide) {
    iconRefToName.set(value, key);
  }
}

/** Convert a lucide icon component to its string name (preferring the alias). */
function iconName(icon: unknown): string {
  if (iconRefToName.has(icon)) {
    return iconRefToName.get(icon) as string;
  }
  // Fall back to render.name if we can find it.
  if (icon && typeof icon === "object" && "render" in icon) {
    const render = (icon as { render: { name?: string } }).render;
    if (render && typeof render.name === "string" && render.name) {
      return render.name;
    }
  }
  throw new Error("Could not extract icon name from " + String(icon));
}

/** Slugify a string for use in URLs. */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

// ─── Output buffer ─────────────────────────────────────────────────────────

const out: string[] = [];

function emit(s: string): void {
  out.push(s);
}

// ─── AdminUser ─────────────────────────────────────────────────────────────
// NOTE: the passwordHash placeholder here is overwritten by the assembler
// using the real bcrypt hash generated at runtime.
emit("-- SEED: ADMIN USER");
emit("-- Email:    admin@allisonglobal.tech");
emit("-- Password: Admin@2025");
emit("-- ⚠️  CHANGE THIS PASSWORD after first login!");
emit(
  `INSERT INTO "AdminUser" ("email", "passwordHash", "name", "role", "active") VALUES`,
);
emit(
  `('admin@allisonglobal.tech', '${process.env.ADMIN_HASH ?? "REPLACE_ME"}', 'Allison Global Admin', 'superadmin', true)`,
);
emit(
  `ON CONFLICT ("email") DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", "name" = EXCLUDED."name", "role" = EXCLUDED."role", "active" = true, "updatedAt" = CURRENT_TIMESTAMP;`,
);
emit("");

// ─── Categories ────────────────────────────────────────────────────────────
emit("-- SEED: CATEGORIES (6)");
emit(
  `INSERT INTO "Category" ("id", "slug", "name", "tagline", "description", "iconName", "accent", "sortOrder") VALUES`,
);
const categoryRows = serviceCategories.map((c, i) => {
  return `(${sqlStr(c.slug)}, ${sqlStr(c.slug)}, ${sqlStr(c.name)}, ${sqlStr(c.tagline)}, ${sqlStr(c.description)}, ${sqlStr(c.iconName)}, ${sqlStr(c.accent)}, ${i + 1})`;
});
emit(categoryRows.join(",\n") + ";");
emit("");

// ─── Services ──────────────────────────────────────────────────────────────
emit("-- SEED: SERVICES (" + services.length + ")");
emit(
  `INSERT INTO "Service" ("id", "slug", "name", "categoryId", "tagline", "shortDescription", "overview", "problem", "solution", "deliverables", "benefits", "tech", "relatedServices", "relatedIndustries", "faqs", "featured", "published", "iconName", "sortOrder") VALUES`,
);
const serviceRows = services.map((s, i) => {
  // categoryId must reference Category.id (which we set = slug)
  // Old data uses ids like "network", "cybersecurity" etc — translate to slug
  const cat = serviceCategories.find((c) => c.id === s.categoryId);
  if (!cat) {
    throw new Error(
      `Service ${s.slug} has unknown categoryId ${s.categoryId}`,
    );
  }
  const faqsVal = s.faqs ? jsonb(s.faqs) : SQL_NULL;
  return `(${sqlStr(s.slug)}, ${sqlStr(s.slug)}, ${sqlStr(s.name)}, ${sqlStr(cat.slug)}, ${sqlStr(s.tagline)}, ${sqlStr(s.shortDescription)}, ${sqlStr(s.overview)}, ${jsonb(s.problem)}, ${sqlStr(s.solution)}, ${jsonb(s.deliverables)}, ${jsonb(s.benefits)}, ${jsonb(s.tech)}, ${jsonb(s.relatedServices)}, ${jsonb(s.relatedIndustries)}, ${faqsVal}, ${s.featured ? "true" : "false"}, true, ${sqlStr(s.iconName)}, ${i + 1})`;
});
emit(serviceRows.join(",\n") + ";");
emit("");

// ─── Industries ──────────────────────────────────────────────────────────
// IMPORTANT: id and slug both = old id value (e.g. 'corporate', 'retail')
// so existing /industries/[slug] URLs continue to work.
emit("-- SEED: INDUSTRIES (" + industries.length + ")");
emit(
  `INSERT INTO "Industry" ("id", "slug", "name", "tagline", "summary", "challenges", "solutions", "outcomes", "imageQuery", "iconName", "published", "sortOrder") VALUES`,
);
const industryRows = industries.map((ind, i) => {
  return `(${sqlStr(ind.id)}, ${sqlStr(ind.id)}, ${sqlStr(ind.name)}, ${sqlStr(ind.tagline)}, ${sqlStr(ind.summary)}, ${jsonb(ind.challenges)}, ${jsonb(ind.solutions)}, ${jsonb(ind.outcomes)}, ${sqlStr(ind.imageQuery)}, ${sqlStr(ind.iconName)}, true, ${i + 1})`;
});
emit(industryRows.join(",\n") + ";");
emit("");

// ─── Projects ─────────────────────────────────────────────────────────────
// Generate slug from title; use slug as both id and slug.
emit("-- SEED: PROJECTS (" + projects.length + ")");
emit(
  `INSERT INTO "Project" ("id", "slug", "title", "category", "industry", "services", "location", "scope", "description", "highlights", "gallery", "technologies", "client", "completionDate", "imageQuery", "year", "featured", "published", "sortOrder") VALUES`,
);
const projectRows = projects.map((p, i) => {
  const slug = slugify(p.title);
  return `(${sqlStr(slug)}, ${sqlStr(slug)}, ${sqlStr(p.title)}, ${sqlStr(p.category)}, ${sqlStr(p.industry)}, ${jsonb(p.services)}, ${sqlStr(p.location)}, ${sqlStr(p.scope)}, ${sqlStr(p.description)}, ${jsonb(p.highlights)}, '[]'::jsonb, '[]'::jsonb, ${SQL_NULL}, ${SQL_NULL}, ${sqlStr(p.imageQuery)}, ${sqlStr(p.year)}, ${p.featured ? "true" : "false"}, true, ${i + 1})`;
});
emit(projectRows.join(",\n") + ";");
emit("");

// ─── BlogPosts ────────────────────────────────────────────────────────────
emit("-- SEED: BLOG POSTS (" + blogPosts.length + ")");
emit(
  `INSERT INTO "BlogPost" ("id", "slug", "title", "excerpt", "category", "readTime", "date", "author", "authorRole", "imageQuery", "featuredImage", "content", "tags", "featured", "status", "scheduledAt") VALUES`,
);
const blogRows = blogPosts.map((p) => {
  return `(${sqlStr(p.slug)}, ${sqlStr(p.slug)}, ${sqlStr(p.title)}, ${sqlStr(p.excerpt)}, ${sqlStr(p.category)}, ${sqlStr(p.readTime)}, ${sqlStr(p.date)}, ${sqlStr(p.author)}, ${sqlStr(p.authorRole)}, ${sqlStr(p.imageQuery)}, ${SQL_NULL}, ${jsonb(p.content)}, ${jsonb(p.tags)}, ${p.featured ? "true" : "false"}, 'published', ${SQL_NULL})`;
});
emit(blogRows.join(",\n") + ";");
emit("");

// ─── Solutions ───────────────────────────────────────────────────────────
// Generate slug from name; use slug as id and slug.
emit("-- SEED: SOLUTIONS (" + solutions.length + ")");
emit(
  `INSERT INTO "Solution" ("id", "slug", "name", "summary", "description", "components", "outcomes", "bestFor", "iconName", "published", "sortOrder") VALUES`,
);
const solutionRows = solutions.map((s, i) => {
  const slug = slugify(s.name);
  return `(${sqlStr(slug)}, ${sqlStr(slug)}, ${sqlStr(s.name)}, ${sqlStr(s.summary)}, ${sqlStr(s.description)}, ${jsonb(s.components)}, ${jsonb(s.outcomes)}, ${jsonb(s.bestFor)}, ${sqlStr(s.iconName)}, true, ${i + 1})`;
});
emit(solutionRows.join(",\n") + ";");
emit("");

// ─── Testimonials ────────────────────────────────────────────────────────
emit("-- SEED: TESTIMONIALS (" + testimonials.length + ")");
emit(
  `INSERT INTO "Testimonial" ("id", "quote", "authorName", "authorRole", "sector", "rating", "projectType", "published", "sortOrder") VALUES`,
);
const testimonialRows = testimonials.map((t, i) => {
  return `(${sqlStr(t.id)}, ${sqlStr(t.quote)}, '', ${sqlStr(t.authorRole)}, ${sqlStr(t.sector)}, ${t.rating}, ${sqlStr(t.projectType)}, true, ${i + 1})`;
});
emit(testimonialRows.join(",\n") + ";");
emit("");

// ─── FAQs ─────────────────────────────────────────────────────────────────
emit("-- SEED: FAQS (" + faqs.length + ")");
emit(
  `INSERT INTO "Faq" ("id", "category", "question", "answer", "published", "sortOrder") VALUES`,
);
const faqRows = faqs.map((f, i) => {
  return `(${sqlStr(f.id)}, ${sqlStr(f.category)}, ${sqlStr(f.question)}, ${sqlStr(f.answer)}, true, ${i + 1})`;
});
emit(faqRows.join(",\n") + ";");
emit("");

// ─── CompanySettings ─────────────────────────────────────────────────────
emit("-- SEED: COMPANY SETTINGS");
emit(
  `INSERT INTO "CompanySettings" ("key", "value") VALUES`,
);
const companySettingsRows: string[] = [];

// 'company' — full company object
companySettingsRows.push(`('company', ${jsonb(company)})`);

// 'navigation' — { main, utility, legal }
const navigation = {
  main: mainNav.map((n, i) => ({
    label: n.label,
    href: n.view,
    type: "main",
    visible: true,
    openInNewTab: false,
    order: i,
  })),
  utility: utilityNav.map((n, i) => ({
    label: n.label,
    href: n.view,
    type: "utility",
    visible: true,
    openInNewTab: false,
    order: i,
  })),
  legal: legalNav.map((n, i) => ({
    label: n.label,
    href: n.view,
    type: "legal",
    visible: true,
    openInNewTab: false,
    order: i,
  })),
};
companySettingsRows.push(`('navigation', ${jsonb(navigation)})`);

// 'process' — process steps with iconName extracted
const processPayload = processSteps.map((p) => ({
  id: p.id,
  step: p.step,
  title: p.title,
  summary: p.summary,
  description: p.description,
  iconName: iconName(p.icon),
  activities: p.activities,
  deliverable: p.deliverable,
}));
companySettingsRows.push(`('process', ${jsonb(processPayload)})`);

// 'jobs' — jobs array
const jobsPayload = jobs.map((j) => ({
  id: j.id,
  title: j.title,
  department: j.department,
  location: j.location,
  type: j.type,
  summary: j.summary,
  responsibilities: j.responsibilities,
  requirements: j.requirements,
  niceToHave: j.niceToHave,
  published: true,
}));
companySettingsRows.push(`('jobs', ${jsonb(jobsPayload)})`);

// 'careers' — { intro, perks }
const careersPayload = {
  intro: careersIntro,
  perks: careersPerks,
};
companySettingsRows.push(`('careers', ${jsonb(careersPayload)})`);

// 'legal_privacy'
companySettingsRows.push(`('legal_privacy', ${jsonb(privacyPolicy)})`);

// 'legal_terms'
companySettingsRows.push(`('legal_terms', ${jsonb(termsAndConditions)})`);

// 'stats' — capabilityStats
companySettingsRows.push(`('stats', ${jsonb(capabilityStats)})`);

// 'values' — company values
companySettingsRows.push(`('values', ${jsonb(values)})`);

// 'guarantees' — company guarantees
companySettingsRows.push(`('guarantees', ${jsonb(guarantees)})`);

// 'technologyPlatforms'
companySettingsRows.push(
  `('technologyPlatforms', ${jsonb(technologyPlatforms)})`,
);

// 'differentiators'
companySettingsRows.push(`('differentiators', ${jsonb(differentiators)})`);

emit(companySettingsRows.join(",\n") + ";");
emit("");

// Write to stdout
process.stdout.write(out.join("\n"));
