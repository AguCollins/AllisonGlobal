"use client";

import * as React from "react";
import {
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";
import { Icon } from "@/components/site/icon";
import {
  Section,
  SectionHeader,
  Reveal,
  Stagger,
  staggerItem,
  IconBadge,
  NavButton,
} from "@/components/site/primitives";
import {
  PageHero,
  ConversionPathCTA,
  ServiceCard,
  StatStrip,
} from "@/components/site/sections";
import { motion } from "framer-motion";
import { RichTextContent } from "@/components/site/rich-text-content";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ServiceCategory, Service, Stat } from "@/lib/types";

const HERO_IMAGE = "https://www.ui.com/microsite/static/cloud-gateway-max-PgX67pU8.png";

export interface ServicesViewProps {
  categories: ServiceCategory[];
  services: Service[];
  capabilityStats: Stat[];
  heroImage: string;
}

export function ServicesView({ categories, services, capabilityStats, heroImage }: ServicesViewProps) {
  const heroBg = heroImage || HERO_IMAGE;
  const [activeCat, setActiveCat] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  const categoryMap = React.useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])) as Record<string, ServiceCategory>,
    [categories],
  );

  // Group services by category. DB-loaded categories may have an empty
  // `services: string[]` array, so we also match by `service.categoryId`.
  const servicesByCategoryId = React.useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const cat of categories) {
      const direct = (cat.services ?? [])
        .map((slug) => services.find((s) => s.slug === slug))
        .filter(Boolean) as Service[];
      const byCatId = services.filter((s) => s.categoryId === cat.id);
      // Merge + dedupe by slug
      const merged = new Map<string, Service>();
      for (const s of [...direct, ...byCatId]) merged.set(s.slug, s);
      map.set(cat.id, Array.from(merged.values()));
    }
    return map;
  }, [categories, services]);

  const filtered = React.useMemo(() => {
    return services.filter((s) => {
      const catOk = activeCat === "all" || s.categoryId === activeCat;
      const q = query.trim().toLowerCase();
      const qOk =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [services, activeCat, query]);

  // Smooth scroll to category anchor if coming from nav
  React.useEffect(() => {
    const hash = window.location.hash;
    // anchor-based scroll handled by store; here we just support hash on mount
    if (hash) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <>
      <PageHero
        backgroundImage={heroBg}
        eyebrow="Our Services"
        title="One team. The full ICT & security stack."
        subtitle="From structured cabling to cybersecurity, CCTV to fire safety, access control to managed IT — six domains, twenty-six specialist services, engineered together under one accountable partner."
        breadcrumb={[{ label: "Home", view: "home" }, { label: "Services" }]}
      />

      {/* Capability band */}
      {capabilityStats.length > 0 && (
        <Section className="band-ink relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-dark opacity-40" />
          <div className="relative">
            <StatStrip stats={capabilityStats} light />
          </div>
        </Section>
      )}

      {/* Filter + search */}
      <Section>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <SectionHeader
              eyebrow="Browse services"
              title="Find the service that fits your need"
              subtitle="Filter by domain or search. Every service links to a detailed page — the problem, the solution, what we deliver, and the benefits."
              className="max-w-2xl"
            />
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services…"
                className="pl-9"
                aria-label="Search services"
              />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCat("all")}
              className={
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors " +
                (activeCat === "all"
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground")
              }
            >
              All services ({services.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCat(cat.id);
                  const el = document.getElementById(`cat-${cat.id}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors " +
                  (activeCat === cat.id
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground")
                }
              >
                <Icon name={cat.iconName} className="size-3.5" />
                {cat.name} ({(servicesByCategoryId.get(cat.id) ?? []).length})
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Services by category */}
      {activeCat === "all" ? (
        <>
          {categories.map((cat) => (
            <CategoryBlock
              key={cat.id}
              category={cat}
              services={servicesByCategoryId.get(cat.id) ?? []}
            />
          ))}
        </>
      ) : (
        <Section className="pt-0">
          <div className="mb-8 flex items-center gap-3">
            {(() => {
              const cat = categoryMap[activeCat];
              return cat ? (
                <>
                  <IconBadge icon={cat.iconName} variant="brand" size="lg" />
                  <div>
                    <h2 className="font-display text-2xl font-bold">{cat.name}</h2>
                    <p className="text-sm text-brand">{cat.tagline}</p>
                  </div>
                </>
              ) : null;
            })()}
          </div>
          {filtered.length > 0 ? (
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <motion.div key={s.slug} variants={staggerItem}>
                  <ServiceCard service={s} categoryName={categoryMap[s.categoryId]?.name} />
                </motion.div>
              ))}
            </Stagger>
          ) : (
            <EmptyState query={query} onReset={() => { setQuery(""); setActiveCat("all"); }} />
          )}
        </Section>
      )}

      {/* Cross-sell: solutions + industries */}
      <Section className="bg-muted/30">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-8">
              <SectionHeader
                eyebrow="Solutions by outcome"
                title="Not sure where to start?"
                subtitle="Explore bundled solutions that solve common problems across our domains."
              />
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="outline">Unified Security</Badge>
                <Badge variant="outline">Resilient Network</Badge>
                <Badge variant="outline">Cyber Defence</Badge>
                <Badge variant="outline">Life Safety</Badge>
                <Badge variant="outline">Smart Building</Badge>
                <Badge variant="outline">Managed IT</Badge>
              </div>
              <div className="mt-auto pt-6">
                <NavButton view="solutions">
                  Browse solutions
                  <ArrowRight className="size-4" />
                </NavButton>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-8">
              <SectionHeader
                eyebrow="Industry expertise"
                title="Built for your sector"
                subtitle="Different environments face different risks. See how we tailor our approach to your industry."
              />
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="outline">Residential</Badge>
                <Badge variant="outline">Corporate</Badge>
                <Badge variant="outline">Healthcare</Badge>
                <Badge variant="outline">Hospitality</Badge>
                <Badge variant="outline">Industrial</Badge>
                <Badge variant="outline">Finance</Badge>
              </div>
              <div className="mt-auto pt-6">
                <NavButton view="industries">
                  View industries
                  <ArrowRight className="size-4" />
                </NavButton>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <ConversionPathCTA />
    </>
  );
}

function CategoryBlock({ category, services: catServices }: {
  category: ServiceCategory;
  services: Service[];
}) {
  if (catServices.length === 0) return null;
  const cat = category;

  return (
    <Section id={`cat-${cat.id}`} className="scroll-mt-28 pt-0">
      <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-muted/40 to-background p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <IconBadge icon={cat.iconName} variant="brand" size="lg" />
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">{cat.name}</h2>
              <p className="mt-1 text-sm font-medium text-brand">{cat.tagline}</p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                <RichTextContent content={cat.description} />
              </p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {catServices.length} services
          </div>
        </div>

        <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {catServices.map((s) => (
            <motion.div key={s.slug} variants={staggerItem}>
              <ServiceCard service={s} />
            </motion.div>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}

function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
      <Filter className="size-8 text-muted-foreground/50" />
      <p className="mt-4 font-medium">No services match “{query}”.</p>
      <p className="mt-1 text-sm text-muted-foreground">Try a different search or browse all services.</p>
      <Button variant="outline" className="mt-4" onClick={onReset}>
        Show all services
      </Button>
    </div>
  );
}
