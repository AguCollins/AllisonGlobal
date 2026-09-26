"use client";

import * as React from "react";
import {
  LifeBuoy,
  ArrowRight,
  Check,
  PhoneCall,
  Mail,
  AlertTriangle,
  Network,
  Lock,
  Camera,
  Fingerprint,
  Flame,
  ServerCog,
  Star,
} from "lucide-react";
import {
  Section,
  SectionHeader,
  Reveal,
  IconBadge,
  NavButton,
  NavLink,
} from "@/components/site/primitives";
import { PageHero, ConversionPathCTA } from "@/components/site/sections";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompanyInfo } from "@/lib/data-access";
import type { ServiceCategory } from "@/lib/types";

const HERO_IMAGE = "https://www.ui.com/microsite/static/rack-D_Hb7KFT.jpg";

export interface SupportViewProps {
  company: CompanyInfo;
  categories: ServiceCategory[];
  heroImage: string;
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type Challenge = {
  icon: string;
  challenge: string;
  detail: string;
  response: string;
};

const challenges: Challenge[] = [
  {
    icon: "EyeOff",
    challenge: "Silent degradation",
    detail:
      "Cameras drift out of focus, switches run hot, drives quietly fail — and nobody notices until the moment evidence or uptime actually matters.",
    response:
      "Continuous monitoring catches the quiet failures before they become incidents, with alerts routed to engineers who already know your site.",
  },
  {
    icon: "Cpu",
    challenge: "Outdated firmware",
    detail:
      "Vendors release security patches regularly, but unpatched firewalls, NVRs and access controllers stay exposed for months — the most common cause of breaches.",
    response:
      "Firmware and patch management as a routine discipline, not an afterthought — so your perimeter hardens over time instead of weakening.",
  },
  {
    icon: "Bug",
    challenge: "No monitoring",
    detail:
      "When nothing is watching the watchers, a failed recorder or downed switch can sit unnoticed for weeks. By the time you find out, the footage is gone.",
    response:
      "Health checks across cameras, recorders, networks and endpoints — with a clear escalation path so issues reach the right engineer fast.",
  },
  {
    icon: "TimerReset",
    challenge: "Slow vendor response",
    detail:
      "Coordinating three vendors for one outage means finger-pointing and downtime. The CCTV team blames the network, the network team blames the firewall.",
    response:
      "One accountable partner across your full stack. We own the diagnosis end-to-end and dispatch the right specialist without you chasing vendors.",
  },
];

type Deliverable = {
  icon: string;
  title: string;
  description: string;
};

const deliverables: Deliverable[] = [
  {
    icon: "Activity",
    title: "Continuous Monitoring",
    description:
      "Automated health checks across networks, cameras, access control and endpoints — with alerts triaged by engineers who know your system.",
  },
  {
    icon: "Wrench",
    title: "Preventive Maintenance",
    description:
      "Scheduled site visits to clean, calibrate, test and re-secure equipment before wear and dust turn into failures.",
  },
  {
    icon: "Clock",
    title: "Priority Support (SLAs)",
    description:
      "Defined response and resolution targets, with a direct line to engineers — not a queue, not a ticket alone in the dark.",
  },
  {
    icon: "BarChart3",
    title: "Reporting & Visibility",
    description:
      "Plain-language reports on system health, incidents resolved, patches applied and recommendations — so you see the value, not just the invoice.",
  },
  {
    icon: "TrendingUp",
    title: "Continuous Improvement",
    description:
      "Quarterly reviews of your environment, risks and roadmap — so the system you bought this year still meets your needs in three.",
  },
  {
    icon: "ShieldCheck",
    title: "Firmware & Patch Management",
    description:
      "Tracked firmware versions, tested patches and a hardening schedule applied across firewalls, recorders, controllers and endpoints.",
  },
];

type PlanTier = {
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  popular?: boolean;
  features: string[];
  cta: string;
  highlight?: boolean;
};

const planTiers: PlanTier[] = [
  {
    name: "Essential",
    tagline: "Keep systems healthy",
    price: "Custom quote",
    priceNote: "Per site, per month",
    features: [
      "Scheduled preventive maintenance visits",
      "Remote health monitoring with alerts",
      "Firmware & patch management",
      "Standard response within 1 business day",
      "Quarterly system health report",
      "Discounted call-out rates",
    ],
    cta: "Request a plan",
  },
  {
    name: "Professional",
    tagline: "Most popular for growing sites",
    price: "Custom quote",
    priceNote: "Per site, per month",
    popular: true,
    highlight: true,
    features: [
      "Everything in Essential, plus:",
      "Priority response within 4 working hours",
      "On-site response within next business day",
      "Dedicated support engineer",
      "Remote remediation & live troubleshooting",
      "Monthly health & incident reporting",
      "Annual system review & roadmap",
    ],
    cta: "Request a plan",
  },
  {
    name: "Managed",
    tagline: "Full ownership of uptime",
    price: "Talk to us",
    priceNote: "Tailored engagement",
    features: [
      "Everything in Professional, plus:",
      "24/7 emergency support for managed clients",
      "Defined SLAs with escalation & on-call cover",
      "Dedicated account & technical lead",
      "Proactive capacity & risk planning",
      "Vendor liaison & warranty management",
      "Quarterly strategic business reviews",
    ],
    cta: "Request a plan",
  },
];

const supportCategories = [
  { icon: Network, label: "Networks & connectivity" },
  { icon: Lock, label: "Cybersecurity" },
  { icon: Camera, label: "CCTV & surveillance" },
  { icon: Fingerprint, label: "Access control" },
  { icon: Flame, label: "Fire & intrusion alarms" },
  { icon: ServerCog, label: "IT infrastructure" },
];

/* ------------------------------------------------------------------ */
/*  View                                                               */
/* ------------------------------------------------------------------ */

export function SupportView({ company, categories, heroImage }: SupportViewProps) {
  const heroBg = heroImage || HERO_IMAGE;
  return (
    <>
      <PageHero
        backgroundImage={heroBg}
        eyebrow="Maintenance & Support"
        title="Systems that keep working — because someone is looking after them"
        subtitle="The best systems are the ones that stay healthy. Our maintenance and managed-support plans keep your IT and security infrastructure reliable for years."
        icon={LifeBuoy}
        breadcrumb={[
          { label: "Home", view: "home" },
          { label: "Maintenance & Support" },
        ]}
      />

      <WhyMaintenanceMatters />
      <WhatsIncluded />
      <SupportPlans />
      <WhatWeSupport categories={categories} />
      <EmergencySupport company={company} />
      <ConversionPathCTA
        title="Let's keep your systems running"
        subtitle="One conversation with our engineering team is usually all it takes to scope a support plan that fits your site, risk profile and budget."
        phoneIntl={company.contact.phoneIntl}
        phoneDisplay={company.contact.phoneDisplay}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Why maintenance matters                                           */
/* ------------------------------------------------------------------ */

function WhyMaintenanceMatters() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Why maintenance matters"
        title="Equipment doesn't fail on a schedule — it fails in silence"
        subtitle="The gap between a system that works and one that looks like it works is measured in months of neglect. We close that gap before it costs you."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {challenges.map((c, i) => (
          <Reveal key={c.challenge} delay={i * 0.06}>
            <Card className="h-full overflow-hidden border-border/70 transition-all duration-300 hover:border-brand/40 hover:shadow-lg hover:shadow-emerald-500/5">
              <CardContent className="flex flex-col gap-5 p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <IconBadge icon={c.icon} variant="muted" />
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[0.62rem] font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        Challenge
                      </Badge>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold">
                      {c.challenge}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {c.detail}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl bg-emerald-50/50 p-4 dark:bg-emerald-500/[0.07]">
                  <IconBadge
                    icon="ShieldCheck"
                    variant="brand"
                    size="sm"
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                      Our response
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                      {c.response}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  What's included                                                   */
/* ------------------------------------------------------------------ */

function WhatsIncluded() {
  return (
    <Section className="bg-muted/30">
      <SectionHeader
        eyebrow="What's included"
        title="A complete maintenance discipline — not just a phone number"
        subtitle="Every support engagement covers the full lifecycle of your systems, from real-time monitoring to long-term improvement."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {deliverables.map((d, i) => (
          <Reveal key={d.title} delay={i * 0.05}>
            <Card className="h-full overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-emerald-500/5">
              <CardContent className="flex h-full flex-col p-6">
                <IconBadge icon={d.icon} variant="brand" />
                <h3 className="mt-5 font-display text-lg font-semibold leading-snug">
                  {d.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {d.description}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Support plans                                                     */
/* ------------------------------------------------------------------ */

function SupportPlans() {
  return (
    <Section className="band-ink relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-dark opacity-40" />
      <div className="absolute -right-32 -top-32 size-72 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative">
        <SectionHeader
          align="center"
          light
          eyebrow="Support plans"
          title="Plans that scale with your reliance on the system"
          subtitle="From basic preventive maintenance to fully managed uptime — pricing is tailored to your site count, equipment and risk profile. No invented figures, just honest scoping."
        />

        <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-3 lg:items-stretch">
          {planTiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.08}>
              <div
                className={
                  "relative flex h-full flex-col rounded-2xl border p-6 backdrop-blur transition-all sm:p-7 " +
                  (tier.highlight
                    ? "border-emerald-400/50 bg-white/[0.07] shadow-2xl shadow-emerald-500/10 lg:-mt-4 lg:mb-4"
                    : "border-white/10 bg-white/5 hover:border-emerald-400/30 hover:bg-white/[0.07]")
                }
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gold text-gold-foreground shadow-lg">
                      <Star className="mr-1 size-3 fill-current" />
                      Most popular
                    </Badge>
                  </div>
                )}

                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">
                      {tier.name}
                    </h3>
                    <p className="mt-1 text-sm text-white/60">{tier.tagline}</p>
                  </div>
                </div>

                <div className="mt-5 border-y border-white/10 py-4">
                  <div className="font-display text-2xl font-bold text-white">
                    {tier.price}
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-wide text-white/50">
                    {tier.priceNote}
                  </p>
                </div>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {tier.features.map((f, idx) => (
                    <li
                      key={idx}
                      className={
                        "flex items-start gap-2.5 text-sm " +
                        (f.endsWith("plus:")
                          ? "font-semibold text-emerald-300"
                          : "text-white/75")
                      }
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <NavButton
                    view="quote"
                    subject="Support plan enquiry"
                    variant={tier.highlight ? "default" : "outline"}
                    className={
                      "w-full " +
                      (tier.highlight
                        ? ""
                        : "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white")
                    }
                  >
                    {tier.cta}
                    <ArrowRight className="size-4" />
                  </NavButton>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-white/50">
          Not sure which tier fits? <NavLink
            view="contact"
            className="font-semibold text-emerald-300 underline-offset-4 hover:underline"
          >
            Talk to an engineer
          </NavLink>{" "}
          — we&apos;ll assess your environment and recommend the right level of cover.
        </p>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  What we support                                                   */
/* ------------------------------------------------------------------ */

function WhatWeSupport({ categories }: { categories: ServiceCategory[] }) {
  return (
    <Section>
      <SectionHeader
        eyebrow="What we support"
        title="One team, accountable across your full stack"
        subtitle="Every system we install is a system we can maintain. Across six service domains, you get a single partner who owns the diagnosis — no vendor tennis."
      />

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => (
          <Reveal key={cat.id} delay={i * 0.04}>
            <NavLink
              view="services"
              className="group flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md hover:shadow-emerald-500/5"
            >
              <IconBadge icon={cat.iconName} variant="brand" size="sm" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold leading-snug">
                  {cat.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {cat.tagline}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-brand/60 transition-transform group-hover:translate-x-1 group-hover:text-brand" />
            </NavLink>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        {supportCategories.map((c) => (
          <span
            key={c.label}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground"
          >
            <c.icon className="size-4 text-brand" />
            {c.label}
          </span>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Emergency support                                                 */
/* ------------------------------------------------------------------ */

function EmergencySupport({ company }: { company: CompanyInfo }) {
  return (
    <Section className="bg-muted/30">
      <Reveal>
        <Card className="overflow-hidden border-brand/20">
          <CardContent className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                <AlertTriangle className="size-3.5" />
                Emergency support
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                When a system goes down, every minute counts
              </h3>
              <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                If your cameras, firewall, access control or network has failed, call
                us directly. For managed-support clients, we provide{" "}
                <strong className="font-semibold text-foreground">
                  24/7 emergency response
                </strong>{" "}
                with defined escalation — so critical incidents don&apos;t wait for
                business hours.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`tel:${company.contact.phoneIntl}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-6 text-sm font-semibold text-brand-foreground shadow-lg shadow-emerald-900/20 transition-all hover:bg-brand/90"
                >
                  <PhoneCall className="size-4" />
                  {company.contact.phoneDisplay}
                </a>
                <a
                  href={`mailto:${company.contact.supportEmail}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <Mail className="size-4" />
                  {company.contact.supportEmail}
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-background/60 p-5">
                <IconBadge icon="Clock" variant="brand" size="sm" />
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Support hours
                </p>
                <p className="mt-1 font-display text-sm font-semibold leading-snug">
                  {company.contact.hours}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-5">
                <IconBadge icon="LifeBuoy" variant="gold" size="sm" />
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Managed clients
                </p>
                <p className="mt-1 font-display text-sm font-semibold leading-snug">
                  24/7 emergency cover with on-call engineers &amp; defined SLAs.
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-5 sm:col-span-2">
                <IconBadge icon="AlertTriangle" variant="muted" size="sm" />
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  If you&apos;re a managed-support client with an active incident
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                  Call the dedicated engineer line you were issued at onboarding. If
                  you can&apos;t reach them, call the main line and select the
                  emergency option — we&apos;ll route you immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </Section>
  );
}
