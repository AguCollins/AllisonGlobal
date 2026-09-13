"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Send,
  CheckCircle2,
  PhoneCall,
  ClipboardList,
  User,
  Building2,
  CircleDollarSign,
  MapPin,
  Layers,
} from "lucide-react";
import {
  Section,
  IconBadge,
  NavButton,
} from "@/components/site/primitives";
import { PageHero } from "@/components/site/sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { serviceCategories, services } from "@/lib/data/services";
import { industries } from "@/lib/data/industries";
import { company } from "@/lib/data/company";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(7, "Please enter a contact number"),
  company: z.string().optional(),
  industry: z.string().optional(),
  services: z.array(z.string()).optional().default([]),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  siteLocation: z.string().optional(),
  siteCount: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, "Please share a few details about what you need"),
  website: z.string().optional(), // honeypot
});

type FormValues = z.infer<typeof schema>;

const budgetOptions = [
  "Under ₦500,000",
  "₦500,000 – ₦2,000,000",
  "₦2,000,000 – ₦10,000,000",
  "₦10,000,000 – ₦50,000,000",
  "Over ₦50,000,000",
  "Not sure yet — please advise",
];

const timelineOptions = [
  "ASAP / emergency",
  "Within 2 weeks",
  "1–2 months",
  "3–6 months",
  "Just exploring",
];

const siteCountOptions = ["1 site", "2–5 sites", "6–10 sites", "10+ sites"];

export function QuoteView({ initialSubject }: { initialSubject?: string }) {
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [selectedServices, setSelectedServices] = React.useState<string[]>(
    initialSubject ? extractSlugs(initialSubject) : [],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      industry: "",
      services: selectedServices,
      budget: "",
      timeline: "",
      siteLocation: "",
      siteCount: "",
      subject: initialSubject ?? "",
      message: "",
      website: "",
    },
  });

  function toggleService(slug: string) {
    setSelectedServices((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      form.setValue("services", next);
      return next;
    });
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          services: selectedServices,
          type: "quote",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Submission failed");
      toast.success("Quote request received", {
        description:
          "Thank you — an engineer will review your requirements and get back to you shortly.",
      });
      setDone(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error("Couldn't submit request", { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <SuccessScreen />;
  }

  return (
    <>
      <PageHero
        eyebrow="Request a Quote"
        title="Tell us what you need — we'll engineer a response"
        subtitle="The more we understand about your site, goals and constraints, the more precise and useful our proposal will be. No obligation, no generic templates."
        breadcrumb={[{ label: "Home", view: "home" }, { label: "Request a Quote" }]}
        icon={ClipboardList}
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Form */}
          <div className="lg:col-span-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Honeypot */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
                {...form.register("website")}
              />

              {/* Contact details */}
              <FormSection
                icon={User}
                title="Your contact details"
                step={1}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" error={form.formState.errors.name?.message} required>
                    <Input placeholder="e.g. Ada Okafor" {...form.register("name")} />
                  </Field>
                  <Field label="Phone" error={form.formState.errors.phone?.message} required>
                    <Input placeholder="0801 234 5678" {...form.register("phone")} />
                  </Field>
                  <Field label="Email" error={form.formState.errors.email?.message} required>
                    <Input type="email" placeholder="you@company.com" {...form.register("email")} />
                  </Field>
                  <Field label="Company / Organisation" error={form.formState.errors.company?.message}>
                    <Input placeholder="Your organisation" {...form.register("company")} />
                  </Field>
                </div>
              </FormSection>

              {/* What you need */}
              <FormSection
                icon={Layers}
                title="What do you need?"
                step={2}
                subtitle="Select all the services you're interested in. You can choose across categories — we'll design them as an integrated solution."
              >
                <div className="space-y-4">
                  {serviceCategories.map((cat) => (
                    <div key={cat.id} className="rounded-xl border border-border/70 bg-muted/30 p-4">
                      <div className="flex items-center gap-2">
                        <cat.icon className="size-4 text-brand" />
                        <h4 className="text-sm font-semibold">{cat.name}</h4>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {cat.services.map((slug) => {
                          const svc = services.find((s) => s.slug === slug);
                          if (!svc) return null;
                          const active = selectedServices.includes(slug);
                          return (
                            <button
                              key={slug}
                              type="button"
                              onClick={() => toggleService(slug)}
                              className={
                                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all " +
                                (active
                                  ? "border-brand bg-brand text-brand-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground")
                              }
                            >
                              {active && <CheckCircle2 className="size-3.5" />}
                              {svc.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedServices.length > 0 && (
                  <p className="mt-3 text-xs text-brand">
                    {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </FormSection>

              {/* Site & sector */}
              <FormSection
                icon={Building2}
                title="About your site"
                step={3}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Industry / sector" error={form.formState.errors.industry?.message}>
                    <Controller
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your sector" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map((ind) => (
                              <SelectItem key={ind.id} value={ind.id}>
                                {ind.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                  <Field label="Site location" error={form.formState.errors.siteLocation?.message}>
                    <Input placeholder="e.g. Lekki, Lagos" {...form.register("siteLocation")} />
                  </Field>
                  <Field label="Number of sites" error={form.formState.errors.siteCount?.message}>
                    <Controller
                      control={form.control}
                      name="siteCount"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="How many locations?" />
                          </SelectTrigger>
                          <SelectContent>
                            {siteCountOptions.map((o) => (
                              <SelectItem key={o} value={o}>{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                  <Field label="Project name / reference" error={form.formState.errors.subject?.message}>
                    <Input placeholder="Optional" {...form.register("subject")} />
                  </Field>
                </div>
              </FormSection>

              {/* Budget & timeline */}
              <FormSection
                icon={CircleDollarSign}
                title="Budget & timeline"
                step={4}
                subtitle="Honest guidance helps us recommend the right approach — not just the most expensive one."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Estimated budget" error={form.formState.errors.budget?.message}>
                    <Controller
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a range" />
                          </SelectTrigger>
                          <SelectContent>
                            {budgetOptions.map((o) => (
                              <SelectItem key={o} value={o}>{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                  <Field label="Timeline" error={form.formState.errors.timeline?.message}>
                    <Controller
                      control={form.control}
                      name="timeline"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="When do you need this?" />
                          </SelectTrigger>
                          <SelectContent>
                            {timelineOptions.map((o) => (
                              <SelectItem key={o} value={o}>{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                </div>
              </FormSection>

              {/* Details */}
              <FormSection
                icon={ClipboardList}
                title="Project details"
                step={5}
                subtitle="Share anything that helps us understand your goals, constraints or existing systems."
              >
                <Field label="Tell us about your project" error={form.formState.errors.message?.message} required>
                  <Textarea
                    rows={6}
                    placeholder="e.g. We're a 3-floor office in Victoria Island needing CCTV, access control and a network refresh. Currently have an old analogue system and consumer Wi-Fi that keeps dropping…"
                    {...form.register("message")}
                  />
                </Field>
              </FormSection>

              <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  By submitting, you agree to our privacy policy. We'll only use your details to respond to this request.
                </p>
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  {submitting ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Submit request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="sticky top-28 space-y-4">
              <div className="rounded-2xl band-ink relative overflow-hidden p-6">
                <div className="absolute inset-0 bg-grid-dark opacity-40" />
                <div className="relative">
                  <h3 className="font-display text-lg font-semibold text-white">
                    What happens next?
                  </h3>
                  <ol className="mt-4 space-y-3 text-sm text-white/70">
                    {[
                      "We review your requirements",
                      "An engineer may call to clarify details",
                      "You receive a clear, itemised proposal",
                      "We schedule assessment & deployment",
                    ].map((s, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-6">
                <div className="flex items-center gap-2">
                  <PhoneCall className="size-5 text-brand" />
                  <h3 className="font-display text-base font-semibold">Prefer to talk?</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Call us directly — we're happy to discuss your needs before you submit anything.
                </p>
                <a
                  href={`tel:${company.contact.phoneIntl}`}
                  className="mt-3 block text-lg font-bold text-brand hover:underline"
                >
                  {company.contact.phoneDisplay}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">{company.contact.hours}</p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-6">
                <div className="flex items-center gap-2">
                  <MapPin className="size-5 text-brand" />
                  <h3 className="font-display text-base font-semibold">Not sure yet?</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  If you're still scoping, a consultation might suit you better than a full quote.
                </p>
                <NavButton view="contact" variant="outline" className="mt-3 w-full">
                  Book a consultation
                </NavButton>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function FormSection({
  icon: Icon,
  title,
  subtitle,
  step,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10 font-display text-sm font-bold text-brand">
            {step}
          </div>
          <IconBadge icon={Icon} variant="outline" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SuccessScreen() {
  return (
    <section className="relative overflow-hidden band-ink">
      <div className="absolute inset-0 bg-grid-dark opacity-40" />
      <div className="absolute left-1/2 top-0 size-96 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/30">
          <CheckCircle2 className="size-10 text-emerald-400" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">
          Request received — thank you
        </h1>
        <p className="mt-4 text-pretty text-lg text-white/70">
          Your quote request has been submitted. One of our engineers will review your
          requirements and get back to you shortly — typically within one business day.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <NavButton view="home" size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
            Back to home
          </NavButton>
          <a
            href={`tel:${company.contact.phoneIntl}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <PhoneCall className="size-4" />
            Call us now
          </a>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50">
          <span>Need something urgent? Call {company.contact.phoneDisplay}</span>
        </div>
      </div>
    </section>
  );
}

/** If the quote was opened with a service name as subject, preselect matching services. */
function extractSlugs(subject: string): string[] {
  const s = subject.toLowerCase();
  return services
    .filter((svc) => s.includes(svc.slug) || s.includes(svc.name.toLowerCase()))
    .map((svc) => svc.slug);
}
