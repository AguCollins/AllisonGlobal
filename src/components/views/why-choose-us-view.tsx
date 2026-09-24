"use client";

import * as React from "react";
import {
  ShieldCheck,
  Layers,
  Cpu,
  Map as MapIcon,
  Network,
  Zap,
  LifeBuoy,
  Scale,
  FileCheck,
  Clock,
  X,
  Check,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Section,
  SectionHeader,
  Reveal,
  Stagger,
  staggerItem,
  IconBadge,
  NavButton,
} from "@/components/site/primitives";
import { PageHero, ConversionPathCTA, IndustryCard } from "@/components/site/sections";
import {
  differentiators,
  guarantees,
} from "@/lib/data/company";
import { heroMedia } from "@/lib/data/media";
import { industries } from "@/lib/data/industries";

/* ------------------------------------------------------------------ */
/*  Icon maps                                                          */
/* ------------------------------------------------------------------ */
const differentiatorIconMap: Record<string, LucideIcon> = {
  Layers,
  Cpu,
  Map: MapIcon,
  Network,
  Zap,
  LifeBuoy,
  Scale,
  FileCheck,
};

const guaranteeIconMap: Record<string, LucideIcon> = {
  FileCheck,
  ShieldCheck,
  Clock,
  Scale,
};

/* ------------------------------------------------------------------ */
/*  WhyChooseUsView                                                     */
/* ------------------------------------------------------------------ */
export function WhyChooseUsView() {
  return (
    <>
      <PageHero
        backgroundImage={heroMedia["why-choose-us"]}
        eyebrow="Why Allison Global"
        title="More than a vendor — your technology & security partner"
        subtitle="Organisations choose us because we engineer outcomes, not transactions. Here is what that actually looks like — in practice, not in a brochure."
        icon={ShieldCheck}
        breadcrumb={[
          { label: "Home", view: "home" },
          { label: "Why Choose Us" },
        ]}
      />
      <Differentiators />
      <TheDifference />
      <Commitments />
      <IndustriesCTA />
      <ConversionPathCTA />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Differentiators grid (8)                                          */
/* ------------------------------------------------------------------ */
function Differentiators() {
  return (
    <Section>
      <div className="grid items-end gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SectionHeader
            eyebrow="Why clients choose us"
            title="Eight reasons it pays to engineer, not just install"
            subtitle="Any vendor can sell you equipment. The difference is whether what you bought actually works as a system — and whether anyone is accountable when it doesn't."
          />
        </div>
        <div className="lg:col-span-4 lg:pb-2">
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <NavButton view="services" variant="outline">
              Explore services
              <ArrowRight className="size-4" />
            </NavButton>
          </div>
        </div>
      </div>

      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {differentiators.map((d) => {
          const Icon = differentiatorIconMap[d.icon] ?? ShieldCheck;
          return (
            <motion.div key={d.title} variants={staggerItem}>
              <div className="h-full rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-emerald-500/5">
                <IconBadge icon={Icon} variant="brand" />
                <h3 className="mt-4 font-display text-base font-semibold leading-snug">
                  {d.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {d.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  The difference is in the system — comparison (dark)              */
/* ------------------------------------------------------------------ */
const typicalPoints = [
  "Sells boxes and leaves integration to you",
  "No documentation — you re-discover the system every time",
  "Disappears after install, returns only to bill for break-fix",
  "One-trick vendor — CCTV or networking, never the whole stack",
  "Reactive break-fix with no SLA and no preventive maintenance",
];

const allisonPoints = [
  "Integrates every system end-to-end — one accountable team",
  "As-built drawings, credentials and manuals on every project",
  "Stays for long-term support, monitoring and improvement",
  "Full-stack ICT + electronic security under one roof",
  "Proactive, engineering-led support with defined response targets",
];

function TheDifference() {
  return (
    <Section className="band-ink relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-dark opacity-40" />
      <div className="absolute -right-24 top-0 size-96 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute -left-24 bottom-0 size-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative">
        <SectionHeader
          align="center"
          light
          eyebrow="The difference is in the system"
          title="The typical vendor experience vs. the Allison Global experience"
          subtitle="Same equipment, completely different outcome. The difference is who owns the system — and for how long."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Typical vendor */}
          <Reveal>
            <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25">
                  <X className="size-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300/80">
                    Typical vendor experience
                  </div>
                  <div className="font-display text-lg font-semibold text-white">
                    Equipment delivered, value lost
                  </div>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {typicalPoints.map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-3 text-sm leading-relaxed text-white/65"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
                      <X className="size-3.5" />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Allison Global */}
          <Reveal delay={0.06}>
            <div className="relative h-full overflow-hidden rounded-3xl border border-emerald-400/30 bg-emerald-500/[0.06] p-7 backdrop-blur">
              <div className="absolute right-4 top-4">
                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/30">
                  The Allison Global way
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    Allison Global experience
                  </div>
                  <div className="font-display text-lg font-semibold text-white">
                    System engineered, outcome owned
                  </div>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {allisonPoints.map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-3 text-sm leading-relaxed text-white/90"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                      <Check className="size-3.5" />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-white/60">
            Same budget. Same equipment. Fundamentally different outcome —
            because of who engineers it.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <NavButton view="quote">
              Request a quote
              <ArrowRight className="size-4" />
            </NavButton>
            <NavButton view="process" variant="outline">
              See our process
            </NavButton>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Commitments — guarantees                                          */
/* ------------------------------------------------------------------ */
function Commitments() {
  return (
    <Section className="bg-muted/30">
      <SectionHeader
        align="center"
        eyebrow="Our commitments"
        title="What you can hold us to — in writing"
        subtitle="Premium is a standard, not a feeling. These four commitments apply to every project we deliver, regardless of size."
      />
      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {guarantees.map((g) => {
          const Icon = guaranteeIconMap[g.icon] ?? ShieldCheck;
          return (
            <motion.div key={g.title} variants={staggerItem}>
              <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6">
                <IconBadge icon={Icon} variant="brand" />
                <h3 className="mt-4 font-display text-base font-semibold">
                  {g.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {g.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Industries we serve — compact CTA grid                            */
/* ------------------------------------------------------------------ */
function IndustriesCTA() {
  const featured = industries.slice(0, 6);
  return (
    <Section>
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <SectionHeader
          eyebrow="Industries we serve"
          title="Tailored to the realities of your sector"
          subtitle="Different environments face different risks. We tailor the same engineering-led approach to your industry — from homes to heavy industry."
        />
        <NavButton view="industries" variant="outline" size="lg">
          All industries
          <ArrowRight className="size-4" />
        </NavButton>
      </div>
      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((ind) => (
          <motion.div key={ind.id} variants={staggerItem}>
            <IndustryCard industry={ind} />
          </motion.div>
        ))}
      </Stagger>
    </Section>
  );
}
