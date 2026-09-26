"use client";

import * as React from "react";
import {
  ClipboardList,
  Check,
  ArrowRight,
  Handshake,
} from "lucide-react";
import {
  Section,
  SectionHeader,
  Reveal,
  IconBadge,
  NavButton,
} from "@/components/site/primitives";
import { PageHero, ConversionPathCTA } from "@/components/site/sections";
import type { ProcessStepRecord } from "@/lib/data-access";

const HERO_IMAGE = "https://www.ui.com/microsite/static/rack-D_Hb7KFT.jpg";

export interface ProcessViewProps {
  steps: ProcessStepRecord[];
  heroImage: string;
}

/* ------------------------------------------------------------------ */
/*  ProcessView                                                        */
/* ------------------------------------------------------------------ */
export function ProcessView({ steps, heroImage }: ProcessViewProps) {
  const heroBg = heroImage || HERO_IMAGE;
  return (
    <>
      <PageHero
        backgroundImage={heroBg}
        eyebrow="Our Process"
        title="A process built for outcomes, not transactions"
        subtitle="Every engagement follows the same engineering-led path — from understanding your site to supporting it for years after."
        icon={ClipboardList}
        breadcrumb={[
          { label: "Home", view: "home" },
          { label: "Process" },
        ]}
      />
      <ProcessTimeline steps={steps} />
      <WhyThisMatters />
      <HandoverDeliverables />
      <ConversionPathCTA />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Process timeline — vertical connected timeline                    */
/* ------------------------------------------------------------------ */
function ProcessTimeline({ steps }: { steps: ProcessStepRecord[] }) {
  return (
    <Section>
      <SectionHeader
        eyebrow="The six-step path"
        title="From first walk-through to long-term partnership"
        subtitle="Every step is documented and accountable — so you always know what was done, why, and what happens next."
      />

      <ol className="mt-14 space-y-6 lg:space-y-8">
        {steps.map((step, i) => (
          <Reveal as="li" key={step.id} delay={i * 0.04}>
            <TimelineStep step={step} isLast={i === steps.length - 1} />
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

function TimelineStep({
  step,
  isLast,
}: {
  step: ProcessStepRecord;
  isLast: boolean;
}) {
  return (
    <div className="relative grid gap-6 lg:grid-cols-12 lg:gap-8">
      {/* Left rail — number + connector */}
      <div className="lg:col-span-3">
        <div className="flex items-start gap-4 lg:flex-col lg:items-end lg:gap-3 lg:text-right">
          <div className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-lg shadow-emerald-500/20">
            <span className="font-display text-xl font-bold">
              {String(step.step).padStart(2, "0")}
            </span>
          </div>
          <div className="lg:order-first">
            <IconBadge
              icon={step.iconName}
              variant="outline"
              size="md"
              className="lg:hidden"
            />
            <div className="hidden lg:block">
              <IconBadge icon={step.iconName} variant="outline" size="md" />
            </div>
          </div>
          {/* Vertical connector */}
          {!isLast && (
            <span
              aria-hidden
              className="absolute left-7 top-14 hidden h-[calc(100%-3.5rem)] w-px bg-gradient-to-b from-brand/40 to-transparent lg:block"
            />
          )}
        </div>
      </div>

      {/* Right — content card */}
      <div className="lg:col-span-9">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
          <div className="grid gap-0 lg:grid-cols-12">
            {/* Header + description */}
            <div className="lg:col-span-7 lg:border-r lg:border-border/70">
              <div className="p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="lg:hidden">
                    <IconBadge icon={step.iconName} variant="brand" size="md" />
                  </span>
                  <h3 className="font-display text-xl font-bold leading-tight sm:text-2xl">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm font-medium text-brand">
                  {step.summary}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>

                {/* Deliverable highlight */}
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    <Check className="size-4.5" />
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                      Deliverable
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-foreground">
                      {step.deliverable}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="bg-muted/30 lg:col-span-5">
              <div className="p-6 sm:p-7">
                <div className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  What we do
                </div>
                <ul className="mt-4 space-y-2.5">
                  {step.activities.map((a) => (
                    <li
                      key={a}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Why this matters — 3 short points                                  */
/* ------------------------------------------------------------------ */
function WhyThisMatters() {
  const points: {
    icon: string;
    title: string;
    description: string;
  }[] = [
    {
      icon: "ShieldCheck",
      title: "No surprises",
      description:
        "Because we assess, design and document before we install, you know the scope, the cost and the outcome up front — not after the bill arrives.",
    },
    {
      icon: "Layers",
      title: "Transferable systems",
      description:
        "As-built drawings, credentials and runbooks mean your systems can be managed by us, your team, or any engineer who follows — without reverse-engineering them.",
    },
    {
      icon: "RefreshCw",
      title: "Long-term value",
      description:
        "Preventive maintenance, monitoring and continuous improvement protect your investment for years — instead of replacing systems that quietly degraded.",
    },
  ];

  return (
    <Section className="bg-muted/30">
      <SectionHeader
        align="center"
        eyebrow="Why this matters"
        title="An engineering-led process pays off for years"
        subtitle="Process is the difference between a project that works on day one and one that still works on day one thousand."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {points.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.06}>
            <div className="h-full rounded-2xl border border-border/70 bg-card p-6">
              <IconBadge icon={p.icon} variant="brand" />
              <h3 className="mt-4 font-display text-lg font-semibold">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Handover deliverables — 6 items with icons                         */
/* ------------------------------------------------------------------ */
function HandoverDeliverables() {
  const deliverables: {
    icon: string;
    title: string;
    description: string;
  }[] = [
    {
      icon: "FileText",
      title: "As-built documentation",
      description:
        "Recorded drawings and configurations showing exactly what was installed — not what was planned, what was actually deployed.",
    },
    {
      icon: "GitBranch",
      title: "System diagrams",
      description:
        "Network topology, camera coverage maps, access-control zones and alarm logic — clear diagrams your team and ours can both work from.",
    },
    {
      icon: "KeyRound",
      title: "Credentials & access",
      description:
        "All admin credentials, IP plans and serial registers handed over securely — never held hostage by the installer.",
    },
    {
      icon: "CalendarClock",
      title: "Maintenance schedule",
      description:
        "A clear preventive maintenance plan — what gets checked, when, and by whom — so your system stays reliable, not just installed.",
    },
    {
      icon: "GraduationCap",
      title: "Team training",
      description:
        "Hands-on walkthroughs and a runbook so your team can operate the system day-to-day, handle common tasks, and know when to call us.",
    },
    {
      icon: "Headset",
      title: "Support agreement",
      description:
        "A defined support arrangement with response-time targets, escalation paths and a direct line to engineers who know your site.",
    },
  ];

  return (
    <Section>
      <SectionHeader
        eyebrow="What you receive at handover"
        title="Handover is a milestone, not a goodbye"
        subtitle="When we hand a system over, you receive everything required to operate, maintain and trust it — documented, transferred and supported."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {deliverables.map((d, i) => (
          <Reveal key={d.title} delay={i * 0.05}>
            <div className="group h-full rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-emerald-500/5">
              <IconBadge icon={d.icon} variant="brand" />
              <h3 className="mt-4 font-display text-lg font-semibold leading-snug">
                {d.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {d.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-border/70 bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-brand ring-1 ring-emerald-500/15">
            <Handshake className="size-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">
              Ready to start with an assessment?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The first step is always a no-obligation site walk-through and
              conversation about your risks and goals.
            </p>
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <NavButton view="quote">
            Request a quote
            <ArrowRight className="size-4" />
          </NavButton>
          <NavButton view="contact" variant="outline">
            Talk to an expert
          </NavButton>
        </div>
      </div>
    </Section>
  );
}
