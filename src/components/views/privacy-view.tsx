"use client";

import * as React from "react";
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  ChevronRight,
  Lock,
} from "lucide-react";
import {
  Section,
  Reveal,
  IconBadge,
  NavButton,
} from "@/components/site/primitives";
import { PageHero, ConversionPathCTA } from "@/components/site/sections";
import { Card, CardContent } from "@/components/ui/card";
import { privacyPolicy } from "@/lib/data/legal";
import { heroMedia } from "@/lib/data/media";
import { company } from "@/lib/data/company";

/** Build a stable, URL-safe id from a heading like "1. Information We Collect". */
function sectionId(heading: string, prefix: string) {
  const slug = heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${prefix}-${slug}`;
}

export function PrivacyView() {
  const ids = React.useMemo(
    () => privacyPolicy.sections.map((s) => sectionId(s.heading, "privacy")),
    [],
  );

  return (
    <>
      <PageHero
        backgroundImage={heroMedia["privacy"]}
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How we collect, use and protect your personal data when you interact with Allison Global — written plainly, not buried in legalese."
        icon={ShieldCheck}
        breadcrumb={[{ label: "Home", view: "home" }, { label: "Privacy Policy" }]}
      />

      {/* Main legal layout: prose + sticky sidebar */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
          {/* Prose column */}
          <div className="lg:col-span-2">
            <Reveal>
              <div className="max-w-3xl">
                <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
                  {privacyPolicy.intro}
                </p>
              </div>
            </Reveal>

            {privacyPolicy.sections.map((section, i) => (
              <Reveal key={section.heading} delay={0.04 * (i + 1)}>
                <section
                  id={ids[i]}
                  className="mt-10 scroll-mt-28 max-w-3xl"
                  aria-labelledby={`${ids[i]}-title`}
                >
                  <h2
                    id={`${ids[i]}-title`}
                    className="font-display text-xl font-bold tracking-tight sm:text-2xl"
                  >
                    {section.heading}
                  </h2>
                  <div className="mt-3 space-y-3">
                    {section.body.map((paragraph, p) => (
                      <p
                        key={p}
                        className="text-[0.975rem] leading-[1.75] text-muted-foreground"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}

            {/* Data rights CTA */}
            <Reveal>
              <Card className="mt-12 max-w-3xl overflow-hidden border-brand/20 bg-emerald-50/40 dark:bg-emerald-500/[0.06]">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <IconBadge icon={Lock} variant="brand" />
                    <div>
                      <h3 className="font-display text-lg font-semibold">
                        Need to exercise your data rights?
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Request access, correction, deletion or objection — just reach
                        out and we&apos;ll respond promptly.
                      </p>
                    </div>
                  </div>
                  <NavButton view="contact" className="shrink-0">
                    Get in touch
                    <ArrowRight className="size-4" />
                  </NavButton>
                </CardContent>
              </Card>
            </Reveal>
          </div>

          {/* Sticky sidebar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Reveal>
                <Card className="overflow-hidden border-border/70">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <IconBadge icon={ShieldCheck} variant="brand" size="sm" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Last updated
                        </p>
                        <p className="font-display text-sm font-semibold">
                          {privacyPolicy.updated}
                        </p>
                      </div>
                    </div>

                    <div className="my-6 h-px bg-border" />

                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                      On this page
                    </p>
                    <nav className="mt-3 space-y-1">
                      {privacyPolicy.sections.map((s, i) => (
                        <a
                          key={s.heading}
                          href={`#${ids[i]}`}
                          className="group flex items-start gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-brand/60 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                          <span className="leading-snug">{s.heading}</span>
                        </a>
                      ))}
                    </nav>

                    <div className="my-6 h-px bg-border" />

                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                      Questions about privacy?
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      We&apos;re happy to clarify any section or address a concern.
                    </p>

                    <div className="mt-4 space-y-2">
                      <NavButton view="contact" className="w-full">
                        Contact us
                        <ArrowRight className="size-4" />
                      </NavButton>
                      <a
                        href={`mailto:${company.contact.email}`}
                        className="flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand/40 hover:text-brand"
                      >
                        <Mail className="size-4" />
                        {company.contact.email}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    This policy is provided as a template and should be reviewed to
                    ensure it meets your specific legal obligations under the Nigeria
                    Data Protection Act and applicable regulations.
                  </p>
                </div>
              </Reveal>
            </div>
          </aside>
        </div>
      </Section>

      <ConversionPathCTA
        title="Still have questions?"
        subtitle="Our team will walk you through how your data is handled — clearly, with no fine print."
      />
    </>
  );
}
