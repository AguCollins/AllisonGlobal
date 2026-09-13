"use client";

import * as React from "react";
import {
  HelpCircle,
  PhoneCall,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import {
  Section,
  SectionHeader,
  Reveal,
  NavButton,
} from "@/components/site/primitives";
import { PageHero, ConversionPathCTA } from "@/components/site/sections";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { faqs, faqCategories } from "@/lib/data/faqs";
import { company } from "@/lib/data/company";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  View                                                               */
/* ------------------------------------------------------------------ */
export function FaqsView() {
  const [active, setActive] = React.useState<string>("All");

  const categories = ["All", ...faqCategories];
  const filtered =
    active === "All" ? faqs : faqs.filter((f) => f.category === active);

  return (
    <>
      <PageHero
        eyebrow="FAQs"
        icon={HelpCircle}
        title="Answers to the questions we hear most"
        subtitle="Engineering, engagement, support, security and coverage — answered plainly. If you don't find your question here, our team is one call away."
        breadcrumb={[
          { label: "Home", view: "home" },
          { label: "FAQs" },
        ]}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Sidebar — category filter + helper */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-28">
              <SectionHeader
                eyebrow="Filter"
                title="Browse by topic"
              />
              <div className="mt-5 flex flex-wrap gap-2 lg:flex-col lg:items-start">
                {categories.map((cat) => {
                  const isActive = active === cat;
                  const count =
                    cat === "All"
                      ? faqs.length
                      : faqs.filter((f) => f.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActive(cat)}
                      aria-pressed={isActive}
                      className={cn(
                        "group inline-flex items-center justify-between gap-3 rounded-full border px-3.5 py-2 text-sm font-medium transition-all lg:w-full lg:rounded-xl",
                        isActive
                          ? "border-brand bg-brand text-brand-foreground shadow-sm"
                          : "border-border bg-background text-foreground hover:border-brand/40 hover:bg-brand/5",
                      )}
                    >
                      <span className="text-left">{cat}</span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums",
                          isActive
                            ? "bg-brand-foreground/15 text-brand-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick contact helper */}
              <div className="mt-8 hidden rounded-2xl border border-border/70 bg-muted/40 p-5 lg:block">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-brand" />
                  <span className="text-sm font-semibold">
                    Still have questions?
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Reach our team directly — we're happy to talk through your
                  site, risk or scope before any commitment.
                </p>
                <a
                  href={`tel:${company.contact.phoneIntl}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
                >
                  <PhoneCall className="size-4" />
                  {company.contact.phoneDisplay}
                </a>
              </div>
            </div>
          </aside>

          {/* Accordion */}
          <div className="lg:col-span-8 xl:col-span-9">
            <Reveal>
              <div className="rounded-2xl border border-border/70 bg-card p-2 sm:p-4">
                <Accordion
                  type="single"
                  collapsible
                  defaultValue={filtered[0]?.id}
                  key={active}
                  className="w-full"
                >
                  {filtered.map((f) => (
                    <AccordionItem
                      key={f.id}
                      value={f.id}
                      className="rounded-xl px-3 transition-colors first:mt-0 data-[state=open]:bg-brand/[0.04] sm:px-5"
                    >
                      <AccordionTrigger className="text-left text-base font-semibold hover:no-underline sm:text-lg">
                        <span className="flex items-start gap-3">
                          <HelpCircle className="mt-0.5 size-4 shrink-0 text-brand" />
                          <span>{f.question}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem] sm:leading-relaxed">
                        <div className="pl-7">{f.answer}</div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </Reveal>

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
                No FAQs in this category yet — try another topic or reach out
                to our team.
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Still have questions? */}
      <Section className="bg-muted/30">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-background p-8 sm:p-12">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 size-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionHeader
                eyebrow="Still have questions?"
                title="Talk to an engineer, not a sales script"
                subtitle="Some questions need your specific site in mind. Reach out — we'll give you an honest answer, even if that means recommending a different vendor."
              />
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${company.contact.phoneIntl}`}
                  className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-lg shadow-amber-900/10 transition-colors hover:bg-gold/90"
                >
                  <PhoneCall className="size-4" />
                  {company.contact.phoneDisplay}
                </a>
                <span className="text-xs text-muted-foreground">
                  {company.contact.hours}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:flex-col lg:items-end">
              <NavButton view="contact" size="lg" className="w-full sm:w-auto">
                Talk to an expert
                <ArrowRight className="size-4" />
              </NavButton>
              <NavButton
                view="quote"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Request a quote
              </NavButton>
            </div>
          </div>
        </div>
      </Section>

      <ConversionPathCTA />
    </>
  );
}
