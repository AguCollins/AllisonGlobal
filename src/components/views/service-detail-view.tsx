"use client";

import * as React from "react";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  PackageCheck,
  Sparkles,
  PhoneCall,
  Layers,
  Building2,
} from "lucide-react";
import { Icon } from "@/components/site/icon";
import { RichTextContent } from "@/components/site/rich-text-content";
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
  ServiceCard,
  IndustryCard,
  RemoteImage,
} from "@/components/site/sections";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { Service, ServiceCategory, Industry } from "@/lib/types";
import type { ProcessStepRecord, CompanyInfo } from "@/lib/data-access";

const SERVICE_IMAGE = "https://www.ui.com/microsite/static/industry-leading-CgUA2mbS.webp";

export interface ServiceDetailViewProps {
  service: Service;
  relatedServices: Service[];
  categories: ServiceCategory[];
  industries: Industry[];
  processSteps: ProcessStepRecord[];
  company: CompanyInfo;
  heroImage: string;
}

export function ServiceDetailView({
  service,
  relatedServices,
  categories,
  industries,
  processSteps,
  company,
  heroImage: _heroImage,
}: ServiceDetailViewProps) {
  const categoryMap = React.useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])) as Record<string, ServiceCategory>,
    [categories],
  );
  const industryMap = React.useMemo(
    () => Object.fromEntries(industries.map((i) => [i.id, i])) as Record<string, Industry>,
    [industries],
  );

  const category = categoryMap[service.categoryId];
  const rel = relatedServices;
  const relIndustries = service.relatedIndustries
    .map((id) => industryMap[id])
    .filter(Boolean) as Industry[];
  // Defensive cast: the DB-backed Service may eventually expose imageQuery /
  // imageUrl via the data-access mapService. Until then, this falls back to
  // a representative equipment image (matches the prior static behaviour).
  const serviceImage =
    (service as Service & { imageQuery?: string }).imageQuery || SERVICE_IMAGE;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden band-ink">
        <div className="absolute inset-0 bg-grid-dark opacity-50" />
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 size-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-white/50">
            <NavLink view="home" className="transition-colors hover:text-white">Home</NavLink>
            <span className="text-white/30">/</span>
            <NavLink view="services" className="transition-colors hover:text-white">Services</NavLink>
            <span className="text-white/30">/</span>
            <NavLink view="services" params={{ anchor: `cat-${service.categoryId}` }} className="transition-colors hover:text-white">
              {category?.name}
            </NavLink>
            <span className="text-white/30">/</span>
            <span className="text-white/80">{service.name}</span>
          </nav>

          <div className="grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300 backdrop-blur">
                <Icon name={service.iconName} className="size-3.5" />
                {category?.name}
              </div>
              <h1 className="text-balance text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                {service.name}
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/70">
                {service.tagline}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <NavButton
                  view="quote"
                  subject={`${service.name} enquiry`}
                  size="lg"
                  className="bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  Request this service
                  <ArrowRight className="size-4" />
                </NavButton>
                <NavButton view="contact" variant="outline" size="lg" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                  <PhoneCall className="size-4" />
                  Talk to an expert
                </NavButton>
              </div>
            </div>

            {/* Side card */}
            <div className="lg:col-span-4">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
                <div className="relative aspect-[4/3] bg-white/5">
                  <RemoteImage
                    src={serviceImage}
                    alt={`${service.name} — representative equipment Allison Global deploys`}
                    className="size-full"
                    imgClassName="object-contain p-6"
                    query={service.slug}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-xs text-white/70">
                    Representative equipment from platforms we deploy
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Sparkles className="size-4 text-amber-300" />
                    At a glance
                  </div>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-white/50">Category</dt>
                      <dd className="text-right font-medium text-white/90">{category?.name}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-white/50">Related services</dt>
                      <dd className="text-right font-medium text-white/90">{service.relatedServices.length}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-white/50">Industries served</dt>
                      <dd className="text-right font-medium text-white/90">{service.relatedIndustries.length}+</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-white/50">Response</dt>
                      <dd className="text-right font-medium text-white/90">&lt; 4h priority</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeader
              eyebrow="Overview"
              title={`What is ${service.name.toLowerCase()}?`}
            />
            <div className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
              <RichTextContent content={service.overview} />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {service.tech.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <PhoneCall className="size-4 text-brand" />
                Questions about this service?
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Speak with an engineer who knows this domain — no obligation.
              </p>
              <div className="mt-4 space-y-2">
                <NavButton view="contact" variant="default" className="w-full">
                  Talk to an expert
                </NavButton>
                <a
                  href={`tel:${company.contact.phoneIntl}`}
                  className="block text-center text-sm font-semibold text-brand hover:underline"
                >
                  {company.contact.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* The problem */}
      {service.problem.length > 0 && (
        <Section className="bg-muted/30">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeader
                eyebrow="The problem"
                title="Common challenges we solve"
                subtitle="These are the pain points that bring clients to this service — and the reasons DIY or piecemeal approaches fall short."
              />
            </div>
            <div className="lg:col-span-8">
              <Stagger className="grid gap-4 sm:grid-cols-2">
                {service.problem.map((p, i) => (
                  <motion.div key={i} variants={staggerItem}>
                    <div className="flex h-full gap-3 rounded-xl border border-border/70 bg-card p-5">
                      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
                      <p className="text-sm leading-relaxed text-foreground/90">{p}</p>
                    </div>
                  </motion.div>
                ))}
              </Stagger>
            </div>
          </div>
        </Section>
      )}

      {/* The solution */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="sticky top-28">
              <SectionHeader
                eyebrow="The solution"
                title="How we approach it"
              />
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-brand/20 bg-emerald-50 p-5 dark:bg-emerald-500/10">
                <Lightbulb className="mt-0.5 size-5 shrink-0 text-brand" />
                <p className="text-sm leading-relaxed text-foreground/90">
                  <RichTextContent content={service.solution} />
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <SectionHeader
              eyebrow="What we deliver"
              title="What's included"
              subtitle="Every engagement is documented, tested and handed over — not just installed."
            />
            <Stagger className="mt-6 grid gap-4">
              {service.deliverables.map((d, i) => (
                <motion.div key={i} variants={staggerItem}>
                  <div className="flex gap-4 rounded-xl border border-border/70 bg-card p-5 transition-colors hover:border-brand/30">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 font-display text-sm font-bold text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="font-display text-base font-semibold">{d.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </div>
      </Section>

      {/* Benefits */}
      <Section className="band-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="absolute right-1/4 top-0 size-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="relative">
          <SectionHeader
            align="center"
            light
            eyebrow="Benefits"
            title="What you gain"
            subtitle="The practical, measurable outcomes this service delivers for your organisation."
          />
          <Stagger className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2">
            {service.benefits.map((b, i) => (
              <motion.div key={i} variants={staggerItem}>
                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" />
                  <p className="text-sm leading-relaxed text-white/90">{b}</p>
                </div>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* Process mini */}
      <Section>
        <SectionHeader
          eyebrow="Our process"
          title="How this engagement works"
          subtitle="The same engineering-led process applies — adapted to the scope of this service."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {processSteps.map((step, i) => {
            return (
              <Reveal key={step.id} delay={i * 0.04}>
                <div className="flex h-full gap-4 rounded-xl border border-border/70 bg-card p-5">
                  <IconBadge icon={step.iconName} variant="outline" size="sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand">
                        Step {step.step}
                      </span>
                    </div>
                    <h3 className="mt-0.5 font-display text-sm font-semibold">{step.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.summary}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-6 text-center">
          <NavButton view="process" variant="outline">
            See the full process
            <ArrowRight className="size-4" />
          </NavButton>
        </div>
      </Section>

      {/* FAQs */}
      {service.faqs && service.faqs.length > 0 && (
        <Section className="bg-muted/30">
          <SectionHeader
            eyebrow="FAQs"
            title={`Questions about ${service.name.toLowerCase()}`}
          />
          <div className="mx-auto mt-8 max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {service.faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>
      )}

      {/* Related services — cross-sell */}
      {rel.length > 0 && (
        <Section>
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeader
              eyebrow="Related services"
              title="Often needed together"
              subtitle="Clients who choose this service frequently benefit from these complementary solutions — engineered to integrate, not just coexist."
            />
            <NavButton view="solutions" variant="outline" size="lg">
              <Layers className="size-4" />
              See bundled solutions
            </NavButton>
          </div>
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rel.map((s) => (
              <motion.div key={s.slug} variants={staggerItem}>
                <ServiceCard service={s} categoryName={categoryMap[s.categoryId]?.name} />
              </motion.div>
            ))}
          </Stagger>
        </Section>
      )}

      {/* Related industries */}
      {relIndustries.length > 0 && (
        <Section className="bg-muted/30">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeader
              eyebrow="Industries"
              title="Where this service shines"
              subtitle="This service is commonly deployed across the sectors below — each with tailored considerations."
            />
            <NavButton view="industries" variant="outline" size="lg">
              <Building2 className="size-4" />
              All industries
            </NavButton>
          </div>
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relIndustries.map((ind) => (
              <motion.div key={ind.id} variants={staggerItem}>
                <IndustryCard industry={ind} />
              </motion.div>
            ))}
          </Stagger>
        </Section>
      )}

      {/* Final CTA */}
      <Section className="band-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="absolute left-1/2 top-0 size-96 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <PackageCheck className="mx-auto size-12 text-emerald-400" />
          <h2 className="mt-6 text-balance font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to deploy {service.name.toLowerCase()}?
          </h2>
          <p className="mt-4 text-pretty text-lg text-white/70">
            Tell us about your site and goals. We’ll assess, design and quote — with no obligation.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <NavButton
              view="quote"
              subject={`${service.name} enquiry`}
              size="lg"
              className="bg-gold text-gold-foreground hover:bg-gold/90"
            >
              Request a quote
              <ArrowRight className="size-4" />
            </NavButton>
            <NavButton view="contact" variant="outline" size="lg" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              Book a consultation
            </NavButton>
          </div>
        </div>
      </Section>
    </>
  );
}
