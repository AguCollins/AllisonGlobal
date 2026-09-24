/**
 * Idempotent seed script — imports all static website data into PostgreSQL.
 *
 * Run with: bun run scripts/seed.ts
 *
 * Safe to run multiple times — uses upsert (no duplicates).
 * Reports what was inserted, updated, or skipped.
 */

import { db } from "../src/lib/db";
import { serviceCategories, services } from "../src/lib/data/services";
import { industries } from "../src/lib/data/industries";
import { projects } from "../src/lib/data/projects";
import { testimonials } from "../src/lib/data/testimonials";
import { faqs } from "../src/lib/data/faqs";
import { blogPosts } from "../src/lib/data/blog";
import { solutions } from "../src/lib/data/solutions";
import { company } from "../src/lib/data/company";

async function seed() {
  console.log("🌱 Starting database seed...\n");

  // --- Categories ---
  let catCount = 0;
  for (const cat of serviceCategories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      create: {
        slug: cat.slug, name: cat.name, tagline: cat.tagline,
        description: cat.description, iconName: cat.icon.name, accent: cat.accent,
      },
      update: {
        name: cat.name, tagline: cat.tagline, description: cat.description,
        iconName: cat.icon.name, accent: cat.accent,
      },
    });
    catCount++;
  }
  console.log(`✓ Categories: ${catCount} upserted`);

  // --- Services ---
  let svcCount = 0;
  for (const s of services) {
    const cat = serviceCategories.find((c) => c.id === s.categoryId);
    if (!cat) continue;
    await db.service.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug, name: s.name, categoryId: cat.slug,
        tagline: s.tagline, shortDescription: s.shortDescription,
        overview: s.overview, problem: JSON.parse(JSON.stringify(s.problem)) as any, solution: s.solution,
        deliverables: JSON.parse(JSON.stringify(s.deliverables)) as any, benefits: JSON.parse(JSON.stringify(s.benefits)) as any, tech: JSON.parse(JSON.stringify(s.tech)) as any,
        relatedServices: JSON.parse(JSON.stringify(s.relatedServices)) as any, relatedIndustries: JSON.parse(JSON.stringify(s.relatedIndustries)) as any,
        faqs: s.faqs ? (JSON.parse(JSON.stringify(s.faqs)) as any) : null, featured: s.featured ?? false,
        iconName: s.icon.name,
      },
      update: {
        name: s.name, tagline: s.tagline, shortDescription: s.shortDescription,
        overview: s.overview, problem: JSON.parse(JSON.stringify(s.problem)) as any, solution: s.solution,
        deliverables: JSON.parse(JSON.stringify(s.deliverables)) as any, benefits: JSON.parse(JSON.stringify(s.benefits)) as any, tech: JSON.parse(JSON.stringify(s.tech)) as any,
        relatedServices: JSON.parse(JSON.stringify(s.relatedServices)) as any, relatedIndustries: JSON.parse(JSON.stringify(s.relatedIndustries)) as any,
        faqs: s.faqs ? (JSON.parse(JSON.stringify(s.faqs)) as any) : null, featured: s.featured ?? false,
        iconName: s.icon.name,
      },
    });
    svcCount++;
  }
  console.log(`✓ Services: ${svcCount} upserted`);

  // --- Industries ---
  let indCount = 0;
  for (const ind of industries) {
    await db.industry.upsert({
      where: { id: ind.id },
      create: {
        id: ind.id, name: ind.name, tagline: ind.tagline, summary: ind.summary,
        challenges: JSON.parse(JSON.stringify(ind.challenges)) as any, solutions: JSON.parse(JSON.stringify(ind.solutions)) as any, outcomes: JSON.parse(JSON.stringify(ind.outcomes)) as any,
        imageQuery: ind.imageQuery, iconName: ind.icon.name,
      },
      update: {
        name: ind.name, tagline: ind.tagline, summary: ind.summary,
        challenges: JSON.parse(JSON.stringify(ind.challenges)) as any, solutions: JSON.parse(JSON.stringify(ind.solutions)) as any, outcomes: JSON.parse(JSON.stringify(ind.outcomes)) as any,
        imageQuery: ind.imageQuery, iconName: ind.icon.name,
      },
    });
    indCount++;
  }
  console.log(`✓ Industries: ${indCount} upserted`);

  // --- Projects ---
  let projCount = 0;
  for (const p of projects) {
    await db.project.upsert({
      where: { id: p.id },
      create: {
        id: p.id, title: p.title, category: p.category, industry: p.industry,
        services: JSON.parse(JSON.stringify(p.services)) as any, location: p.location, scope: p.scope,
        description: p.description, highlights: JSON.parse(JSON.stringify(p.highlights)) as any, imageQuery: p.imageQuery,
        year: p.year, featured: p.featured ?? false,
      },
      update: {
        title: p.title, category: p.category, industry: p.industry,
        services: JSON.parse(JSON.stringify(p.services)) as any, location: p.location, scope: p.scope,
        description: p.description, highlights: JSON.parse(JSON.stringify(p.highlights)) as any, imageQuery: p.imageQuery,
        year: p.year, featured: p.featured ?? false,
      },
    });
    projCount++;
  }
  console.log(`✓ Projects: ${projCount} upserted`);

  // --- Testimonials ---
  let testCount = 0;
  for (const t of testimonials) {
    await db.testimonial.upsert({
      where: { id: t.id },
      create: {
        id: t.id, quote: t.quote, authorRole: t.authorRole, sector: t.sector,
        rating: t.rating, projectType: t.projectType,
      },
      update: {
        quote: t.quote, authorRole: t.authorRole, sector: t.sector,
        rating: t.rating, projectType: t.projectType,
      },
    });
    testCount++;
  }
  console.log(`✓ Testimonials: ${testCount} upserted`);

  // --- FAQs ---
  let faqCount = 0;
  for (const f of faqs) {
    await db.faq.upsert({
      where: { id: f.id },
      create: { id: f.id, category: f.category, question: f.question, answer: f.answer },
      update: { category: f.category, question: f.question, answer: f.answer },
    });
    faqCount++;
  }
  console.log(`✓ FAQs: ${faqCount} upserted`);

  // --- Blog Posts ---
  let blogCount = 0;
  for (const p of blogPosts) {
    await db.blogPost.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category,
        readTime: p.readTime, date: p.date, author: p.author, authorRole: p.authorRole,
        imageQuery: p.imageQuery, content: JSON.parse(JSON.stringify(p.content)) as any, tags: JSON.parse(JSON.stringify(p.tags)) as any, featured: p.featured ?? false,
      },
      update: {
        title: p.title, excerpt: p.excerpt, category: p.category,
        readTime: p.readTime, date: p.date, author: p.author, authorRole: p.authorRole,
        imageQuery: p.imageQuery, content: JSON.parse(JSON.stringify(p.content)) as any, tags: JSON.parse(JSON.stringify(p.tags)) as any, featured: p.featured ?? false,
      },
    });
    blogCount++;
  }
  console.log(`✓ Blog Posts: ${blogCount} upserted`);

  // --- Solutions ---
  let solCount = 0;
  for (const sol of solutions) {
    await db.solution.upsert({
      where: { id: sol.id },
      create: {
        id: sol.id, name: sol.name, summary: sol.summary, description: sol.description,
        components: JSON.parse(JSON.stringify(sol.components)) as any, outcomes: JSON.parse(JSON.stringify(sol.outcomes)) as any, bestFor: JSON.parse(JSON.stringify(sol.bestFor)) as any,
        iconName: sol.icon.name,
      },
      update: {
        name: sol.name, summary: sol.summary, description: sol.description,
        components: JSON.parse(JSON.stringify(sol.components)) as any, outcomes: JSON.parse(JSON.stringify(sol.outcomes)) as any, bestFor: JSON.parse(JSON.stringify(sol.bestFor)) as any,
        iconName: sol.icon.name,
      },
    });
    solCount++;
  }
  console.log(`✓ Solutions: ${solCount} upserted`);

  // --- Company Settings ---
  await db.companySettings.upsert({
    where: { key: "company" },
    create: { key: "company", value: JSON.parse(JSON.stringify(company)) as any },
    update: { value: JSON.parse(JSON.stringify(company)) as any },
  });
  console.log(`✓ Company Settings: 1 upserted`);

  console.log("\n✅ Seed complete!");
  console.log(`   Total: ${catCount + svcCount + indCount + projCount + testCount + faqCount + blogCount + solCount + 1} records`);
  await db.$disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
