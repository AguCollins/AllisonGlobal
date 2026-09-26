"use client";

import * as React from "react";
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Building2,
} from "lucide-react";
import { resolveIcon } from "@/components/site/icon";
import {
  Section,
  SectionHeader,
  Stagger,
  staggerItem,
  NavButton,
} from "@/components/site/primitives";
import {
  PageHero,
  ConversionPathCTA,
  ServiceCard,
  ProjectCard,
  RemoteImage,
} from "@/components/site/sections";
import { motion } from "framer-motion";
import { RichTextContent } from "@/components/site/rich-text-content";
import type { Industry, Service, Project } from "@/lib/types";

export interface IndustryDetailViewProps {
  industry: Industry;
  services: Service[];
  projects: Project[];
  heroImage: string;
}

export function IndustryDetailView({
  industry,
  services,
  projects,
  heroImage: _heroImage,
}: IndustryDetailViewProps) {
  const sectorServices = React.useMemo(() => {
    const serviceMap = Object.fromEntries(services.map((s) => [s.slug, s])) as Record<
      string,
      Service
    >;
    return industry.solutions
      .map((slug) => serviceMap[slug])
      .filter(Boolean) as Service[];
  }, [industry.solutions, services]);

  const sectorProjects = React.useMemo(
    () => projects.filter((p) => p.industry === industry.id),
    [projects, industry.id],
  );

  const HeroIcon = resolveIcon(industry.iconName);

  return (
    <>
      <PageHero
        eyebrow="Industry"
        title={industry.name}
        subtitle={<RichTextContent content={industry.summary} />}
        icon={HeroIcon}
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
              <RichTextContent content={industry.summary} /> Our engineers understand the operational realities,
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
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
              <div className="relative aspect-[4/3] bg-muted">
                <RemoteImage
                  src={industry.imageQuery}
                  alt={`${industry.name} — representative solution Allison Global deploys`}
                  className="size-full"
                  imgClassName="object-contain p-6"
                  query={industry.id}
                />
              </div>
              <div className="p-6">
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
      {sectorServices.length > 0 && (
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
      )}

      {/* Outcomes */}
      {industry.outcomes.length > 0 && (
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
      )}

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
                <ProjectCard project={p} imageUrl={p.imageQuery} />
              </motion.div>
            ))}
          </Stagger>
        </Section>
      )}

      <ConversionPathCTA />
    </>
  );
}
