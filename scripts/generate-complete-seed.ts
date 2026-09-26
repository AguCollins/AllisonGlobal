/**
 * Generates a complete neon-seed.sql file from the Prisma schema DDL
 * + the static seed data. Run with: bun run scripts/generate-complete-seed.ts
 * Output: scripts/neon-seed.sql
 */

import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

// Generate DDL from Prisma schema
console.log("Generating DDL from Prisma schema...");
const ddl = execSync(
  "DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder bunx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
  { encoding: "utf-8" },
);

// Read static seed data
const { serviceCategories, services } = require("../src/lib/data/services");
const { industries } = require("../src/lib/data/industries");
const { projects } = require("../src/lib/data/projects");
const { blogPosts } = require("../src/lib/data/blog");
const { testimonials } = require("../src/lib/data/testimonials");
const { faqs } = require("../src/lib/data/faqs");
const { solutions } = require("../src/lib/data/solutions");
const { company, mainNav, utilityNav, legalNav, values, capabilityStats, guarantees, technologyPlatforms, differentiators } = require("../src/lib/data/company");
const { processSteps } = require("../src/lib/data/process");
const { jobs, careersIntro, careersPerks } = require("../src/lib/data/careers");
const { privacyPolicy, termsAndConditions } = require("../src/lib/data/legal");
const { blogMedia, projectMedia, categoryMedia, industryMedia } = require("../src/lib/data/media");

// Generate bcrypt hash
const bcrypt = require("bcryptjs");
const adminHash = bcrypt.hashSync("Admin@2025", 12);

// Helper: wrap plain text in TipTap JSON doc (for JSONB columns)
function tipTap(text: string): string {
  const escaped = text.replace(/'/g, "''").replace(/\\/g, "\\\\");
  return `{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"${escaped}"}]}]}::jsonb`;
}

function tipTapStr(text: string): string {
  const escaped = text.replace(/'/g, "''").replace(/\\/g, "\\\\");
  return `{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"${escaped}"}]}]}`;
}

function jsonArray(arr: string[]): string {
  const items = arr.map(s => `"${s.replace(/'/g, "''").replace(/\\/g, "\\\\")}"`).join(",");
  return `[${items}]::jsonb`;
}

function jsonArrayStr(arr: string[]): string {
  const items = arr.map(s => `"${s.replace(/'/g, "''").replace(/\\/g, "\\\\")}"`).join(",");
  return `[${items}]`;
}

function jsonStr(obj: unknown): string {
  return JSON.stringify(obj).replace(/'/g, "''");
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function esc(text: string): string {
  return text.replace(/'/g, "''");
}

// Build the complete SQL
let sql = `-- ============================================================
--  ALLISON GLOBAL — COMPLETE NEON SQL SCRIPT (v3)
--  Single file: drops everything, creates all tables (matching
--  prisma/schema.prisma exactly), seeds all content, creates
--  admin user, adds updatedAt triggers.
--
--  HOW TO USE:
--  1. Open your Neon project → SQL Editor
--  2. Paste this entire script
--  3. Run it
--  4. Log in at /admin/login with:
--     Email:    admin@allisonglobal.tech
--     Password: Admin@2025
--  5. CHANGE THE PASSWORD immediately after first login
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════
--  DROP EVERYTHING (clean slate)
-- ═══════════════════════════════════════════════════════════
DROP TABLE IF EXISTS "Lead" CASCADE;
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "Media" CASCADE;
DROP TABLE IF EXISTS "Redirect" CASCADE;
DROP TABLE IF EXISTS "PageContent" CASCADE;
DROP TABLE IF EXISTS "CompanySettings" CASCADE;
DROP TABLE IF EXISTS "Faq" CASCADE;
DROP TABLE IF EXISTS "Testimonial" CASCADE;
DROP TABLE IF EXISTS "BlogPost" CASCADE;
DROP TABLE IF EXISTS "Project" CASCADE;
DROP TABLE IF EXISTS "Service" CASCADE;
DROP TABLE IF EXISTS "Solution" CASCADE;
DROP TABLE IF EXISTS "Industry" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "AdminUser" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
DROP FUNCTION IF EXISTS "set_updated_at"() CASCADE;

-- ═══════════════════════════════════════════════════════════
--  CREATE TABLES & INDEXES (from prisma/schema.prisma)
-- ═══════════════════════════════════════════════════════════

`;

// Add the DDL (skip the first "CREATE SCHEMA" line)
sql += ddl.replace("CREATE SCHEMA IF NOT EXISTS \"public\";", "").trim();

// Add updatedAt trigger
sql += `

-- ═══════════════════════════════════════════════════════════
--  AUTO-UPDATE TRIGGER for updatedAt columns
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION "set_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_AdminUser_updatedAt BEFORE UPDATE ON "AdminUser" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_AuditLog_updatedAt BEFORE UPDATE ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Lead_updatedAt BEFORE UPDATE ON "Lead" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Category_updatedAt BEFORE UPDATE ON "Category" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Service_updatedAt BEFORE UPDATE ON "Service" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Project_updatedAt BEFORE UPDATE ON "Project" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_BlogPost_updatedAt BEFORE UPDATE ON "BlogPost" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Industry_updatedAt BEFORE UPDATE ON "Industry" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Testimonial_updatedAt BEFORE UPDATE ON "Testimonial" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Faq_updatedAt BEFORE UPDATE ON "Faq" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Solution_updatedAt BEFORE UPDATE ON "Solution" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_CompanySettings_updatedAt BEFORE UPDATE ON "CompanySettings" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_PageContent_updatedAt BEFORE UPDATE ON "PageContent" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Redirect_updatedAt BEFORE UPDATE ON "Redirect" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
CREATE TRIGGER update_Media_updatedAt BEFORE UPDATE ON "Media" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

-- ═══════════════════════════════════════════════════════════
--  SEED CONTENT
-- ═══════════════════════════════════════════════════════════

-- SEED: ADMIN USER
-- Email:    admin@allisonglobal.tech
-- Password: Admin@2025
-- ⚠️  CHANGE THIS PASSWORD after first login!
INSERT INTO "AdminUser" ("email", "passwordHash", "name", "role", "active") VALUES
('admin@allisonglobal.tech', '${adminHash}', 'Allison Global Admin', 'superadmin', true)
ON CONFLICT ("email") DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", "name" = EXCLUDED."name", "role" = EXCLUDED."role", "active" = true, "updatedAt" = CURRENT_TIMESTAMP;

-- SEED: CATEGORIES (6)
INSERT INTO "Category" ("id", "slug", "name", "tagline", "description", "iconName", "accent", "imageUrl", "sortOrder") VALUES
`;

// Categories
sql += serviceCategories.map((cat: any, i: number) => {
  const imgUrl = categoryMedia[cat.id as keyof typeof categoryMedia] || null;
  return `('${cat.id}', '${cat.slug}', '${esc(cat.name)}', '${esc(cat.tagline)}', '${tipTapStr(cat.description)}'::jsonb, '${cat.iconName}', '${cat.accent}', ${imgUrl ? `'${imgUrl}'` : 'NULL'}, ${i + 1})`;
}).join(",\n") + "\nON CONFLICT (\"slug\") DO NOTHING;\n";

// Services
sql += `
-- SEED: SERVICES (26)
INSERT INTO "Service" ("slug", "name", "categoryId", "tagline", "shortDescription", "overview", "problem", "solution", "deliverables", "benefits", "tech", "relatedServices", "relatedIndustries", "faqs", "featured", "published", "iconName", "imageUrl", "sortOrder") VALUES
`;
sql += services.map((svc: any, i: number) => {
  const problems = jsonArrayStr(svc.problem || []);
  const deliverables = JSON.stringify(svc.deliverables || []).replace(/'/g, "''");
  const benefits = jsonArrayStr(svc.benefits || []);
  const tech = jsonArrayStr(svc.tech || []);
  const related = jsonArrayStr(svc.relatedServices || []);
  const relatedInd = jsonArrayStr(svc.relatedIndustries || []);
  const faqs = svc.faqs ? JSON.stringify(svc.faqs).replace(/'/g, "''") : null;
  return `('${svc.slug}', '${esc(svc.name)}', '${svc.categoryId}', '${esc(svc.tagline)}', '${esc(svc.shortDescription)}', '${tipTapStr(svc.overview)}'::jsonb, '${problems}'::jsonb, '${tipTapStr(svc.solution)}'::jsonb, '${deliverables}'::jsonb, '${benefits}'::jsonb, '${tech}'::jsonb, '${related}'::jsonb, '${relatedInd}'::jsonb, ${faqs ? `'${faqs}'::jsonb` : 'NULL'}, ${svc.featured || false}, true, '${svc.iconName}', NULL, ${i})`;
}).join(",\n") + "\nON CONFLICT (\"slug\") DO NOTHING;\n";

// Industries
sql += `
-- SEED: INDUSTRIES (13)
INSERT INTO "Industry" ("id", "slug", "name", "tagline", "summary", "challenges", "solutions", "outcomes", "imageQuery", "imageUrl", "iconName", "published", "sortOrder") VALUES
`;
sql += industries.map((ind: any, i: number) => {
  const imgUrl = industryMedia[ind.id as keyof typeof industryMedia] || null;
  const challenges = jsonArrayStr(ind.challenges || []);
  const solutions = jsonArrayStr(ind.solutions || []);
  const outcomes = jsonArrayStr(ind.outcomes || []);
  return `('${ind.id}', '${ind.id}', '${esc(ind.name)}', '${esc(ind.tagline)}', '${tipTapStr(ind.summary)}'::jsonb, '${challenges}'::jsonb, '${solutions}'::jsonb, '${outcomes}'::jsonb, '${esc(ind.imageQuery)}', ${imgUrl ? `'${imgUrl}'` : 'NULL'}, '${ind.iconName}', true, ${i})`;
}).join(",\n") + "\nON CONFLICT (\"slug\") DO NOTHING;\n";

// Projects
sql += `
-- SEED: PROJECTS (9)
INSERT INTO "Project" ("id", "slug", "title", "category", "industry", "services", "location", "scope", "description", "highlights", "gallery", "technologies", "client", "completionDate", "imageQuery", "year", "featured", "published", "sortOrder") VALUES
`;
sql += projects.map((proj: any, i: number) => {
  const slug = slugify(proj.title);
  const services = jsonArrayStr(proj.services || []);
  const highlights = jsonArrayStr(proj.highlights || []);
  const imgUrl = projectMedia[proj.id as keyof typeof projectMedia] || proj.imageQuery;
  return `('${slug}', '${slug}', '${esc(proj.title)}', '${esc(proj.category)}', '${esc(proj.industry)}', '${services}'::jsonb, '${esc(proj.location)}', '${esc(proj.scope)}', '${tipTapStr(proj.description)}'::jsonb, '${highlights}'::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, NULL, '${esc(imgUrl)}', '${esc(proj.year)}', ${proj.featured || false}, true, ${i})`;
}).join(",\n") + "\nON CONFLICT (\"slug\") DO NOTHING;\n";

// Blog Posts
sql += `
-- SEED: BLOG POSTS (6)
INSERT INTO "BlogPost" ("slug", "title", "excerpt", "category", "readTime", "date", "author", "authorRole", "imageQuery", "featuredImage", "content", "tags", "featured", "status") VALUES
`;
sql += blogPosts.map((post: any) => {
  const imgUrl = blogMedia[post.slug as keyof typeof blogMedia] || null;
  const content = JSON.stringify(post.content || []).replace(/'/g, "''");
  const tags = jsonArrayStr(post.tags || []);
  return `('${post.slug}', '${esc(post.title)}', '${esc(post.excerpt)}', '${esc(post.category)}', '${esc(post.readTime)}', '${esc(post.date)}', '${esc(post.author)}', '${esc(post.authorRole)}', '${esc(post.imageQuery)}', ${imgUrl ? `'${imgUrl}'` : 'NULL'}, '${content}'::jsonb, '${tags}'::jsonb, ${post.featured || false}, 'published')`;
}).join(",\n") + "\nON CONFLICT (\"slug\") DO NOTHING;\n";

// Solutions
sql += `
-- SEED: SOLUTIONS (6)
INSERT INTO "Solution" ("id", "slug", "name", "summary", "description", "components", "outcomes", "bestFor", "iconName", "imageUrl", "published", "sortOrder") VALUES
`;
sql += solutions.map((sol: any, i: number) => {
  const slug = slugify(sol.name);
  const components = jsonArrayStr(sol.components || []);
  const outcomes = jsonArrayStr(sol.outcomes || []);
  const bestFor = jsonArrayStr(sol.bestFor || []);
  return `('${slug}', '${slug}', '${esc(sol.name)}', '${tipTapStr(sol.summary)}'::jsonb, '${tipTapStr(sol.description)}'::jsonb, '${components}'::jsonb, '${outcomes}'::jsonb, '${bestFor}'::jsonb, '${sol.iconName}', NULL, true, ${i})`;
}).join(",\n") + "\nON CONFLICT (\"slug\") DO NOTHING;\n";

// Testimonials
sql += `
-- SEED: TESTIMONIALS (8)
INSERT INTO "Testimonial" ("id", "quote", "authorName", "authorRole", "sector", "rating", "projectType", "published", "sortOrder") VALUES
`;
sql += testimonials.map((t: any, i: number) => {
  return `('t${i + 1}', '${tipTapStr(t.quote)}'::jsonb, 'Verified Client', '${esc(t.authorRole)}', '${esc(t.sector)}', ${t.rating}, '${esc(t.projectType)}', true, ${i})`;
}).join(",\n") + "\nON CONFLICT (\"id\") DO NOTHING;\n";

// FAQs
sql += `
-- SEED: FAQs (16)
INSERT INTO "Faq" ("id", "category", "question", "answer", "published", "sortOrder") VALUES
`;
sql += faqs.map((f: any, i: number) => {
  return `('f${i + 1}', '${esc(f.category)}', '${esc(f.question)}', '${tipTapStr(f.answer)}'::jsonb, true, ${i})`;
}).join(",\n") + "\nON CONFLICT (\"id\") DO NOTHING;\n";

// Company Settings
sql += `
-- SEED: COMPANY SETTINGS
INSERT INTO "CompanySettings" ("key", "value") VALUES
('company', '${jsonStr({
  name: company.name, legalName: company.legalName, tagline: company.tagline,
  descriptor: company.descriptor, foundedYear: company.foundedYear,
  foundedLabel: company.foundedLabel, rcNumber: company.rcNumber,
  shortPitch: company.shortPitch, longPitch: company.longPitch,
  location: company.location, contact: company.contact, social: company.social,
  founder: company.founder,
  values: values.map((v: any) => ({ title: v.title, description: v.description, icon: v.icon })),
  capabilityStats,
  guarantees: guarantees.map((g: any) => ({ title: g.title, description: g.description, icon: g.icon })),
  technologyPlatforms,
  differentiators: differentiators.map((d: any) => ({ title: d.title, description: d.description, icon: d.icon })),
})}'::jsonb),
('navigation', '${jsonStr({
  main: mainNav.map((n: any, i: number) => ({ label: n.label, href: n.view === "home" ? "/" : `/${n.view}`, type: n.hasMega ? "dropdown" : "link", visible: true, openInNewTab: false, order: i })),
  utility: utilityNav.map((n: any, i: number) => ({ label: n.label, href: `/${n.view}`, type: "link", visible: true, openInNewTab: false, order: i })),
  legal: legalNav.map((n: any, i: number) => ({ label: n.label, href: `/${n.view}`, type: "link", visible: true, openInNewTab: false, order: i })),
})}'::jsonb),
('process', '${jsonStr(processSteps.map((p: any) => ({
  id: p.id, step: p.step, title: p.title, summary: p.summary,
  description: p.description, iconName: p.icon.name,
  activities: p.activities, deliverable: p.deliverable,
})))}'::jsonb),
('jobs', '${jsonStr(jobs.map((j: any) => ({
  id: j.id, title: j.title, department: j.department, location: j.location,
  type: j.type, summary: j.summary, responsibilities: j.responsibilities,
  requirements: j.requirements, niceToHave: j.niceToHave, published: true,
})))}'::jsonb),
('careers', '${jsonStr({
  intro: careersIntro,
  perks: careersPerks.map((p: any) => ({ title: p.title, description: p.description, iconName: p.icon })),
})}'::jsonb),
('legal_privacy', '${jsonStr(privacyPolicy)}'::jsonb),
('legal_terms', '${jsonStr(termsAndConditions)}'::jsonb),
('stats', '${jsonStr(capabilityStats)}'::jsonb)
ON CONFLICT ("key") DO NOTHING;

-- Done
SELECT 'Seed complete! Login at /admin/login with admin@allisonglobal.tech / Admin@2025' AS result;
`;

writeFileSync("scripts/neon-seed.sql", sql);
console.log("Generated scripts/neon-seed.sql (" + sql.length + " chars)");
