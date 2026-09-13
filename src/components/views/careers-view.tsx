"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Cpu,
  Target,
  Layers,
  TrendingUp,
  MapPin,
  Briefcase,
  Clock,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Mail,
  PhoneCall,
  Send,
} from "lucide-react";
import {
  Section,
  SectionHeader,
  Reveal,
  Stagger,
  staggerItem,
  IconBadge,
  NavButton,
  NavLink,
  PhoneLink,
} from "@/components/site/primitives";
import { PageHero, ConversionPathCTA } from "@/components/site/sections";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { jobs, careersIntro, careersPerks } from "@/lib/data/careers";
import { company } from "@/lib/data/company";
import type { Job } from "@/lib/types";

const perkIconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Cpu,
  Target,
  Layers,
  TrendingUp,
};

export function CareersView() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build a career engineering trust"
        subtitle={careersIntro}
        icon={Users}
        breadcrumb={[{ label: "Home", view: "home" }, { label: "Careers" }]}
      />

      <WhyJoin />
      <OpenPositions />
      <GeneralApplication />
      <ConversionPathCTA />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Why join Allison Global                                             */
/* ------------------------------------------------------------------ */
function WhyJoin() {
  return (
    <Section>
      <SectionHeader
        align="center"
        eyebrow="Why join Allison Global"
        title="A team that engineers trust, not just delivers work"
        subtitle="We're small enough that you'll know everyone and large enough to be exposed to genuinely diverse, enterprise-grade work across ICT and security."
      />
      <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {careersPerks.map((perk) => {
          const Icon = perkIconMap[perk.icon] ?? Cpu;
          return (
            <motion.div key={perk.title} variants={staggerItem}>
              <Card className="h-full border-border/70 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-emerald-500/5">
                <CardContent className="flex h-full flex-col p-6">
                  <IconBadge icon={Icon} variant="brand" />
                  <h3 className="mt-5 font-display text-lg font-semibold leading-snug">
                    {perk.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {perk.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </Stagger>

      {/* Stat / quote band */}
      <Reveal className="mt-12">
        <div className="relative overflow-hidden rounded-2xl border border-brand/15 bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-8 dark:from-emerald-950/40 dark:to-emerald-900/20 sm:p-10">
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-brand/10 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-3 lg:items-center">
            <div className="lg:col-span-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-background/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                <Sparkles className="size-3.5" />
                Engineering-led culture
              </span>
              <p className="mt-4 text-balance font-display text-xl font-semibold leading-snug sm:text-2xl">
                "We treat every client's systems as our own — design before
                deployment, accountability end-to-end, and work we'd be proud to
                put our name on."
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                — {company.founder.name}, {company.founder.title}
              </p>
            </div>
            <div className="lg:justify-self-end">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { v: "6", l: "Service domains" },
                  { v: "13", l: "Industries served" },
                  { v: "< 4h", l: "Target response SLA" },
                  { v: "Nationwide", l: "Project coverage" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-background/70 p-4 text-center ring-1 ring-border">
                    <div className="font-display text-2xl font-bold text-brand">
                      {s.v}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Open positions — expandable cards                                  */
/* ------------------------------------------------------------------ */
function OpenPositions() {
  return (
    <Section className="bg-muted/30">
      <SectionHeader
        eyebrow="Open positions"
        title="Current opportunities"
        subtitle="We're actively growing our engineering, installation, support and business development teams. Don't see a fit? Skip to the general application below."
      />

      <div className="mt-10 space-y-5">
        {jobs.map((job, i) => (
          <Reveal key={job.id} delay={i * 0.05}>
            <JobCard job={job} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function JobCard({ job }: { job: Job }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Card className="overflow-hidden border-border/70 transition-all duration-300 hover:border-brand/40 hover:shadow-md">
      <CardContent className="p-0">
        {/* Always-visible header */}
        <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-brand text-brand-foreground">{job.department}</Badge>
              <Badge variant="outline" className="font-normal text-muted-foreground">
                <Briefcase className="size-3" />
                {job.type}
              </Badge>
            </div>
            <h3 className="mt-3 font-display text-xl font-semibold leading-snug">
              {job.title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {job.summary}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-brand" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-brand" />
                {job.type}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="size-3.5 text-brand" />
                {job.department}
              </span>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2 lg:flex-col lg:items-stretch">
            <NavButton
              view="contact"
              subject={`Application: ${job.title}`}
              size="sm"
              className="gap-1.5"
            >
              Apply for this role
              <ArrowRight className="size-4" />
            </NavButton>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
            >
              {open ? "Hide details" : "View details"}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  open && "rotate-180",
                )}
              />
            </button>
          </div>
        </div>

        {/* Expandable details */}
        <motion.div
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden border-t border-border/70 bg-muted/40"
          aria-hidden={!open}
        >
          <div className="grid gap-6 p-6 lg:grid-cols-3">
            <DetailBlock
              title="What you'll do"
              items={job.responsibilities}
              iconColor="text-brand"
            />
            <DetailBlock
              title="What you'll bring"
              items={job.requirements}
              iconColor="text-brand"
            />
            <DetailBlock
              title="Nice to have"
              items={job.niceToHave ?? []}
              iconColor="text-gold"
              emptyText="No specific nice-to-haves — we evaluate every candidate on the fundamentals."
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-border/70 bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              To apply, send your CV and a short note on why you're a fit. We
              review every application personally.
            </p>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
              <NavLink
                view="contact"
                subject={`Application: ${job.title}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-4 text-xs font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
              >
                Apply now
                <ArrowRight className="size-3.5" />
              </NavLink>
              <a
                href={`mailto:${company.contact.email}?subject=${encodeURIComponent(
                  `Application: ${job.title}`,
                )}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
              >
                <Mail className="size-3.5" />
                Email us
              </a>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}

function DetailBlock({
  title,
  items,
  iconColor = "text-brand",
  emptyText,
}: {
  title: string;
  items: string[];
  iconColor?: string;
  emptyText?: string;
}) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
        {title}
      </h4>
      {items.length === 0 ? (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {emptyText ?? "Nothing specific listed."}
        </p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
              <CheckCircle2 className={cn("mt-0.5 size-4 shrink-0", iconColor)} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  General application                                                 */
/* ------------------------------------------------------------------ */
function GeneralApplication() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
        <div className="absolute -right-16 -top-16 size-56 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 size-56 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand dark:bg-emerald-500/10">
              <Send className="size-3.5" />
              Don't see your role?
            </span>
            <h2 className="mt-4 text-balance font-display text-2xl font-bold leading-tight sm:text-3xl">
              Send us your CV anyway
            </h2>
            <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              We're always interested in capable engineers, technicians and
              consultants who take ownership of outcomes. If you value clean
              work, honest counsel and partnership, we'd like to hear from you —
              even if there's no open role listed for your specialty today.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <NavButton view="contact" subject="General application" className="gap-1.5">
                Send us your CV
                <ArrowRight className="size-4" />
              </NavButton>
              <a
                href={`mailto:${company.contact.email}`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
              >
                <Mail className="size-4" />
                {company.contact.email}
              </a>
            </div>
          </div>

          <div className="lg:justify-self-end">
            <div className="rounded-xl border border-border bg-muted/40 p-6">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Get in touch directly
              </h3>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Email
                    </div>
                    <a
                      href={`mailto:${company.contact.email}`}
                      className="font-medium transition-colors hover:text-brand"
                    >
                      {company.contact.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <PhoneCall className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Phone
                    </div>
                    <PhoneLink className="font-medium" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <MapPin className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Location
                    </div>
                    <span className="font-medium">
                      {company.location.city}, {company.location.country}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
