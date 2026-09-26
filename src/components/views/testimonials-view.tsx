"use client";

import * as React from "react";
import {
  Quote,
  Star,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  Section,
  SectionHeader,
  Reveal,
  IconBadge,
  NavButton,
  NavLink,
} from "@/components/site/primitives";
import {
  PageHero,
  ConversionPathCTA,
  StatStrip,
} from "@/components/site/sections";
import { RichTextContent } from "@/components/site/rich-text-content";
import type { Testimonial, Industry, Stat } from "@/lib/types";

const HERO_IMAGE = "https://www.ui.com/microsite/static/networking-mobile-BFL4cCaR.jpg";

export interface TestimonialsViewProps {
  testimonials: Testimonial[];
  industries: Industry[];
  heroImage: string;
}

/**
 * Visual presentation of the operating commitments behind every engagement.
 * Hardcoded here intentionally — these are marketing/presentation values,
 * not CMS-managed content. They don't belong in the database.
 */
const testimonialStats: Stat[] = [
  { value: "98%", label: "would recommend us to another business", sub: "based on representative client feedback" },
  { value: "< 4h", label: "target priority support response", sub: "for managed-support clients" },
  { value: "100%", label: "documented handovers", sub: "as-built docs on every project" },
  { value: "1", label: "accountable partner", sub: "across ICT, network & security" },
];

/* ------------------------------------------------------------------ */
/*  View                                                               */
/* ------------------------------------------------------------------ */
export function TestimonialsView({ testimonials, industries, heroImage }: TestimonialsViewProps) {
  const heroBg = heroImage || HERO_IMAGE;
  const industryMap = React.useMemo(
    () => Object.fromEntries(industries.map((i) => [i.id, i])) as Record<string, Industry>,
    [industries],
  );

  // Sectors that actually appear in the testimonials, prioritised
  const sectorIds = Array.from(new Set(testimonials.map((t) => t.sector)));
  const sectorsServed = sectorIds
    .map((id) => industryMap[id])
    .filter(Boolean)
    .slice(0, 8);
  // Fallback to the first industries if we don't yet cover 6
  const exploreSectors =
    sectorsServed.length >= 6
      ? sectorsServed
      : industries.slice(0, 8);

  if (testimonials.length === 0) {
    return (
      <>
        <PageHero
          backgroundImage={heroBg}
          eyebrow="Client Feedback"
          icon={Quote}
          title="What working with us feels like"
          subtitle="Representative feedback from the clients and sectors we serve — presented by role and industry rather than as manufactured named endorsements. Real signal, not invented social proof."
          breadcrumb={[
            { label: "Home", view: "home" },
            { label: "Testimonials" },
          ]}
        />
        <Section>
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
            No testimonials published yet. Check back soon for client feedback.
          </div>
        </Section>
        <ConversionPathCTA />
      </>
    );
  }

  return (
    <>
      <PageHero
        backgroundImage={heroBg}
        eyebrow="Client Feedback"
        icon={Quote}
        title="What working with us feels like"
        subtitle="Representative feedback from the clients and sectors we serve — presented by role and industry rather than as manufactured named endorsements. Real signal, not invented social proof."
        breadcrumb={[
          { label: "Home", view: "home" },
          { label: "Testimonials" },
        ]}
      />

      {/* Masonry of testimonials */}
      <Section>
        <SectionHeader
          eyebrow="In their words"
          title="Honest accounts of the engagements we deliver"
          subtitle="Each story reflects the kind of outcome we engineer for that sector — what changed, what got easier, what stopped being a worry."
        />

        <div className="mt-12 columns-1 gap-5 md:columns-2 lg:columns-3">
          {testimonials.map((t, i) => {
            const sector = industryMap[t.sector];
            return (
              <Reveal
                key={t.id}
                delay={(i % 3) * 0.06}
                y={0}
                className="mb-5 break-inside-avoid"
              >
                <figure className="group flex flex-col rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:border-brand/40 hover:shadow-xl hover:shadow-emerald-500/5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          className="size-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <Quote className="size-7 text-brand/25 transition-colors group-hover:text-brand/40" />
                  </div>

                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                    “<RichTextContent content={t.quote} />”
                  </blockquote>

                  <figcaption className="mt-5 border-t border-border pt-4">
                    <div className="text-sm font-semibold text-foreground">
                      {t.authorRole}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      {sector && (
                        <NavLink
                          view="industry-detail"
                          slug={sector.id}
                          className="font-medium text-brand transition-colors hover:text-brand-dark"
                        >
                          {sector.name}
                        </NavLink>
                      )}
                      <span className="text-border">·</span>
                      <span>{t.projectType}</span>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* By the numbers — dark */}
      <Section className="band-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="absolute left-1/2 top-0 size-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <SectionHeader
            align="center"
            light
            eyebrow="By the numbers"
            title="The standards we hold ourselves to"
            subtitle="Feedback is one signal. These are the operating commitments behind every engagement we deliver."
          />
          <div className="mt-12">
            <StatStrip stats={testimonialStats} light />
          </div>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-300" />
              One accountable partner
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-300" />
              Documented every time
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-300" />
              Supported long after handover
            </span>
          </div>
        </div>
      </Section>

      {/* Explore by sector */}
      <Section>
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeader
            eyebrow="Explore by sector"
            title="See how we work in your industry"
            subtitle="Different environments face different risks. Find the sector that matches yours and see the engineering approach we'd take."
          />
          <NavButton view="industries" variant="outline" size="lg">
            All industries
            <ArrowRight className="size-4" />
          </NavButton>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {exploreSectors.map((ind, i) => (
            <Reveal key={ind.id} delay={(i % 4) * 0.05}>
              <NavLink
                view="industry-detail"
                slug={ind.id}
                className="group flex h-full items-start gap-3 rounded-2xl border border-border/70 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <IconBadge icon={ind.iconName} variant="outline" size="sm" />
                <div className="flex-1">
                  <div className="font-display text-sm font-semibold leading-snug">
                    {ind.name}
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {ind.tagline}
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-brand" />
              </NavLink>
            </Reveal>
          ))}
        </div>
      </Section>

      <ConversionPathCTA />
    </>
  );
}
