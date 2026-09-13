"use client";

import * as React from "react";
import {
  ArrowRight,
  PhoneCall,
  CalendarClock,
  MessageSquare,
  MapPin,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Section,
  SectionHeader,
  Reveal,
  IconBadge,
  NavButton,
  NavLink,
} from "@/components/site/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { company } from "@/lib/data/company";
import type { Service, Industry, Project, BlogPost, Stat, ViewId } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  PageHero — inner page header with breadcrumb-style eyebrow        */
/* ------------------------------------------------------------------ */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  breadcrumb,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  breadcrumb?: { label: string; view?: ViewId }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden band-ink">
      <div className="absolute inset-0 bg-grid-dark opacity-50" />
      <div className="absolute inset-0 bg-radial-fade opacity-60" />
      <div className="absolute -right-20 -top-20 size-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {breadcrumb && (
          <nav className="mb-5 flex items-center gap-1.5 text-sm text-white/50">
            {breadcrumb.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-white/30">/</span>}
                {b.view ? (
                  <NavLink view={b.view} className="transition-colors hover:text-white">
                    {b.label}
                  </NavLink>
                ) : (
                  <span className="text-white/80">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="max-w-3xl">
          {eyebrow && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300 backdrop-blur">
              {Icon && <Icon className="size-3.5" />}
              {eyebrow}
            </div>
          )}
          <h1 className="text-balance text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/70">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  ConversionPathCTA — the recurring conversion band                */
/* ------------------------------------------------------------------ */
const conversionPaths = [
  {
    icon: ClipboardCheck_icon,
    title: "Request a Quote",
    description: "Tell us what you need and get a clear, no-obligation proposal.",
    view: "quote" as const,
    cta: "Get a quote",
  },
  {
    icon: CalendarClock,
    title: "Book a Consultation",
    description: "Speak with an engineer about your site, risks and goals.",
    view: "contact" as const,
    cta: "Book consultation",
  },
  {
    icon: MapPin,
    title: "Get a Site Assessment",
    description: "Have us assess your premises and recommend priorities.",
    view: "quote" as const,
    cta: "Request assessment",
    subject: "Site Assessment Request",
  },
  {
    icon: MessageSquare,
    title: "Talk to an Expert",
    description: "Quick question? Call our team directly — we're happy to help.",
    view: "contact" as const,
    cta: "Talk to us",
  },
];

import { ClipboardList as ClipboardCheck_icon } from "lucide-react";

export function ConversionPathCTA({
  title = "Let's secure what matters",
  subtitle = "Choose the path that fits — or just reach out. One conversation with our engineering team is usually all it takes to get clarity on your next step.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <Section className="band-ink relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-dark opacity-40" />
      <div className="absolute -left-20 top-1/2 size-72 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="relative">
        <SectionHeader
          align="center"
          light
          eyebrow="Get started"
          title={title}
          subtitle={subtitle}
        />
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {conversionPaths.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <NavLink
                view={p.view}
                subject={p.subject}
                className="group block h-full rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur transition-all hover:border-emerald-400/40 hover:bg-white/[0.07]"
              >
                <IconBadge
                  icon={p.icon}
                  variant="brand"
                  className="mb-4 ring-1 ring-emerald-400/30"
                />
                <h3 className="font-display text-lg font-semibold text-white">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {p.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 transition-transform group-hover:translate-x-1">
                  {p.cta}
                  <ArrowRight className="size-4" />
                </span>
              </NavLink>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-white/70 sm:flex-row">
          <span className="text-sm">Prefer to talk now?</span>
          <a
            href={`tel:${company.contact.phoneIntl}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
          >
            <PhoneCall className="size-4" />
            {company.contact.phoneDisplay}
          </a>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  StatStrip                                                          */
/* ------------------------------------------------------------------ */
export function StatStrip({
  stats,
  light = false,
  className,
}: {
  stats: Stat[];
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-6 lg:grid-cols-4",
        className,
      )}
    >
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.06}>
          <div className="text-center sm:text-left">
            <div
              className={cn(
                "font-display text-4xl font-bold sm:text-5xl",
                light ? "text-white" : "text-gradient-brand",
              )}
            >
              {s.value}
            </div>
            <div
              className={cn(
                "mt-1.5 text-sm font-medium",
                light ? "text-white/80" : "text-foreground",
              )}
            >
              {s.label}
            </div>
            {s.sub && (
              <div
                className={cn(
                  "text-xs",
                  light ? "text-white/50" : "text-muted-foreground",
                )}
              >
                {s.sub}
              </div>
            )}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cards                                                              */
/* ------------------------------------------------------------------ */
export function ServiceCard({
  service,
  categoryName,
}: {
  service: Service;
  categoryName?: string;
}) {
  return (
    <NavLink
      view="service-detail"
      slug={service.slug}
      className="group block h-full"
    >
      <Card className="h-full overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-emerald-500/5">
        <CardContent className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between">
            <IconBadge icon={service.icon} variant="brand" />
            {service.featured && (
              <Badge variant="secondary" className="text-[0.65rem] uppercase tracking-wide">
                Popular
              </Badge>
            )}
          </div>
          <h3 className="mt-5 font-display text-lg font-semibold leading-snug">
            {service.name}
          </h3>
          {categoryName && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-brand">
              {categoryName}
            </p>
          )}
          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
            {service.shortDescription}
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-transform group-hover:translate-x-1">
            Explore service
            <ArrowRight className="size-4" />
          </span>
        </CardContent>
      </Card>
    </NavLink>
  );
}

export function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <NavLink
      view="industry-detail"
      slug={industry.id}
      className="group block h-full"
    >
      <Card className="h-full overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-emerald-500/5">
        <CardContent className="flex h-full flex-col p-6">
          <IconBadge icon={industry.icon} variant="outline" />
          <h3 className="mt-5 font-display text-lg font-semibold leading-snug">
            {industry.name}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {industry.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {industry.solutions.slice(0, 3).map((s) => (
              <Badge key={s} variant="outline" className="text-[0.65rem] font-normal text-muted-foreground">
                {s.replace(/-/g, " ")}
              </Badge>
            ))}
          </div>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-transform group-hover:translate-x-1">
            View sector solutions
            <ArrowRight className="size-4" />
          </span>
        </CardContent>
      </Card>
    </NavLink>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="group h-full overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-emerald-500/5">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <ProjectImage query={project.imageQuery} alt={project.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          <Badge className="bg-brand text-brand-foreground shadow">{project.category}</Badge>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-1.5 text-xs text-white/80">
            <MapPin className="size-3" />
            {project.location}
            <span className="text-white/40">·</span>
            {project.year}
          </div>
        </div>
      </div>
      <CardContent className="flex flex-col p-6">
        <h3 className="font-display text-lg font-semibold leading-snug">
          {project.title}
        </h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-brand">
          {project.scope}
        </p>
        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.services.slice(0, 3).map((s) => (
            <Badge key={s} variant="outline" className="text-[0.65rem] font-normal text-muted-foreground">
              {s.replace(/-/g, " ")}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function BlogCard({ post }: { post: BlogPost }) {
  const date = new Date(post.date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <NavLink view="blog-post" slug={post.slug} className="group block h-full">
      <Card className="group h-full overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-emerald-500/5">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <ProjectImage query={post.imageQuery} alt={post.title} />
          <div className="absolute left-4 top-4">
            <Badge className="bg-background/90 text-foreground backdrop-blur">
              {post.category}
            </Badge>
          </div>
        </div>
        <CardContent className="flex flex-col p-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{date}</span>
            <span className="text-border">·</span>
            <span>{post.readTime}</span>
          </div>
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug transition-colors group-hover:text-brand">
            {post.title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-transform group-hover:translate-x-1">
            Read article
            <ArrowRight className="size-4" />
          </span>
        </CardContent>
      </Card>
    </NavLink>
  );
}

/* ------------------------------------------------------------------ */
/*  ProjectImage — AI-generated or gradient placeholder              */
/*  Uses a deterministic gradient + query label as a tasteful         */
/*  stand-in for imagery. Kept lightweight for performance.          */
/* ------------------------------------------------------------------ */
export function ProjectImage({
  query,
  alt,
  className,
}: {
  query: string;
  alt: string;
  className?: string;
}) {
  // Deterministic gradient from query string for visual variety
  const hash = React.useMemo(() => {
    let h = 0;
    for (let i = 0; i < query.length; i++) h = (h * 31 + query.charCodeAt(i)) >>> 0;
    return h;
  }, [query]);
  const hue1 = 150 + (hash % 50);
  const hue2 = 175 + ((hash >> 3) % 40);
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("relative size-full", className)}
      style={{
        background: `linear-gradient(135deg, oklch(0.4 0.09 ${hue1}) 0%, oklch(0.3 0.06 ${hue2}) 50%, oklch(0.22 0.04 ${hue2}) 100%)`,
      }}
    >
      <div className="absolute inset-0 bg-grid-dark opacity-30" />
      <div className="absolute inset-0 flex items-end p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-white/40">
          {query}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TrustBadge strip (used on home + about)                          */
/* ------------------------------------------------------------------ */
export function TrustLine() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-2">
        <ShieldCheck className="size-4 text-brand" />
        Engineering-led delivery
      </span>
      <span className="inline-flex items-center gap-2">
        <ShieldCheck className="size-4 text-brand" />
        Documented handovers
      </span>
      <span className="inline-flex items-center gap-2">
        <ShieldCheck className="size-4 text-brand" />
        Workmanship warranty
      </span>
      <span className="inline-flex items-center gap-2">
        <ShieldCheck className="size-4 text-brand" />
        Priority support SLAs
      </span>
      <span className="inline-flex items-center gap-2">
        <ShieldCheck className="size-4 text-brand" />
        Nationwide coverage
      </span>
    </div>
  );
}
