"use client";

import * as React from "react";
import {
  Building2,
  Ruler,
  Handshake,
  ShieldCheck,
  HeartHandshake,
  BadgeCheck,
  Globe,
  FileCheck,
  Clock,
  Scale,
  ClipboardList,
  PencilRuler,
  Network,
  PhoneCall,
  ArrowRight,
  MapPin,
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
  PhoneLink,
} from "@/components/site/primitives";
import {
  PageHero,
  ConversionPathCTA,
  StatStrip,
  TrustLine,
} from "@/components/site/sections";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  company,
  values,
  capabilityStats,
  guarantees,
  technologyPlatforms,
} from "@/lib/data/company";
import { heroMedia } from "@/lib/data/media";

/* ------------------------------------------------------------------ */
/*  Icon maps (string → lucide component)                             */
/* ------------------------------------------------------------------ */
const valueIconMap: Record<string, LucideIcon> = {
  Ruler,
  Handshake,
  ShieldCheck,
  HeartHandshake,
  BadgeCheck,
  Globe,
};

const guaranteeIconMap: Record<string, LucideIcon> = {
  FileCheck,
  ShieldCheck,
  Clock,
  Scale,
};

/* ------------------------------------------------------------------ */
/*  AboutView                                                          */
/* ------------------------------------------------------------------ */
export function AboutView() {
  return (
    <>
      <PageHero
        backgroundImage={heroMedia["about"]}
        eyebrow="About Allison Global"
        title="Technology without limits, engineered into every system we deploy"
        subtitle={company.longPitch}
        icon={Building2}
        breadcrumb={[
          { label: "Home", view: "home" },
          { label: "About" },
        ]}
      />
      <TrustBand />
      <OurStory />
      <WhatWeStandFor />
      <OurApproach />
      <CapabilityAtAGlance />
      <OurCommitments />
      <Leadership />
      <ConversionPathCTA />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust band (mirrors home for visual continuity)                   */
/* ------------------------------------------------------------------ */
function TrustBand() {
  return (
    <div className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <TrustLine />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Our Story — 2-col narrative + founder mini-card                   */
/* ------------------------------------------------------------------ */
function OurStory() {
  return (
    <Section>
      <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <SectionHeader
            eyebrow="Our Story"
            title="Built to close the gap between buying equipment and owning a system"
          />
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              Allison Global was founded in {company.foundedLabel.replace("Established ", "")} by{" "}
              <strong className="font-semibold text-foreground">
                {company.founder.name}
              </strong>
              , an {company.founder.discipline}. After years on site —
              commissioning networks, CCTV, access control and fire systems
              across homes, offices and industrial premises — he kept seeing
              the same pattern: organisations buying good equipment, then losing
              real value because nobody engineered the whole system
              end-to-end. Cameras with the wrong lenses, networks that buckled
              under surveillance traffic, fire alarms no one had a maintenance
              schedule for, access systems installed without audit trails.
            </p>
            <p>
              The equipment was rarely the problem. The{" "}
              <em className="text-foreground not-italic font-medium">
                engineering
              </em>{" "}
              was. So we built Allison Global to close that gap — a single,
              accountable team that assesses a site, designs the system,
              supplies genuine equipment, installs it cleanly, integrates it
              end-to-end, and stays responsible for it long after handover.
            </p>
            <p>
              We are Nigerian-based, headquartered in {company.location.city},
              and we deliver projects nationwide with a field-first approach and
              engineering standards aligned to international best practice. We
              don&apos;t sell boxes. We engineer outcomes — and we own them.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <NavButton view="process" size="lg">
              See how we work
              <ArrowRight className="size-4" />
            </NavButton>
            <NavButton view="why-choose-us" variant="outline" size="lg">
              Why choose us
            </NavButton>
          </div>
        </div>

        {/* Founder mini-card / credentials */}
        <div className="lg:col-span-5">
          <Reveal>
            <Card className="overflow-hidden border-border/70">
              <div className="relative aspect-[4/5] bg-gradient-to-br from-emerald-600 to-emerald-900 p-8 sm:p-10">
                <div className="absolute inset-0 bg-grid-dark opacity-30" />
                <div className="absolute -right-16 -top-16 size-56 rounded-full bg-amber-500/15 blur-3xl" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                      <Building2 className="size-6" />
                    </div>
                    <div>
                      <div className="font-display text-lg font-bold text-white">
                        {company.founder.name}
                      </div>
                      <div className="text-xs text-white/70">
                        {company.founder.title}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/50">
                        Discipline
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        {company.founder.discipline}
                      </div>
                    </div>
                    <div>
                      <div className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/50">
                        Based in
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                        <MapPin className="size-3.5 text-amber-300" />
                        {company.location.city}, {company.location.country}
                      </div>
                    </div>
                    <div>
                      <div className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/50">
                        Founded
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        October 2025
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${company.contact.phoneIntl}`}
                    className="flex items-center justify-between gap-2 rounded-xl bg-white/10 p-3 text-white/90 ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/15"
                  >
                    <span className="inline-flex items-center gap-2">
                      <PhoneCall className="size-4 text-amber-300" />
                      <span className="text-sm font-semibold">
                        {company.contact.phoneDisplay}
                      </span>
                    </span>
                    <ArrowRight className="size-4 text-white/60" />
                  </a>
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  What we stand for — values grid                                    */
/* ------------------------------------------------------------------ */
function WhatWeStandFor() {
  return (
    <Section className="bg-muted/30">
      <SectionHeader
        align="center"
        eyebrow="What we stand for"
        title="The principles behind every engagement"
        subtitle="These are not slogans. They are the working principles our engineers apply on every site we walk onto."
      />
      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((v) => {
          const Icon = valueIconMap[v.icon] ?? BadgeCheck;
          return (
            <motion.div key={v.title} variants={staggerItem}>
              <div className="h-full rounded-2xl border border-border/70 bg-card p-6">
                <IconBadge icon={Icon} variant="brand" />
                <h3 className="mt-4 font-display text-lg font-semibold leading-snug">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {v.description}
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
/*  Our approach — dark band, 4 pillars                               */
/* ------------------------------------------------------------------ */
function OurApproach() {
  const pillars: {
    icon: LucideIcon;
    title: string;
    description: string;
  }[] = [
    {
      icon: ClipboardList,
      title: "Assessment-led",
      description:
        "We walk the site, understand the risk and document the requirement before we recommend a single product.",
    },
    {
      icon: PencilRuler,
      title: "Engineering-led",
      description:
        "Cable specs, load calculations, coverage and signal integrity designed properly — not assembled from whatever is in the van.",
    },
    {
      icon: Network,
      title: "Integration-first",
      description:
        "CCTV talks to access control, alarms escalate to your phone, networks carry surveillance cleanly — systems that work as one.",
    },
    {
      icon: HeartHandshake,
      title: "Long-term partnership",
      description:
        "We stay after handover with preventive maintenance, monitoring and support — because systems are lived with, not just installed.",
    },
  ];
  return (
    <Section className="band-ink relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-dark opacity-40" />
      <div className="absolute -left-20 top-1/2 size-72 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="relative">
        <SectionHeader
          align="center"
          light
          eyebrow="Our approach"
          title="How we think about every engagement"
          subtitle="Four ideas show up in every project we deliver — from a single-camera install to a multi-site security rollout."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
                <IconBadge
                  icon={p.icon}
                  variant="brand"
                  className="ring-1 ring-emerald-400/30"
                />
                <h3 className="mt-4 font-display text-lg font-semibold text-white">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {p.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Capability at a glance — StatStrip + tech platforms                */
/* ------------------------------------------------------------------ */
function CapabilityAtAGlance() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Capability at a glance"
        title="Breadth across ICT and security, depth where it matters"
        subtitle="We bring six core domains under one team — so your network, surveillance, access control, fire safety, cybersecurity and IT infrastructure are designed to work together, not in silos."
      />
      <div className="mt-10">
        <StatStrip stats={capabilityStats} />
      </div>

      <div className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <h3 className="font-display text-xl font-bold">
            Technologies &amp; platforms we deploy
          </h3>
          <span className="hidden text-xs text-muted-foreground sm:block">
            Competency — not claimed certified partnerships
          </span>
        </div>
        <Stagger className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {technologyPlatforms.map((t) => (
            <motion.div key={t.name} variants={staggerItem}>
              <div className="flex h-full items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3">
                <span className="text-sm font-semibold text-foreground">
                  {t.name}
                </span>
                <Badge
                  variant="outline"
                  className="text-[0.6rem] font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {t.domain}
                </Badge>
              </div>
            </motion.div>
          ))}
        </Stagger>
        <p className="mt-4 text-xs text-muted-foreground sm:hidden">
          Competency with these platforms — not claimed certified partnerships.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <NavButton view="services">
          Explore our services
          <ArrowRight className="size-4" />
        </NavButton>
        <NavButton view="projects" variant="outline">
          See representative projects
        </NavButton>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Our commitments — guarantees grid                                  */
/* ------------------------------------------------------------------ */
function OurCommitments() {
  return (
    <Section className="bg-muted/30">
      <SectionHeader
        align="center"
        eyebrow="Our commitments"
        title="What you can hold us to — in writing"
        subtitle="Premium isn&apos;t a feeling, it&apos;s a standard. These four commitments apply to every project we deliver."
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
/*  Leadership — founder card with bio                                 */
/* ------------------------------------------------------------------ */
function Leadership() {
  return (
    <Section>
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-5">
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-amber-500/10 blur-2xl" />
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="aspect-[4/5] bg-gradient-to-br from-emerald-600 to-emerald-900 p-8">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                      <Ruler className="size-6" />
                    </div>
                    <div>
                      <div className="font-display text-lg font-bold text-white">
                        {company.founder.name}
                      </div>
                      <div className="text-xs text-white/70">
                        {company.founder.title}
                      </div>
                    </div>
                  </div>
                  <div className="text-white/80">
                    <div className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/50">
                      Discipline
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      {company.founder.discipline}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/10 p-3 text-white/90 ring-1 ring-white/15 backdrop-blur">
                    <PhoneCall className="size-4 text-amber-300" />
                    <PhoneLink className="text-sm font-semibold text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <SectionHeader
            eyebrow="Leadership"
            title="Engineering led, from the top"
            subtitle={`${company.founder.name} founded Allison Global on a simple belief — that systems should be engineered, not assembled.`}
          />
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>{company.founder.bio}</p>
            <p>
              That field-first mindset shapes everything we do at Allison
              Global — from the way we assess a site to the way we document a
              handover. Our clients get a single, accountable partner that
              treats every project as an engineered system, not a shopping list.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <NavButton view="contact" size="lg">
              Speak with our team
              <ArrowRight className="size-4" />
            </NavButton>
            <NavButton view="quote" variant="outline" size="lg">
              Request a quote
            </NavButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
