"use client";

import * as React from "react";
import {
  Puzzle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  PencilRuler,
  PlugZap,
  LifeBuoy,
  Target,
  type LucideIcon,
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
} from "@/components/site/primitives";
import { PageHero, ConversionPathCTA } from "@/components/site/sections";
import { RichTextContent } from "@/components/site/rich-text-content";
import type { Solution, Service, Industry } from "@/lib/types";
import { motion } from "framer-motion";

const HERO_IMAGE = "https://www.ui.com/microsite/static/industry-leading-CgUA2mbS.webp";

export interface SolutionsViewProps {
  solutions: Solution[];
  services: Service[];
  industries: Industry[];
  heroImage: string;
}

/* ------------------------------------------------------------------ */
/*  How solutions are built — 4 step explanation                       */
/* ------------------------------------------------------------------ */
const buildSteps: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: ClipboardCheck,
    title: "Assess",
    description:
      "We start on site. A senior engineer reviews your environment, risks, goals and existing equipment — so the solution fits your reality, not a template.",
  },
  {
    icon: PencilRuler,
    title: "Design",
    description:
      "We engineer the system end-to-end — equipment selection, cabling, segmentation, integrations and growth headroom — and document the design before any work begins.",
  },
  {
    icon: PlugZap,
    title: "Integrate",
    description:
      "Our field engineers install and configure every component, then wire them together so CCTV, access, alarms and networks respond to each other as one platform.",
  },
  {
    icon: LifeBuoy,
    title: "Support",
    description:
      "Handover is documented, your team is trained, and we stay — with preventive maintenance, monitoring and priority response under one accountable partner.",
  },
];

/* ------------------------------------------------------------------ */
/*  View                                                               */
/* ------------------------------------------------------------------ */
export function SolutionsView({ solutions, services, industries, heroImage }: SolutionsViewProps) {
  const heroBg = heroImage || HERO_IMAGE;
  const serviceMap = Object.fromEntries(services.map((s) => [s.slug, s])) as Record<string, Service>;
  const industryMap = Object.fromEntries(industries.map((i) => [i.id, i])) as Record<string, Industry>;

  return (
    <>
      <PageHero
        backgroundImage={heroBg}
        eyebrow="Solutions"
        icon={Puzzle}
        title="Start with the problem, not the product"
        subtitle="These cross-cutting solutions bundle services across our domains — so you solve a real problem instead of buying disconnected products."
        breadcrumb={[{ label: "Home", view: "home" }, { label: "Solutions" }]}
      />

      {/* Solutions grid */}
      {solutions.length === 0 ? (
        <Section>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <Puzzle className="size-8 text-muted-foreground/50" />
            <p className="mt-4 font-medium">No solutions published yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back soon for bundled outcome-focused solutions.</p>
          </div>
        </Section>
      ) : (
        <Section>
          <SectionHeader
            eyebrow="Solutions by outcome"
            title="Six problems we solve end-to-end"
            subtitle="Each solution combines specialist services from across our domains — engineered to work as one system, delivered by one accountable team."
          />

          <Stagger className="mt-12 grid gap-6 lg:grid-cols-2">
            {solutions.map((solution) => {
              const resolved = solution.components
                .map((slug) => serviceMap[slug])
                .filter(Boolean);
              const sectors = solution.bestFor
                .map((id) => industryMap[id])
                .filter(Boolean);

              return (
                <motion.div key={solution.id} variants={staggerItem}>
                  <article
                    id={`sol-${solution.id}`}
                    className="group relative flex h-full flex-col scroll-mt-28 overflow-hidden rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:border-brand/40 hover:shadow-xl hover:shadow-emerald-500/5 sm:p-7"
                  >
                    {/* subtle gradient corner accent */}
                    <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-emerald-500/5 blur-2xl transition-opacity duration-300 group-hover:bg-emerald-500/10" />

                    <div className="relative flex items-start justify-between gap-3">
                      <IconBadge icon={solution.iconName} variant="brand" size="lg" />
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                        {resolved.length} services bundled
                      </span>
                    </div>

                    <h3 className="relative mt-5 font-display text-xl font-bold leading-snug sm:text-2xl">
                      {solution.name}
                    </h3>
                    <p className="relative mt-2.5 text-sm leading-relaxed text-muted-foreground">
                      <RichTextContent content={solution.summary} />
                    </p>

                    <p className="relative mt-4 text-sm leading-relaxed text-foreground/80">
                      <RichTextContent content={solution.description} />
                    </p>

                    {/* Components — clickable service badges */}
                    <div className="relative mt-6">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                        What's included
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {resolved.map((svc) => (
                          <NavLink
                            key={svc.slug}
                            view="service-detail"
                            slug={svc.slug}
                            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-brand/40 hover:bg-brand/5 hover:text-brand"
                          >
                            {svc.name}
                          </NavLink>
                        ))}
                      </div>
                    </div>

                    {/* Outcomes — bullet list */}
                    <div className="relative mt-6 border-t border-border pt-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Outcomes
                      </div>
                      <ul className="mt-3 space-y-2">
                        {solution.outcomes.map((o, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm leading-relaxed text-foreground/90"
                          >
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
                            <span>{o}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Best for — sector chips */}
                    {sectors.length > 0 && (
                      <div className="relative mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          <Target className="size-3.5" />
                          Best for
                        </span>
                        {sectors.map((ind) => (
                          <NavLink
                            key={ind.id}
                            view="industry-detail"
                            slug={ind.id}
                            className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand"
                          >
                            {ind.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </article>
                </motion.div>
              );
            })}
          </Stagger>
        </Section>
      )}

      {/* How solutions are built */}
      <Section className="bg-muted/30">
        <SectionHeader
          align="center"
          eyebrow="How solutions are built"
          title="One engineering path, end to end"
          subtitle="Every solution — however complex — follows the same disciplined sequence. No surprise scope, no disconnected handovers, no orphaned systems."
        />

        <div className="relative mt-14">
          {/* connecting line on desktop */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {buildSteps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.06}>
                <div className="relative flex h-full flex-col items-start rounded-2xl border border-border/70 bg-background p-6">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/15">
                    <step.icon className="size-6" />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="font-display text-xs font-bold text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-lg font-semibold">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-brand" />
            Documented design before deployment
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-brand" />
            Genuine, warrantied equipment
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-brand" />
            As-built handover pack
          </span>
        </div>
      </Section>

      {/* Not sure which fits? */}
      <Section>
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-emerald-50 via-background to-amber-50/50 p-8 dark:from-emerald-500/10 dark:via-background dark:to-amber-500/5 sm:p-12">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 size-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionHeader
                eyebrow="Not sure which fits?"
                title="Tell us the problem — we'll map the solution"
                subtitle="You don't need to know which services you need. Describe the site, the risk or the goal, and our engineers will design a solution that genuinely fits — no upsell, no template."
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:flex-col lg:items-end">
              <NavButton view="contact" size="lg" className="w-full sm:w-auto">
                Talk to an expert
                <ArrowRight className="size-4" />
              </NavButton>
              <NavButton
                view="quote"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Request a quote
              </NavButton>
            </div>
          </div>
        </div>
      </Section>

      <ConversionPathCTA />
    </>
  );
}
