/**
 * Dev seed script — populates a local SQLite database from the static
 * TypeScript data files. Used ONLY for local development/verification.
 *
 * Production uses scripts/neon-seed.sql against a Neon PostgreSQL database.
 *
 * Run with: bun run scripts/dev-seed.ts
 */

import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";
import {
  serviceCategories,
  services,
} from "../src/lib/data/services";
import { industries } from "../src/lib/data/industries";
import { projects } from "../src/lib/data/projects";
import { blogPosts } from "../src/lib/data/blog";
import { testimonials } from "../src/lib/data/testimonials";
import { faqs } from "../src/lib/data/faqs";
import { solutions } from "../src/lib/data/solutions";
import { company, mainNav, utilityNav, legalNav } from "../src/lib/data/company";
import { processSteps } from "../src/lib/data/process";
import { jobs, careersIntro, careersPerks } from "../src/lib/data/careers";
import { privacyPolicy, termsAndConditions } from "../src/lib/data/legal";
import { blogMedia, projectMedia, categoryMedia, industryMedia } from "../src/lib/data/media";

// SQLite stores JSON as plain strings — JSON.stringify everything
function j(v: unknown): string {
  return JSON.stringify(v);
}

// Extract the icon name from a LucideIcon component
function iconName(icon: { name?: string; displayName?: string; render?: { name?: string } }): string {
  return icon.displayName || icon.name || (icon.render?.name) || "ShieldCheck";
}

async function seed() {
  console.log("🌱 Seeding local SQLite database...\n");

  // --- AdminUser ---
  const passwordHash = bcrypt.hashSync("Admin@2025", 12);
  await db.adminUser.upsert({
    where: { email: "admin@allisonglobal.tech" },
    create: {
      email: "admin@allisonglobal.tech",
      passwordHash,
      name: "Allison Global Admin",
      role: "superadmin",
      active: true,
    },
    update: { passwordHash, role: "superadmin" },
  });
  console.log("✓ AdminUser (admin@allisonglobal.tech / Admin@2025)");

  // --- Categories ---
  for (const cat of serviceCategories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      create: {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        tagline: cat.tagline,
        description: cat.description,
        iconName: cat.iconName,
        accent: cat.accent,
        sortOrder: 0,
      },
      update: {},
    });
  }
  console.log(`✓ ${serviceCategories.length} Categories`);

  // --- Services ---
  for (const svc of services) {
    await db.service.upsert({
      where: { slug: svc.slug },
      create: {
        slug: svc.slug,
        name: svc.name,
        categoryId: svc.categoryId,
        tagline: svc.tagline,
        shortDescription: svc.shortDescription,
        overview: svc.overview,
        problem: j(svc.problem),
        solution: svc.solution,
        deliverables: j(svc.deliverables),
        benefits: j(svc.benefits),
        tech: j(svc.tech),
        relatedServices: j(svc.relatedServices),
        relatedIndustries: j(svc.relatedIndustries),
        faqs: svc.faqs ? j(svc.faqs) : undefined,
        featured: svc.featured || false,
        published: true,
        iconName: svc.iconName,
        sortOrder: 0,
      },
      update: {},
    });
  }
  console.log(`✓ ${services.length} Services`);

  // --- Industries (use old id as slug) ---
  for (const ind of industries) {
    await db.industry.upsert({
      where: { slug: ind.id },
      create: {
        id: ind.id,
        slug: ind.id,
        name: ind.name,
        tagline: ind.tagline,
        summary: ind.summary,
        challenges: j(ind.challenges),
        solutions: j(ind.solutions),
        outcomes: j(ind.outcomes),
        imageQuery: industryMedia[ind.id as keyof typeof industryMedia] || ind.imageQuery,
        iconName: ind.iconName,
        published: true,
        sortOrder: 0,
      },
      update: {},
    });
  }
  console.log(`✓ ${industries.length} Industries`);

  // --- Projects (generate slug from title) ---
  for (const proj of projects) {
    const slug = proj.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    await db.project.upsert({
      where: { slug },
      create: {
        id: slug,
        slug,
        title: proj.title,
        category: proj.category,
        industry: proj.industry,
        services: j(proj.services),
        location: proj.location,
        scope: proj.scope,
        description: proj.description,
        highlights: j(proj.highlights),
        gallery: j([]),
        technologies: j([]),
        imageQuery: projectMedia[proj.id as keyof typeof projectMedia] || proj.imageQuery,
        year: proj.year,
        featured: proj.featured || false,
        published: true,
        sortOrder: 0,
      },
      update: {},
    });
  }
  console.log(`✓ ${projects.length} Projects`);

  // --- Blog Posts ---
  for (const post of blogPosts) {
    await db.blogPost.upsert({
      where: { slug: post.slug },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        readTime: post.readTime,
        date: post.date,
        author: post.author,
        authorRole: post.authorRole,
        imageQuery: blogMedia[post.slug as keyof typeof blogMedia] || post.imageQuery,
        featuredImage: blogMedia[post.slug as keyof typeof blogMedia] || null,
        content: j(post.content),
        tags: j(post.tags),
        featured: post.featured || false,
        status: "published",
      },
      update: {},
    });
  }
  console.log(`✓ ${blogPosts.length} Blog Posts`);

  // --- Solutions (generate slug from name) ---
  for (const sol of solutions) {
    const slug = sol.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    await db.solution.upsert({
      where: { slug },
      create: {
        id: slug,
        slug,
        name: sol.name,
        summary: sol.summary,
        description: sol.description,
        components: j(sol.components),
        outcomes: j(sol.outcomes),
        bestFor: j(sol.bestFor),
        iconName: sol.iconName,
        published: true,
        sortOrder: 0,
      },
      update: {},
    });
  }
  console.log(`✓ ${solutions.length} Solutions`);

  // --- Testimonials ---
  for (const t of testimonials) {
    await db.testimonial.create({
      data: {
        quote: t.quote,
        authorName: "Verified Client",
        authorRole: t.authorRole,
        sector: t.sector,
        rating: t.rating,
        projectType: t.projectType,
        published: true,
        sortOrder: 0,
      },
    }).catch(() => null);
  }
  console.log(`✓ ${testimonials.length} Testimonials`);

  // --- FAQs ---
  for (const f of faqs) {
    await db.faq.create({
      data: {
        category: f.category,
        question: f.question,
        answer: f.answer,
        published: true,
        sortOrder: 0,
      },
    }).catch(() => null);
  }
  console.log(`✓ ${faqs.length} FAQs`);

  // --- CompanySettings ---
  await db.companySettings.upsert({
    where: { key: "company" },
    create: {
      key: "company",
      value: j({
        name: company.name,
        legalName: company.legalName,
        tagline: company.tagline,
        descriptor: company.descriptor,
        foundedYear: company.foundedYear,
        foundedLabel: company.foundedLabel,
        rcNumber: company.rcNumber,
        shortPitch: company.shortPitch,
        longPitch: company.longPitch,
        location: company.location,
        contact: company.contact,
        social: company.social,
        founder: company.founder,
      }),
    },
    update: {},
  });

  await db.companySettings.upsert({
    where: { key: "navigation" },
    create: {
      key: "navigation",
      value: j({
        main: mainNav.map((n, i) => ({
          label: n.label,
          href: n.view === "home" ? "/" : `/${n.view}`,
          type: n.hasMega ? "dropdown" : "link",
          visible: true,
          openInNewTab: false,
          order: i,
        })),
        utility: utilityNav.map((n, i) => ({
          label: n.label,
          href: `/${n.view}`,
          type: "link",
          visible: true,
          openInNewTab: false,
          order: i,
        })),
        legal: legalNav.map((n, i) => ({
          label: n.label,
          href: `/${n.view}`,
          type: "link",
          visible: true,
          openInNewTab: false,
          order: i,
        })),
      }),
    },
    update: {},
  });

  await db.companySettings.upsert({
    where: { key: "process" },
    create: {
      key: "process",
      value: j(processSteps.map((p) => ({
        id: p.id,
        step: p.step,
        title: p.title,
        summary: p.summary,
        description: p.description,
        iconName: iconName(p.icon),
        activities: p.activities,
        deliverable: p.deliverable,
      }))),
    },
    update: {},
  });

  await db.companySettings.upsert({
    where: { key: "jobs" },
    create: {
      key: "jobs",
      value: j(jobs.map((job) => ({
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        summary: job.summary,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        niceToHave: job.niceToHave,
        published: true,
      }))),
    },
    update: {},
  });

  await db.companySettings.upsert({
    where: { key: "careers" },
    create: {
      key: "careers",
      value: j({
        intro: careersIntro,
        perks: careersPerks.map((p) => ({
          title: p.title,
          description: p.description,
          iconName: p.icon,
        })),
      }),
    },
    update: {},
  });

  await db.companySettings.upsert({
    where: { key: "legal_privacy" },
    create: { key: "legal_privacy", value: j(privacyPolicy) },
    update: {},
  });

  await db.companySettings.upsert({
    where: { key: "legal_terms" },
    create: { key: "legal_terms", value: j(termsAndConditions) },
    update: {},
  });

  console.log("✓ CompanySettings (company, navigation, process, jobs, careers, legal_privacy, legal_terms)");

  console.log("\n✅ Seed complete! Login at /admin/login with admin@allisonglobal.tech / Admin@2025");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
