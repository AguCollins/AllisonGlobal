"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  PhoneCall,
  ShieldCheck,
  Network,
  Lock,
  Camera,
  Fingerprint,
  Flame,
  ServerCog,
  Quote,
  Star,
  ChevronRight,
  Cpu,
  Layers,
  Map as MapIcon,
  Zap,
  LifeBuoy,
  Scale,
  FileCheck,
} from "lucide-react";
import { href } from "@/lib/nav";
import { media } from "@/lib/data/media";
import {
  Section,
  SectionHeader,
  Reveal,
  Stagger,
  staggerItem,
  IconBadge,
  NavButton,
  NavLink,
} from "@/components/site/primitives";
import {
  ConversionPathCTA,
  StatStrip,
  IndustryCard,
  ProjectCard,
  BlogCard,
  TrustLine,
} from "@/components/site/sections";
import { RemoteImage } from "@/components/site/sections";
import { motion } from "framer-motion";
import {
  company,
  capabilityStats,
  differentiators,
  technologyPlatforms,
} from "@/lib/data/company";
import { serviceCategories, services } from "@/lib/data/services";
import { industries } from "@/lib/data/industries";
import { projects } from "@/lib/data/projects";
import { projectMedia, categoryMedia, blogMedia } from "@/lib/data/media";
import { processSteps } from "@/lib/data/process";
import { testimonials } from "@/lib/data/testimonials";
import { blogPosts } from "@/lib/data/blog";
import { industryMap } from "@/lib/data/industries";

const valueIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers, Cpu, MapIcon, Network, Zap, LifeBuoy, Scale, FileCheck,
};

export function HomeView() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <WhatWeDo />
      <WhyChooseUs />
      <ProcessPreview />
      <IndustriesPreview />
      <CapabilityStats />
      <ProjectsPreview />
      <SolutionsPreview />
      <TestimonialsPreview />
      <InsightsPreview />
      <FounderNote />
      <ConversionPathCTA />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero — sharp contrast: dark typography zone (left) + image (right) */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative overflow-hidden band-ink">
      {/* Right-side product imagery + ambient video. Left side darkened for
          high-contrast typography; right side shows the moving infrastructure. */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={media.industryLeading}
          className="size-full object-cover"
          aria-hidden="true"
        >
          <source src={media.videoRack} type="video/mp4" />
        </video>
        {/* Deliberate L→R gradient: dark on the left for text, transparent right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.16_0.03_235)] via-[oklch(0.16_0.03_235/0.85)] to-[oklch(0.16_0.03_235/0.45)]" />
        {/* subtle bottom fade for the stats row legibility */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[oklch(0.16_0.03_235)] to-transparent" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pb-20 lg:pt-16">
        {/* Left — typography zone (dark, high contrast) */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            ICT &amp; security partner · Lagos, Nigeria
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-balance text-4xl font-bold leading-[1.08] text-white drop-shadow-sm sm:text-5xl lg:text-[3.4rem] xl:text-[3.7rem]"
          >
            Networks, security &amp; surveillance —{" "}
            <span className="text-brand">engineered as one.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-white/85"
          >
            We design, install and maintain ICT, cybersecurity, CCTV, access
            control, fire safety and IT infrastructure — under one accountable
            engineering team.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button_primary href={href("quote")}>
              Request a Quote
              <ArrowRight className="size-4" />
            </Button_primary>
            <Button_secondary href={href("contact")}>
              <PhoneCall className="size-4" />
              Talk to an Expert
            </Button_secondary>
          </motion.div>

          {/* Dominant stat proof points — strong contrast, scannable */}
          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4"
          >
            {[
              { v: "6", l: "Service domains" },
              { v: "24+", l: "Specialist services" },
              { v: "13", l: "Industries served" },
              { v: "<4h", l: "Priority response" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-3xl font-bold tabular-nums text-white">
                  {s.v}
                </dt>
                <dd className="mt-0.5 text-xs font-medium uppercase tracking-wide text-white/65">
                  {s.l}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Right — smaller, reinforcing visual only (not a second hero) */}
        <div className="hidden lg:col-span-5 lg:block">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

/* Primary CTA — gold, strong. Secondary CTA — dark teal text, ghost style. */
function Button_primary({
  children,
  href: to,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={to}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-gold px-7 text-sm font-semibold text-gold-foreground shadow-lg shadow-amber-900/20 transition-all hover:bg-gold/90 hover:shadow-xl"
    >
      {children}
    </Link>
  );
}
function Button_secondary({
  children,
  href: to,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={to}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/25 bg-transparent px-7 text-sm font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10"
    >
      {children}
    </Link>
  );
}

function HeroVisual() {
  const domains = [
    { icon: Network, label: "Networking" },
    { icon: Lock, label: "Cybersecurity" },
    { icon: Camera, label: "Surveillance" },
    { icon: Fingerprint, label: "Access Control" },
    { icon: Flame, label: "Fire Safety" },
    { icon: ServerCog, label: "IT Infrastructure" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-4 max-w-sm"
    >
      <div className="rounded-2xl border border-white/15 bg-[oklch(0.2_0.03_235/0.85)] p-5 shadow-2xl backdrop-blur-md">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand/20 text-brand">
              <ShieldCheck className="size-4.5" />
            </div>
            <span className="text-sm font-semibold text-white">
              Integrated Security Stack
            </span>
          </div>
          <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-brand">
            One team
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {domains.map((d) => (
            <div
              key={d.label}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-2"
            >
              <d.icon className="size-4 text-brand" />
              <span className="text-[0.8rem] font-medium text-white/90">{d.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3.5 flex items-center justify-between rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-xs">
          <span className="font-semibold text-brand">System status</span>
          <span className="text-white/60">Assess → Design → Install → Support</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust strip                                                        */
/* ------------------------------------------------------------------ */
function TrustStrip() {
  return (
    <div className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <TrustLine />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  What we do — service categories                                    */
/* ------------------------------------------------------------------ */
function WhatWeDo() {
  return (
    <Section>
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <SectionHeader
          eyebrow="What we do"
          title="Six domains. One accountable partner."
          subtitle="Most security and IT problems span networking, cybersecurity, surveillance, access control, fire safety and IT. We engineer them together — so your systems work as one."
        />
        <NavButton view="services" variant="outline" size="lg">
          View all services
          <ArrowRight className="size-4" />
        </NavButton>
      </div>

      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {serviceCategories.map((cat) => (
          <motion.div key={cat.id} variants={staggerItem}>
            <NavLink
              view="services"
              params={{ anchor: `cat-${cat.id}` }}
              className="group block h-full"
            >
              <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-emerald-500/5">
                <div className="relative aspect-[16/8] overflow-hidden border-b border-border/60 bg-muted">
                  <RemoteImage
                    src={categoryMedia[cat.id] || media.industryLeading}
                    alt={`${cat.name} — equipment Allison Global deploys`}
                    className="size-full"
                    imgClassName="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    query={cat.id}
                  />
                </div>
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${cat.accent}`}
                />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <IconBadge icon={cat.icon} variant="brand" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {cat.services.length} services
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold">{cat.name}</h3>
                  <p className="mt-1.5 text-sm font-medium text-brand">{cat.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {cat.services.slice(0, 3).map((slug) => {
                      const svc = services.find((s) => s.slug === slug);
                      return svc ? (
                        <span
                          key={slug}
                          className="rounded-md bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground"
                        >
                          {svc.name}
                        </span>
                      ) : null;
                    })}
                    {cat.services.length > 3 && (
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                        +{cat.services.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-transform group-hover:translate-x-1">
                    Explore category
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </div>
            </NavLink>
          </motion.div>
        ))}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Why choose us                                                      */
/* ------------------------------------------------------------------ */
function WhyChooseUs() {
  return (
    <Section className="bg-muted/30">
      <SectionHeader
        align="center"
        eyebrow="Why Allison Global"
        title="More than a vendor — your technology & security partner"
        subtitle="Organisations choose us because we engineer outcomes, not transactions. Here's what that looks like in practice."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {differentiators.map((d, i) => {
          const Icon = valueIconMap[d.icon] ?? ShieldCheck;
          return (
            <Reveal key={d.title} delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-border/70 bg-card p-6">
                <IconBadge icon={Icon} variant="brand" />
                <h3 className="mt-4 font-display text-base font-semibold">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {d.description}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Process preview                                                    */
/* ------------------------------------------------------------------ */
function ProcessPreview() {
  return (
    <Section>
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <SectionHeader
          eyebrow="How we work"
          title="A process built for outcomes, not transactions"
          subtitle="Every engagement follows the same engineering-led path — from understanding your site to supporting it for years after."
        />
        <NavButton view="process" variant="outline" size="lg">
          See full process
          <ArrowRight className="size-4" />
        </NavButton>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {processSteps.map((step, i) => (
          <Reveal key={step.id} delay={i * 0.05}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card p-6">
              <div className="absolute right-4 top-4 font-display text-5xl font-bold text-muted/60 transition-colors group-hover:text-brand/15">
                {String(step.step).padStart(2, "0")}
              </div>
              <IconBadge icon={step.icon} variant="brand" />
              <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.summary}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Industries preview                                                 */
/* ------------------------------------------------------------------ */
function IndustriesPreview() {
  return (
    <Section className="bg-muted/30">
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <SectionHeader
          eyebrow="Who we serve"
          title="Solutions engineered for your sector"
          subtitle="Different environments face different risks. We tailor our approach to the realities of your industry — from homes to heavy industry."
        />
        <NavButton view="industries" variant="outline" size="lg">
          All industries
          <ArrowRight className="size-4" />
        </NavButton>
      </div>
      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {industries.slice(0, 8).map((ind) => (
          <motion.div key={ind.id} variants={staggerItem}>
            <IndustryCard industry={ind} />
          </motion.div>
        ))}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Capability stats                                                   */
/* ------------------------------------------------------------------ */
function CapabilityStats() {
  return (
    <Section className="band-ink relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-dark opacity-40" />
      <div className="absolute left-1/2 top-0 size-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative">
        <SectionHeader
          align="center"
          light
          eyebrow="Capability"
          title="Built to protect what matters, at scale"
          subtitle="The breadth to handle your full infrastructure — and the engineering discipline to do it right."
        />
        <div className="mt-12">
          <StatStrip stats={capabilityStats} light />
        </div>
        <div className="mx-auto mt-14 max-w-5xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
            Technologies & platforms we deploy
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {technologyPlatforms.map((t) => (
              <span
                key={t.name}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-white/70"
              >
                {t.name}
              </span>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-white/30">
            Competency with these platforms — not claimed certified partnerships.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Projects preview                                                   */
/* ------------------------------------------------------------------ */
function ProjectsPreview() {
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  return (
    <Section>
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <SectionHeader
          eyebrow="Projects"
          title="Representative engagements"
          subtitle="A selection of the work we deliver across industries — each engineered, documented and supported as a complete system."
        />
        <NavButton view="projects" variant="outline" size="lg">
          View all projects
          <ArrowRight className="size-4" />
        </NavButton>
      </div>
      <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((p) => (
          <motion.div key={p.id} variants={staggerItem}>
            <ProjectCard project={p} imageUrl={projectMedia[p.id]} />
          </motion.div>
        ))}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Solutions preview                                                  */
/* ------------------------------------------------------------------ */
function SolutionsPreview() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Unified Security & Surveillance",
      desc: "CCTV, access control, alarms and monitoring on one platform.",
      slug: "unified-security",
    },
    {
      icon: Network,
      title: "Resilient Network Infrastructure",
      desc: "Cabling, switching, routing and Wi-Fi engineered to last.",
      slug: "resilient-network",
    },
    {
      icon: Lock,
      title: "Cyber Defence Programme",
      desc: "Assessment, firewalls, endpoint protection and monitoring.",
      slug: "cyber-defence",
    },
    {
      icon: Flame,
      title: "Life Safety & Fire Protection",
      desc: "Detection, alarms and evacuation engineered to standards.",
      slug: "life-safety",
    },
  ];
  return (
    <Section className="bg-muted/30">
      <SectionHeader
        align="center"
        eyebrow="Solutions by outcome"
        title="Start with the problem, not the product"
        subtitle="These cross-cutting solutions bundle services across our domains — so you solve a real problem instead of buying disconnected products."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s, i) => (
          <Reveal key={s.slug} delay={i * 0.05}>
            <Link
              href={href("solutions", { anchor: `sol-${s.slug}` })}
              className="group block h-full w-full rounded-2xl border border-border/70 bg-card p-6 text-left transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
            >
              <IconBadge icon={s.icon} variant="brand" />
              <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-transform group-hover:translate-x-1">
                Explore solution
                <ChevronRight className="size-4" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonials preview                                               */
/* ------------------------------------------------------------------ */
function TestimonialsPreview() {
  const picks = testimonials.slice(0, 3);
  return (
    <Section>
      <SectionHeader
        align="center"
        eyebrow="Client feedback"
        title="What working with us feels like"
        subtitle="Representative feedback from the clients and sectors we serve — by role, not manufactured endorsements."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {picks.map((t, i) => (
          <Reveal key={t.id} delay={i * 0.06}>
            <figure className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6">
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <Quote className="mt-3 size-7 text-brand/30" />
              <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-foreground/90">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-border pt-4">
                <div className="text-sm font-semibold">{t.authorRole}</div>
                <div className="text-xs text-muted-foreground">
                  {industryMap[t.sector]?.name} · {t.projectType}
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 text-center">
        <NavButton view="testimonials" variant="outline">
          Read more feedback
        </NavButton>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Insights preview                                                   */
/* ------------------------------------------------------------------ */
function InsightsPreview() {
  const posts = blogPosts.slice(0, 3);
  return (
    <Section className="bg-muted/30">
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <SectionHeader
          eyebrow="Insights"
          title="Practical guidance from our engineers"
          subtitle="Learn how to choose, secure and maintain the systems that protect your business — in plain language."
        />
        <NavButton view="blog" variant="outline" size="lg">
          All insights
          <ArrowRight className="size-4" />
        </NavButton>
      </div>
      <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <motion.div key={p.slug} variants={staggerItem}>
            <BlogCard post={p} imageUrl={blogMedia[p.slug]} />
          </motion.div>
        ))}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Founder note                                                       */
/* ------------------------------------------------------------------ */
function FounderNote() {
  return (
    <Section>
      <div className="grid items-center gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-amber-500/10 blur-2xl" />
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="aspect-[4/5] bg-gradient-to-br from-emerald-600 to-emerald-900 p-8">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                      <Cpu className="size-6" />
                    </div>
                    <div>
                      <div className="font-display text-lg font-bold text-white">
                        {company.founder.name}
                      </div>
                      <div className="text-xs text-white/70">{company.founder.title}</div>
                    </div>
                  </div>
                  <div className="text-white/80">
                    <div className="text-xs uppercase tracking-wide text-white/50">
                      Discipline
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      {company.founder.discipline}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/10 p-3 text-white/90 backdrop-blur">
                    <PhoneCall className="size-4 text-amber-300" />
                    <span className="text-sm font-medium">{company.contact.phoneDisplay}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
        <div className="lg:col-span-7">
          <SectionHeader
            eyebrow="From the founder"
            title="“Systems should be engineered, not assembled.”"
          />
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              {company.founder.bio}
            </p>
            <p>
              That field-first mindset is why Allison Global delivers documented,
              integrated, supported systems — and why we stay accountable long
              after the installers leave.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <NavButton view="about" size="lg">
              Read our story
              <ArrowRight className="size-4" />
            </NavButton>
            <NavButton view="contact" variant="outline" size="lg">
              Speak with the team
            </NavButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
