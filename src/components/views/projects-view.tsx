"use client";

import * as React from "react";
import { Building2, Filter, CheckCircle2 } from "lucide-react";
import {
  Section,
  SectionHeader,
  Reveal,
  Stagger,
  staggerItem,
} from "@/components/site/primitives";
import {
  PageHero,
  ConversionPathCTA,
  ProjectCard,
  StatStrip,
} from "@/components/site/sections";
import { motion } from "framer-motion";
import type { Project, Industry, Service } from "@/lib/types";

const HERO_IMAGE = "https://www.ui.com/microsite/static/fedex-forum-poster-CWYupQKP.jpg";

export interface ProjectsViewProps {
  projects: Project[];
  industries: Industry[];
  services: Service[];
  heroImage: string;
}

export function ProjectsView({ projects, industries, services, heroImage }: ProjectsViewProps) {
  const heroBg = heroImage || HERO_IMAGE;
  const [filter, setFilter] = React.useState<string>("all");
  const [industryFilter, setIndustryFilter] = React.useState<string>("all");

  const projectCategories = React.useMemo(
    () => [...new Set(projects.map((p) => p.category))],
    [projects],
  );

  const filtered = React.useMemo(() => {
    return projects.filter((p) => {
      const catOk = filter === "all" || p.category === filter;
      const indOk = industryFilter === "all" || p.industry === industryFilter;
      return catOk && indOk;
    });
  }, [projects, filter, industryFilter]);

  const featured = projects.filter((p) => p.featured);

  if (projects.length === 0) {
    return (
      <>
        <PageHero
          backgroundImage={heroBg}
          eyebrow="Projects & Portfolio"
          title="Representative engagements"
          subtitle="A selection of the work we deliver across industries — each engineered, documented and supported as a complete system. Presented as representative case studies by sector and scope."
          breadcrumb={[{ label: "Home", view: "home" }, { label: "Projects" }]}
          icon={Building2}
        />

        <Section>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <Building2 className="size-8 text-muted-foreground/50" />
            <p className="mt-4 font-medium">No project case studies published yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back soon for representative engagements.</p>
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
        eyebrow="Projects & Portfolio"
        title="Representative engagements"
        subtitle="A selection of the work we deliver across industries — each engineered, documented and supported as a complete system. Presented as representative case studies by sector and scope."
        breadcrumb={[{ label: "Home", view: "home" }, { label: "Projects" }]}
        icon={Building2}
      />

      {/* Stats band */}
      <Section className="band-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="relative">
          <SectionHeader
            align="center"
            light
            eyebrow="Our work"
            title="Built across sectors and systems"
            subtitle="From single-site CCTV to multi-location, integrated security and IT infrastructure."
          />
          <div className="mt-12">
            <StatStrip
              stats={[
                { value: String(projects.length), label: "Representative case studies", sub: "across sectors" },
                { value: String(industries.length), label: "Industries served", sub: "homes to heavy industry" },
                { value: String(services.length), label: "Specialist services", sub: "deployed in the field" },
                { value: "6", label: "Service domains", sub: "under one team" },
              ]}
              light
            />
          </div>
        </div>
      </Section>

      {/* Featured */}
      {featured.length > 0 && (
        <Section>
          <SectionHeader
            eyebrow="Featured"
            title="Highlighted engagements"
            subtitle="A closer look at representative projects that show our integrated approach in action."
          />
          <Stagger className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <motion.div key={p.id} variants={staggerItem}>
                <ProjectCard project={p} imageUrl={p.imageQuery} />
              </motion.div>
            ))}
          </Stagger>
        </Section>
      )}

      {/* Filterable grid */}
      <Section className="bg-muted/30">
        <SectionHeader
          eyebrow="Browse all"
          title="Filter by category or industry"
          subtitle="Explore how we've addressed needs across service types and sectors."
        />

        {/* Filters */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Filter className="size-3.5" /> Category
            </span>
            <div className="flex flex-wrap gap-2">
              <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
                All
              </FilterPill>
              {projectCategories.map((c) => (
                <FilterPill key={c} active={filter === c} onClick={() => setFilter(c)}>
                  {c}
                </FilterPill>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Filter className="size-3.5" /> Industry
            </span>
            <div className="flex flex-wrap gap-2">
              <FilterPill active={industryFilter === "all"} onClick={() => setIndustryFilter("all")}>
                All
              </FilterPill>
              {industries.map((ind) => (
                <FilterPill
                  key={ind.id}
                  active={industryFilter === ind.id}
                  onClick={() => setIndustryFilter(ind.id)}
                >
                  {ind.name}
                </FilterPill>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <Stagger className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <motion.div key={p.id} variants={staggerItem}>
                <ProjectCard project={p} imageUrl={p.imageQuery} />
              </motion.div>
            ))}
          </Stagger>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <Filter className="size-8 text-muted-foreground/50" />
            <p className="mt-4 font-medium">No projects match these filters.</p>
            <button
              onClick={() => { setFilter("all"); setIndustryFilter("all"); }}
              className="mt-4 text-sm font-semibold text-brand hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </Section>

      {/* What every project includes */}
      <Section>
        <SectionHeader
          align="center"
          eyebrow="Our standard"
          title="Every project includes"
          subtitle="Regardless of size or sector, every engagement is delivered to the same engineering standard."
        />
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
          {[
            "Site assessment and engineered design",
            "Genuine, warrantied equipment",
            "Professional installation and commissioning",
            "As-built documentation and credentials",
            "Team training and operational runbook",
            "Post-handover support and maintenance options",
          ].map((item, i) => (
            <Reveal key={item} delay={i * 0.05}>
              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-5">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" />
                <p className="text-sm font-medium">{item}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <ConversionPathCTA />
    </>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full border px-4 py-2 text-xs font-medium transition-colors " +
        (active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}
