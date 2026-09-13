"use client";

import * as React from "react";
import {
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Target,
  CheckCircle2,
  PhoneCall,
  Building2,
  HelpCircle,
} from "lucide-react";
import {
  Section,
  SectionHeader,
  Reveal,
  Stagger,
  staggerItem,
  IconBadge,
  NavButton,
  NavLink,
} from "@/components/site/primitives";
import {
  PageHero,
  ConversionPathCTA,
  ServiceCard,
  ProjectCard,
} from "@/components/site/sections";
import { motion } from "framer-motion";
import { industryMap } from "@/lib/data/industries";
import { serviceMap } from "@/lib/data/services";
import { projectsByIndustry } from "@/lib/data/projects";
import { company } from "@/lib/data/company";

export function IndustryDetailView({ id }: { id?: string }) {
  const industry = id ? industryMap[id] : undefined;

  if (!industry) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <HelpCircle className="size-7 text-muted-foreground" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold">Industry not found</h1>
        <p className="mt-2 text-muted-foreground">
          The sector you’re looking for isn’t available. Browse all the industries we serve.
        </p>
        <NavButton view="industries" className="mt-6">
          <ArrowLeft className="size-4" />
          Back to industries
        </NavButton>
      </div>
    );
  }

  const sectorServices = industry.solutions
    .map((slug) => serviceMap[slug])
    .filter(Boolean);
  const sectorProjects = projectsByIndustry(industry.id);

  return (
    <>
      <PageHero
        eyebrow="Industry"
        title={industry.name}
        subtitle={industry.summary}
        icon={industry.icon}
        breadcrumb={[
          { label: "Home", view: "home" },
          { label: "Industries", view: "industries" },
          { label: industry.name },
        ]}
      />

      {/* Overview */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeader
              eyebrow={`About ${industry.name}`}
              title={`Security & technology for ${industry.name.toLowerCase()}`}
            />
            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
              {industry.summary} Our engineers understand the operational realities,
              risks and compliance demands of {industry.name.toLowerCase()} — and we tailor
              our six service domains accordingly.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <NavButton
                view="quote"
                subject={`${industry.name} — sector enquiry`}
                size="lg"
                className="bg-gold text-gold-foreground hover:bg-gold/90"
              >
                Request a sector assessment
                <ArrowRight className="size-4" />
              </NavButton>
              <NavButton view="contact" variant="outline" size="lg">
                <PhoneCall className="size-4" />
                Talk to an expert
              </NavButton>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="size-4 text-brand" />
                Sector snapshot
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Tailored services</dt>
                  <dd className="font-medium">{sectorServices.length}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Example projects</dt>
                  <dd className="font-medium">{sectorProjects.length}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Service domains</dt>
                  <dd className="font-medium">6</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </Section>

      {/* Challenges */}
      {industry.challenges.length > 0 && (
        <Section className="bg-muted/30">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeader
                eyebrow="The challenges"
                title={`What ${industry.name.toLowerCase()} face`}
                subtitle="The sector-specific risks and needs that shape how we design solutions for you."
              />
            </div>
            <div className="lg:col-span-8">
              <Stagger className="grid gap-4 sm:grid-cols-2">
                {industry.challenges.map((c, i) => (
                  <motion.div key={i} variants={staggerItem}>
                    <div className="flex h-full gap-3 rounded-xl border border-border/70 bg-card p-5">
                      <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-500" />
                      <p className="text-sm leading-relaxed text-foreground/90">{c}</p>
                    </div>
                  </motion.div>
                ))}
              </Stagger>
            </div>
          </div>
        </Section>
      )}

      {/* Tailored solutions (services) */}
      <Section>
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeader
            eyebrow="Tailored services"
            title={`Solutions we deploy for ${industry.name.toLowerCase()}`}
            subtitle="These are the services most relevant to your sector — each can be combined into an integrated solution."
          />
          <NavButton view="services" variant="outline" size="lg">
            All services
            <ArrowRight className="size-4" />
          </NavButton>
        </div>
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sectorServices.map((s) => (
            <motion.div key={s.slug} variants={staggerItem}>
              <ServiceCard service={s} />
            </motion.div>
          ))}
        </Stagger>
      </Section>

      {/* Outcomes */}
      <Section className="band-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="absolute right-1/4 top-0 size-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="relative">
          <SectionHeader
            align="center"
            light
            eyebrow="Outcomes"
            title={`What ${industry.name.toLowerCase()} gain`}
            subtitle="The practical results of engineering the right systems for your sector."
          />
          <Stagger className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2">
            {industry.outcomes.map((o, i) => (
              <motion.div key={i} variants={staggerItem}>
                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" />
                  <p className="text-sm leading-relaxed text-white/90">{o}</p>
                </div>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* Sector projects */}
      {sectorProjects.length > 0 && (
        <Section>
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeader
              eyebrow="Projects"
              title={`Representative work in ${industry.name.toLowerCase()}`}
              subtitle="A selection of engagements we've delivered in this sector."
            />
            <NavButton view="projects" variant="outline" size="lg">
              All projects
              <ArrowRight className="size-4" />
            </NavButton>
          </div>
          <Stagger className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sectorProjects.map((p) => (
              <motion.div key={p.id} variants={staggerItem}>
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </Stagger>
        </Section>
      )}

      <ConversionPathCTA />
    </>
  );
}
