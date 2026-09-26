"use client";

import { Building2 } from "lucide-react";
import {
  Section,
  SectionHeader,
  Reveal,
  Stagger,
  staggerItem,
  IconBadge,
} from "@/components/site/primitives";
import {
  PageHero,
  ConversionPathCTA,
  IndustryCard,
  StatStrip,
} from "@/components/site/sections";
import { motion } from "framer-motion";
import type { Industry, Stat } from "@/lib/types";

const HERO_IMAGE = "https://www.ui.com/microsite/static/networking-mobile-BFL4cCaR.jpg";

export interface IndustriesViewProps {
  industries: Industry[];
  capabilityStats: Stat[];
  heroImage: string;
}

export function IndustriesView({ industries, capabilityStats, heroImage }: IndustriesViewProps) {
  const heroBg = heroImage || HERO_IMAGE;

  if (industries.length === 0) {
    return (
      <>
        <PageHero
          backgroundImage={heroBg}
          eyebrow="Industries We Serve"
          title="Solutions engineered for your sector"
          subtitle="Different environments face different risks. We tailor our approach to the realities of your industry — from homes to heavy industry, from clinics to construction sites."
          breadcrumb={[{ label: "Home", view: "home" }, { label: "Industries" }]}
          icon={Building2}
        />

        <Section>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <Building2 className="size-8 text-muted-foreground/50" />
            <p className="mt-4 font-medium">No industries published yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back soon for sector-specific expertise.</p>
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
        eyebrow="Industries We Serve"
        title="Solutions engineered for your sector"
        subtitle="Different environments face different risks. We tailor our approach to the realities of your industry — from homes to heavy industry, from clinics to construction sites."
        breadcrumb={[{ label: "Home", view: "home" }, { label: "Industries" }]}
        icon={Building2}
      />

      {capabilityStats.length > 0 && (
        <Section className="band-ink relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-dark opacity-40" />
          <div className="relative">
            <StatStrip stats={capabilityStats} light />
          </div>
        </Section>
      )}

      <Section>
        <SectionHeader
          eyebrow="Sector expertise"
          title="One partner, many industries"
          subtitle="We serve thirteen sectors, each with distinct security, connectivity and compliance needs. Explore yours to see how we tailor our six service domains."
        />
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind) => (
            <motion.div key={ind.id} variants={staggerItem}>
              <IndustryCard industry={ind} />
            </motion.div>
          ))}
        </Stagger>
      </Section>

      {/* How we tailor */}
      <Section className="bg-muted/30">
        <SectionHeader
          eyebrow="Our approach"
          title="Tailored, not templated"
          subtitle="We don't apply the same package to every sector. Here's how we adapt across industries."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "Map", title: "Sector risk assessment", desc: "We assess the specific threats and compliance demands of your industry before recommending solutions." },
            { icon: "Layers", title: "Right-sized design", desc: "Solutions scaled to the environment — a home doesn't need an enterprise campus network, and a warehouse needs more than retail CCTV." },
            { icon: "Plug", title: "Integrated systems", desc: "Security, networking and IT designed to work together, not as disconnected purchases." },
            { icon: "LifeBuoy", title: "Sector-aware support", desc: "Maintenance and support that understands your operational realities and uptime needs." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-border/70 bg-card p-6">
                <IconBadge icon={item.icon} variant="brand" />
                <h3 className="mt-4 font-display text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <ConversionPathCTA />
    </>
  );
}
