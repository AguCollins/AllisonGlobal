"use client";

import {
  Building2,
  Map as MapIcon,
  Layers as LayersIcon,
  Plug as PlugIcon,
  LifeBuoy as LifeBuoyIcon,
} from "lucide-react";
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
import { industries } from "@/lib/data/industries";
import { heroMedia } from "@/lib/data/media";
import { capabilityStats } from "@/lib/data/company";

export function IndustriesView() {
  return (
    <>
      <PageHero
        backgroundImage={heroMedia["industries"]}
        eyebrow="Industries We Serve"
        title="Solutions engineered for your sector"
        subtitle="Different environments face different risks. We tailor our approach to the realities of your industry — from homes to heavy industry, from clinics to construction sites."
        breadcrumb={[{ label: "Home", view: "home" }, { label: "Industries" }]}
        icon={Building2}
      />

      <Section className="band-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="relative">
          <StatStrip stats={capabilityStats} light />
        </div>
      </Section>

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
            { icon: MapIcon, title: "Sector risk assessment", desc: "We assess the specific threats and compliance demands of your industry before recommending solutions." },
            { icon: LayersIcon, title: "Right-sized design", desc: "Solutions scaled to the environment — a home doesn't need an enterprise campus network, and a warehouse needs more than retail CCTV." },
            { icon: PlugIcon, title: "Integrated systems", desc: "Security, networking and IT designed to work together, not as disconnected purchases." },
            { icon: LifeBuoyIcon, title: "Sector-aware support", desc: "Maintenance and support that understands your operational realities and uptime needs." },
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
