# Allison Global Website — Work Log

This file tracks work performed by the main developer and all subagents.
Each entry starts with `---` and follows the required template.

---
Task ID: F1–F5
Agent: Main Developer (Z.ai)
Task: Build design foundation, data layer, navigation store, shared UI, header/footer, home view, and the page router.

Work Log:
- Created brand theme in globals.css (deep emerald-teal + amber accent, dark ink bands, grid textures, brand/gold tokens, light+dark modes)
- Set up root layout with Sora (display) + Inter (body) + JetBrains Mono fonts, full SEO metadata, next-themes provider, viewport
- Created TypeScript types (`src/lib/types.ts`) covering all entities + ViewId
- Created data layer: company, services (6 categories, 26 services with rich detail), industries (13), process (6 steps), solutions (6), projects (9), testimonials (8), faqs (16), blog (6 posts full content), careers (4 jobs + perks), legal (privacy + terms)
- Built Zustand navigation store (`src/store/site-store.ts`) with view/params + helpers (goService, goIndustry, goQuote, etc.) and scroll-to-top on navigation
- Built shared primitives: Reveal, Stagger, Section, SectionHeader, IconBadge, LogoMark (custom SVG), NavButton, NavLink, PhoneLink
- Built shared sections: PageHero, ConversionPathCTA, StatStrip, ServiceCard, IndustryCard, ProjectCard, BlogCard, ProjectImage (gradient placeholder), TrustLine
- Built Header with utility bar, mega-menu for services, mobile sheet nav, theme toggle
- Built Footer with CTA band, contact, services/industries links, socials, back-to-top button
- Built SiteShell (sticky header + main + sticky footer)
- Built comprehensive HomeView (hero, trust, what-we-do, why-choose-us, process, industries, capability stats, projects, solutions, testimonials, insights, founder note, conversion CTA)
- Wired up `src/app/page.tsx` router with lazy-loaded views + Suspense fallback

Stage Summary:
- Foundation complete and cohesive. Design system + data layer + navigation + home page all in place.
- Remaining 19 views (about, services, service-detail, solutions, industries, industry-detail, projects, process, support, why-choose-us, testimonials, faqs, blog, blog-post, contact, quote, careers, privacy, terms) need to be created as named-export components.
- Shared component APIs available: useSite() store; primitives (Section, SectionHeader, Reveal, Stagger, IconBadge, LogoMark, NavButton, NavLink); sections (PageHero, ConversionPathCTA, StatStrip, ServiceCard, IndustryCard, ProjectCard, BlogCard, ProjectImage, TrustLine); data files in src/lib/data/.

---
Task ID: 5D
Agent: subagent (Privacy/Terms/Support)
Task: Build PrivacyView, TermsView, SupportView

Work Log:
- Read worklog, types, primitives, sections, site-store, legal data, company data, services data, home-view (reference) and globals.css to lock the design system + navigation patterns.
- Built /home/z/my-project/src/components/views/privacy-view.tsx — full legal-prose page: PageHero (eyebrow "Legal", ShieldCheck icon, breadcrumb Home/Privacy Policy), 2-col grid (lg:col-span-2 prose + lg:col-span-1 sticky sidebar). Prose renders privacyPolicy.intro as lead paragraph, each section as <h2> with stable slugified id (`privacy-<slug>`) + body paragraphs at comfortable 1.75 line-height in max-w-3xl. Sticky sidebar card: "Last updated" badge, quick-jump anchor nav with ChevronRight hover affordance, "Questions about privacy?" CTA (NavButton view=contact + mailto). Added "Need to exercise your data rights?" highlighted card with NavButton view=contact. Ended with ConversionPathCTA ("Still have questions?").
- Built /home/z/my-project/src/components/views/terms-view.tsx — same legal-prose architecture mirrored for termsAndConditions data: PageHero (eyebrow "Legal", FileText icon, breadcrumb Home/Terms), intro lead paragraph, sections with `terms-<slug>` ids + quick-jump sidebar, "Unclear on any clause?" CTA card (Scale icon → NavButton view=contact), note about Nigerian governing law in sidebar footer, ConversionPathCTA close.
- Built /home/z/my-project/src/components/views/support-view.tsx — comprehensive Maintenance & Support selling page:
  * PageHero (eyebrow "Maintenance & Support", LifeBuoy icon, breadcrumb Home/Maintenance & Support).
  * "Why maintenance matters" — 4 challenge→response cards (silent degradation/EyeOff, outdated firmware/Cpu, no monitoring/Bug, slow vendor response/TimerReset) in a 2-col grid; each card has a muted IconBadge + Challenge description and an emerald-tinted "Our response" panel with ShieldCheck badge.
  * "What's included" (bg-muted/30) — 6 deliverable cards (Activity, Wrench, Clock, BarChart3, TrendingUp, ShieldCheck) with IconBadge + title + description, hover lift.
  * "Support plans" (band-ink dark with grid-dark overlay + blur orbs) — 3 tiers Essential/Professional/Managed as glassy cards, Professional highlighted with -mt-4 lift, gold "Most popular" Star badge, emerald border. Pricing kept honest ("Custom quote" / "Talk to us", price note "per site, per month"). Each tier has NavButton view=quote subject="Support plan enquiry". Footer links to contact via NavLink for unsure visitors.
  * "What we support" — compact 3-col grid of NavLinks view=services for all 6 service categories (uses cat.icon from serviceCategories), plus a secondary trust list mapping networks/cybersecurity/CCTV/access/fire/IT to brand icons.
  * "Emergency support" (bg-muted/30) — highlighted Card with amber "Emergency support" badge, tel link (company.contact.phoneIntl → phoneDisplay) primary CTA, mailto supportEmail secondary, hours card, managed-clients 24/7 card, and an "active incident" routing note. All phone/email pulled from company.contact.
  * ConversionPathCTA close.
- Removed unused imports (FileText/LucideIcon in privacy, ShieldCheck/LucideIcon in terms, SectionHeader in both legal views) to keep tsc clean.
- Verified with `npx tsc --noEmit`: zero errors in privacy-view.tsx, terms-view.tsx, support-view.tsx. (6 pre-existing errors elsewhere — blog-post-view breadcrumb type, process-view Schematic icon, and example/skills files — are out of scope for this task.)
- Verified page.tsx router already lazy-imports PrivacyView/TermsView/SupportView named exports — wiring is intact.

Stage Summary:
- Files delivered:
  * /home/z/my-project/src/components/views/privacy-view.tsx — export function PrivacyView()
  * /home/z/my-project/src/components/views/terms-view.tsx — export function TermsView()
  * /home/z/my-project/src/components/views/support-view.tsx — export function SupportView()
- Decisions: legal pages use 3-col grid (prose col-span-2 + sticky sidebar col-span-1) with max-w-3xl prose for readability; anchor nav uses slugified section ids with scroll-mt-28 so sticky header doesn't obscure headings; support plan pricing kept as "Custom quote" / "Talk to us" per instructions (no invented ₦ figures); Professional tier visually elevated via negative margin + gold badge + emerald border; emergency card reuses company.contact for phone/hours so it stays in sync with the rest of the site.
- All CTAs route via NavButton/NavLink (no raw <a> for view changes); only tel: and mailto: anchors use native <a>. Mobile responsive (md/lg breakpoints), accessible (aria-labelledby on legal sections, semantic <aside>/<nav>, focusable anchor links).

---
Task ID: 5B
Agent: subagent (Solutions/Testimonials/FAQs)
Task: Build SolutionsView, TestimonialsView, FaqsView

Work Log:
- Read worklog.md, types.ts, primitives.tsx, sections.tsx, site-store.ts, data files (solutions, testimonials, faqs, industries, services, company) and home-view.tsx for style/pattern reference.
- Verified all required lucide-react icons exist (Puzzle, Quote, HelpCircle, Star, ClipboardCheck, PencilRuler, PlugZap, LifeBuoy, MessageSquare, ArrowRight, PhoneCall, CheckCircle2, Target, ShieldCheck).
- Verified all service slugs referenced in solutions.components resolve via serviceMap; all industry ids referenced in solutions.bestFor resolve via industryMap.
- Built /src/components/views/solutions-view.tsx (SolutionsView):
  * PageHero (Puzzle icon, breadcrumb Home / Solutions, full marketing subtitle).
  * Section: 2-column grid of all 6 solutions. Each card has id={`sol-${solution.id}`} (anchor nav), IconBadge (variant brand, size lg) with solution.icon, "N services bundled" pill, name, summary, full description, "What's included" block with each component service rendered as a clickable NavLink (view="service-detail" slug=svc.slug) styled as a small badge, "Outcomes" bullet list with CheckCircle2 brand icons, "Best for" footer chips linking to industry-detail.
  * Section (bg-muted/30) "How solutions are built": 4-step mini explanation (Assess → Design → Integrate → Support) with numbered cards, connecting gradient line on desktop, and a 3-item commitment strip.
  * Section "Not sure which fits?": gradient panel with two CTAs (Talk to an expert → contact, Request a quote → quote).
  * ConversionPathCTA.
- Built /src/components/views/testimonials-view.tsx (TestimonialsView):
  * PageHero (Quote icon, breadcrumb Home / Testimonials, honest representative-feedback subtitle).
  * Section: masonry grid (columns-1 md:columns-2 lg:columns-3, gap-5, items mb-5 break-inside-avoid) of ALL 8 testimonials. Each card: amber star rating, Quote icon, the quote, figcaption with authorRole + sector (resolved via industryMap, clickable NavLink to industry-detail) + projectType. Reveal uses y={0} for opacity-only animation to avoid CSS-columns layout issues.
  * Section (band-ink dark) "By the numbers": StatStrip with testimonialStats (light=true) + 3-item trust strip.
  * Section "Explore by sector": compact 4-col grid of sectors (those referenced by testimonials, fallback to first 8 industries), each a small card with IconBadge outline + name + tagline, NavLink to industry-detail. Includes "All industries" outline button.
  * ConversionPathCTA.
- Built /src/components/views/faqs-view.tsx (FaqsView):
  * PageHero (HelpCircle icon, breadcrumb Home / FAQs).
  * Section: 2-column layout. Left sidebar (sticky on lg) with "Browse by topic" pill buttons for All + 5 faqCategories, each showing a count badge; on lg+ a "Still have questions?" helper card with a tel: link using company.contact.phoneIntl. Right column: shadcn Accordion (type="single" collapsible) with each FAQ as an AccordionItem (question=trigger with HelpCircle icon, answer=content with left padding). Used key={active} on Accordion to reset open-state on filter change. Items have subtle bg-brand/4 highlight when open.
  * Section (bg-muted/30) "Still have questions?": gradient panel with primary gold tel link + hours + two CTAs (Talk to an expert → contact, Request a quote → quote outline).
  * ConversionPathCTA.
- Ran `npx tsc --noEmit` — no TypeScript errors in my 3 files (other pre-existing errors in unrelated files: blog-post-view.tsx, process-view.tsx, skills/, examples/ are not part of this task).
- Ran `npx eslint` on all 3 view files — passed cleanly with no warnings.

Stage Summary:
- Files created:
  1. /home/z/my-project/src/components/views/solutions-view.tsx — export function SolutionsView()
  2. /home/z/my-project/src/components/views/testimonials-view.tsx — export function TestimonialsView()
  3. /home/z/my-project/src/components/views/faqs-view.tsx — export function FaqsView()
- All 3 named exports match the contract expected by /src/app/page.tsx (already wired via dynamic() imports).
- All CTAs use NavButton/NavLink for client-side navigation. No fabricated named clients/awards. Testimonials stay role/sector-based. Brand palette (emerald-teal + gold) used consistently, no indigo/blue. Mobile-responsive, accessible (button elements for nav, aria-pressed on filter pills, semantic figure/figcaption for testimonials, proper heading hierarchy).
- Design decisions worth noting:
  * SolutionsView card is NOT itself a button (the spec offered "or better" — clickable component chips were preferred). Components and "Best for" sector chips are individually clickable NavLinks.
  * TestimonialsView uses CSS columns masonry with opacity-only Reveal (y=0) to avoid framer-motion transform conflicts with column layout.
  * FaqsView uses simple pill buttons rather than shadcn Tabs because they are more compact in a sticky sidebar with counts; the Accordion uses key={active} to reset open-state on filter change.

---
Task ID: 5C
Agent: subagent (Blog/BlogPost/Careers)
Task: Build BlogView, BlogPostView, CareersView

Work Log:
- Read worklog.md, types.ts, primitives.tsx, sections.tsx, site-store.ts, data/blog.ts, data/careers.ts, data/company.ts, home-view.tsx (style reference) and globals.css (brand tokens) before writing any code.
- Confirmed all three target view files (blog-view, blog-post-view, careers-view) currently existed as stubs ("Preparing…" placeholders) and replaced them with full implementations. Confirmed shadcn Accordion, Card, Badge components are available in src/components/ui.
- Widened the `breadcrumb` type on the shared `PageHero` (in sections.tsx) from `{ view?: "home" }[]` to `{ view?: ViewId }[]` so the BlogPostView breadcrumb can link "Insights" back to the blog view (NavLink already accepts any ViewId — this is a strict supertype, fully backwards-compatible with existing callers that pass `view: "home"`). Added the `ViewId` import to sections.tsx.
- Built BlogView (blog-view.tsx): PageHero with BookOpen icon + Home / Insights breadcrumb; a featured post hero card (image + meta + excerpt + Read article NavButton) at the top; a category filter section (All + blogCategories pills driven by React useState, filtering blogPosts in-place via useMemo, with empty-state fallback); the filtered posts rendered inside a <Stagger> grid of <motion.div variants={staggerItem}> wrapping <BlogCard>; a "Topics we cover" muted band with category chips that scroll back to the insights grid when clicked; <ConversionPathCTA /> at the end.
- Built BlogPostView (blog-post-view.tsx): resolves post via getPostBySlug(slug); graceful not-found state with <NavButton view="blog">Back to Insights</NavButton>, a <NavButton view="contact">Talk to an expert</NavButton>, and PhoneLink; PageHero with breadcrumb Home → Insights (view="blog") → post.title, eyebrow = post.category, title = post.title, subtitle = post.excerpt, BookOpen icon; main column (lg:col-span-2) renders ProjectImage at top, an author/meta bar, the post.content blocks (h2 for headings, p for body, prose-style max-w-3xl + leading-relaxed), tags as badges, and an inline "Need this for your site?" CTA card linking to contact + quote; sidebar (lg:col-span-1) is a sticky column (lg:sticky lg:top-24) containing an "About the author" Card, an "Article details" Card (date/readTime/category), and a dark emerald "Need help applying this?" CTA card with a gold NavButton view="contact" + a phone link to +2349152158801; a "Related insights" muted band showing 3 other posts as BlogCards in a <Stagger> grid; <ConversionPathCTA /> at end.
- Built CareersView (careers-view.tsx): PageHero with Users icon, eyebrow "Careers", title "Build a career engineering trust", subtitle = careersIntro, Home / Careers breadcrumb; "Why join Allison Global" section with a <Stagger> grid of the 4 careersPerks (icon map: Cpu, Target, Layers, TrendingUp) wrapped in Cards with hover lift; below it a founder-quote band with 4 capability stats; "Open positions" section (bg-muted/30) listing all 4 jobs as expandable cards — each job card has always-visible header (department badge, type badge, title, summary, location/type/department meta row) plus a CTA <NavButton view="contact" subject={`Application: ${job.title}`}>Apply for this role</NavButton> and a "View details" toggle button that animates a framer-motion height panel revealing three columns: responsibilities (brand checkmarks), requirements (brand checkmarks), and nice-to-have (gold checkmarks with graceful empty-state), followed by a footer bar with another NavButton apply link and a mailto: button; "Don't see your role?" general application band with <NavButton view="contact" subject="General application">Send us your CV</NavButton>, the company email, and a contact card with email/phone/location; <ConversionPathCTA /> at end.
- All CTAs use NavButton/NavLink. No header/footer added. All icons from lucide-react. Brand emerald-teal + gold accent used throughout; no indigo/blue. Dark sections use band-ink + bg-grid-dark per design system. Mobile-first responsive at every breakpoint. framer-motion used for reveal/stagger + the job-card expand animation.
- Verified exports exactly match the contract: blog-view.tsx → `export function BlogView()`; blog-post-view.tsx → `export function BlogPostView({ slug }: { slug?: string })`; careers-view.tsx → `export function CareersView()`.
- Ran `npx tsc --noEmit --skipLibCheck` — the only remaining errors are in unrelated `examples/` and `skills/` directories (socket.io, image-edit, stock-analysis-skill). No errors in src/. Ran `npx eslint` on all 4 modified files — clean (no output).

Stage Summary:
- Files written/modified:
  - /home/z/my-project/src/components/views/blog-view.tsx (full implementation)
  - /home/z/my-project/src/components/views/blog-post-view.tsx (full implementation)
  - /home/z/my-project/src/components/views/careers-view.tsx (full implementation)
  - /home/z/my-project/src/components/site/sections.tsx (small, backwards-compatible type widening on PageHero breadcrumb + ViewId import — required so BlogPostView can link the "Insights" breadcrumb back to the blog view per spec)
- Decisions:
  - Used a custom framer-motion height animation for the job expand/collapse (instead of shadcn Accordion) so the always-visible header (with apply CTA + summary) could remain outside the collapsible region — better UX for a job listing where the primary action should be reachable without expanding.
  - Made the sidebar sticky on lg screens so the "Need help?" CTA remains visible while reading the article.
  - Featured post on BlogView is excluded from the filtered grid to avoid duplication.
  - Kept the not-found state on BlogPostView elegant and actionable: nav back to blog + talk to expert + phone.
- All 3 views are wired into the existing router in /home/z/my-project/src/app/page.tsx (cases for "blog", "blog-post", "careers" already present), so no router changes were needed.

---
Task ID: 5A
Agent: subagent (About/WhyChooseUs/Process)
Task: Build AboutView, WhyChooseUsView, ProcessView

Work Log:
- Read worklog.md, types.ts, primitives.tsx, sections.tsx, site-store.ts, company.ts, process.ts, services.ts, home-view.tsx, globals.css to align with the established design system and visual language
- Replaced placeholder about-view.tsx with a premium AboutView composed of: PageHero (Building2 icon, Home/About breadcrumb, company.longPitch subtitle) → TrustBand (mirrors home TrustLine) → OurStory (2-col narrative + gradient founder mini-card with discipline/location/founded/phone) → WhatWeStandFor (bg-muted/30, 6 company.values via valueIconMap Ruler/Handshake/ShieldCheck/HeartHandshake/BadgeCheck/Globe) → OurApproach (band-ink dark, 4 pillars Assessment-led/Engineering-led/Integration-first/Long-term partnership) → CapabilityAtAGlance (StatStrip of capabilityStats + grid of technologyPlatforms labelled as competency not certified partnerships) → OurCommitments (4 company.guarantees via guaranteeIconMap) → Leadership (founder card + bio + NavButton CTAs) → ConversionPathCTA
- Replaced placeholder why-choose-us-view.tsx with WhyChooseUsView: PageHero (ShieldCheck, Home/Why Choose Us breadcrumb) → Differentiators (8 company.differentiators via differentiatorIconMap Layers/Cpu/Map/Network/Zap/LifeBuoy/Scale/FileCheck) → TheDifference (band-ink dark, two-column comparison: rose X typical-vendor vs emerald check Allison-Global, 5 paired points) → Commitments (same 4 guarantees) → IndustriesCTA (6 IndustryCard from industries data) → ConversionPathCTA
- Replaced placeholder process-view.tsx with ProcessView: PageHero (ClipboardList, Home/Process breadcrumb) → ProcessTimeline (vertical connected timeline, 6 processSteps, each with numeric brand badge + outline IconBadge + brand summary + description + emerald Deliverable highlight + activities checklist on muted right panel, connector line between steps) → WhyThisMatters (bg-muted/30, 3 points: No surprises / Transferable systems / Long-term value) → HandoverDeliverables (6 items: as-built docs, system diagrams, credentials, maintenance schedule, training, support agreement, each with icon) + final CTA card → ConversionPathCTA
- All CTAs use NavButton/NavLink driving client-side navigation (navigate("quote"), navigate("contact"), navigate("process"), navigate("services"), navigate("projects"), navigate("why-choose-us"), navigate("industries"))
- Cleaned up unused imports (CardContent, Card, NavLink, motion, company where unused); verified every lucide icon exists in the installed version (replaced non-existent `Schematic` with `GitBranch` for the "System diagrams" handover item)
- Verified exports match contract: AboutView, WhyChooseUsView, ProcessView
- Ran `npx tsc --noEmit` — zero TypeScript errors in the three new view files (only pre-existing errors in examples/ and skills/ folders remain)
- Ran `npx eslint` on the three files — zero lint errors

Stage Summary:
- Files created (replaced placeholders):
  - /home/z/my-project/src/components/views/about-view.tsx  → export function AboutView()
  - /home/z/my-project/src/components/views/why-choose-us-view.tsx → export function WhyChooseUsView()
  - /home/z/my-project/src/components/views/process-view.tsx → export function ProcessView()
- Key design decisions:
  - About founder mini-card uses a brand gradient panel (mirrors home FounderNote visual) with discipline/location/founded/phone — premium, on-brand, no fabricated credentials
  - Process timeline is alternating 3-col rail + 9-col content card; connector line drawn via absolute span so steps visually flow; each step card splits header/description/deliverable from a muted activities panel for scannability
  - "Why Choose Us" comparison uses rose ✕ for typical-vendor and emerald ✓ for Allison Global on a band-ink dark band, with paired 5-point lists; Allison column has a subtle emerald ring to feel like the premium choice
  - All copy is original Allison Global voice; no fabricated certifications, awards, or named client endorsements; capabilityStats, values, guarantees, differentiators and processSteps used faithfully from data files
  - Technology platforms explicitly framed as "competency — not claimed certified partnerships" per honesty rule
- All three views use only brand (emerald-teal) + gold (amber) + band-ink dark + muted surfaces — no indigo/blue anywhere
- Ready for the page.tsx router to lazy-load these via the existing view registry

---
Task ID: F6–F7
Agent: Main Developer (Z.ai)
Task: Build critical conversion views (Services, Service Detail, Industries, Industry Detail, Projects, Contact, Quote), lead API, wire up router, and perform end-to-end Agent Browser verification.

Work Log:
- Built ServicesView with category filter + search, capability stats, cross-sell (solutions/industries), ConversionPathCTA
- Built ServiceDetailView: rich selling page (hero, overview, problem, solution, deliverables, benefits, process, FAQs, related services cross-sell, related industries, final CTA) — receives slug prop
- Built IndustriesView + IndustryDetailView (challenges, tailored services, outcomes, sector projects)
- Built ProjectsView with category + industry filtering, featured projects, "what every project includes"
- Built ContactView: practical contact form (react-hook-form + zod + sonner toast), 4 contact channels, office hours, coverage, ConversionPathCTA
- Built QuoteView: 5-step structured quote form (contact details, multi-select service chips across categories, site & sector, budget & timeline, project details) with success screen + "what happens next" sidebar
- Created Lead Prisma model + pushed schema; built POST /api/lead route with zod validation + honeypot, persisting to SQLite via Prisma
- Fixed TS type error in primitives.tsx (VariantProps<typeof buttonVariants>)
- Dispatched 4 parallel subagents (5A–5D) for the 12 content views — all completed cleanly
- Bound dev server to 0.0.0.0 and verified via the sandbox gateway (container hostname:81)
- Agent Browser end-to-end verification: confirmed all 20 views render with correct H1 + zero console errors; confirmed desktop nav, mobile menu, mega menu, breadcrumbs, dark-mode toggle, sticky footer all work; confirmed Quote form submission shows success screen AND persists a lead to the DB (verified: [quote] Test Client svc=cctv-installation)

Stage Summary:
- ALL 20 views implemented and verified rendering with no errors.
- Full customer journey works: Home → Services → Service Detail → Quote → submit → success → DB lead persisted.
- Lint: 0 errors, 0 warnings. Dev server serving on :3000 + gateway :81 (HTTP 200).
- Site is complete, cohesive, responsive, accessible, and conversion-ready.
