"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import {
  Section,
  SectionHeader,
  Reveal,
  IconBadge,
  NavButton,
} from "@/components/site/primitives";
import { PageHero, ConversionPathCTA } from "@/components/site/sections";
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
import { company } from "@/lib/data/company";
import { industries } from "@/lib/data/industries";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  company: z.string().optional(),
  industry: z.string().optional(),
  subject: z.string().min(2, "Please add a subject"),
  message: z.string().min(10, "Please tell us a bit more"),
  website: z.string().optional(), // honeypot
});

type FormValues = z.infer<typeof schema>;

export function ContactView({ initialSubject }: { initialSubject?: string }) {
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      industry: "",
      subject: initialSubject ?? "",
      message: "",
      website: "",
    },
  });

  React.useEffect(() => {
    if (initialSubject) form.setValue("subject", initialSubject);
  }, [initialSubject, form]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, type: "contact" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Submission failed");
      toast.success("Message sent", {
        description:
          "Thank you — our team will get back to you shortly. For urgent matters, call us directly.",
      });
      form.reset({
        name: "",
        email: "",
        phone: "",
        company: "",
        industry: "",
        subject: "",
        message: "",
        website: "",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error("Couldn't send message", { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  const contactChannels = [
    {
      icon: PhoneCall,
      label: "Call us",
      value: company.contact.phoneDisplay,
      href: `tel:${company.contact.phoneIntl}`,
      note: company.contact.hours,
    },
    {
      icon: Mail,
      label: "Email us",
      value: company.contact.email,
      href: `mailto:${company.contact.email}`,
      note: "We reply within one business day",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "Chat with us",
      href: `https://wa.me/${company.contact.whatsapp}`,
      note: "Quick questions welcome",
    },
    {
      icon: MapPin,
      label: "Visit us",
      value: `${company.location.city}, ${company.location.country}`,
      href: undefined,
      note: company.location.coverage,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="Let's talk about your project"
        subtitle="Whether you need a quote, a consultation, or just have a question — reach out. One conversation with our engineering team is usually all it takes to get clarity."
        breadcrumb={[{ label: "Home", view: "home" }, { label: "Contact" }]}
        icon={MessageSquare}
      />

      {/* Contact channels */}
      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactChannels.map((c, i) => {
            const Inner = (
              <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6 transition-all hover:border-brand/40 hover:shadow-lg">
                <IconBadge icon={c.icon} variant="brand" />
                <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {c.label}
                </div>
                <div className="mt-1 font-display text-base font-semibold">
                  {c.value}
                </div>
                <div className="mt-auto pt-3 text-xs text-muted-foreground">{c.note}</div>
              </div>
            );
            return (
              <Reveal key={c.label} delay={i * 0.05}>
                {c.href ? (
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="block h-full"
                  >
                    {Inner}
                  </a>
                ) : (
                  Inner
                )}
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Form + info */}
      <Section className="bg-muted/30">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8">
              <SectionHeader
                eyebrow="Send a message"
                title="Tell us what you need"
                subtitle="The more detail you share, the more useful our response will be. We typically reply within one business day."
              />
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
                {/* Honeypot */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                  {...form.register("website")}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" error={form.formState.errors.name?.message} required>
                    <Input placeholder="e.g. Ada Okafor" {...form.register("name")} />
                  </Field>
                  <Field label="Email" error={form.formState.errors.email?.message} required>
                    <Input type="email" placeholder="you@company.com" {...form.register("email")} />
                  </Field>
                  <Field label="Phone" error={form.formState.errors.phone?.message}>
                    <Input placeholder="0801 234 5678" {...form.register("phone")} />
                  </Field>
                  <Field label="Company / Organisation" error={form.formState.errors.company?.message}>
                    <Input placeholder="Your organisation" {...form.register("company")} />
                  </Field>
                  <Field label="Industry" error={form.formState.errors.industry?.message}>
                    <Select onValueChange={(v) => form.setValue("industry", v)}>
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
                  </Field>
                  <Field label="Subject" error={form.formState.errors.subject?.message} required>
                    <Input placeholder="What's this about?" {...form.register("subject")} />
                  </Field>
                </div>
                <Field
                  label="How can we help?"
                  error={form.formState.errors.message?.message}
                  required
                >
                  <Textarea
                    rows={5}
                    placeholder="Tell us about your site, your goals, or the problem you're trying to solve…"
                    {...form.register("message")}
                  />
                </Field>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    By submitting, you agree to our privacy policy. We never share your data.
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
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        Send message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-5 space-y-4">
            <Reveal>
              <div className="rounded-2xl border border-border/70 bg-card p-6">
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-brand" />
                  <h3 className="font-display text-lg font-semibold">Office hours</h3>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Monday – Saturday</span>
                    <span className="font-medium">8:00am – 6:00pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </li>
                  <li className="flex justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">Emergency support</span>
                    <span className="font-medium text-brand">24/7 for managed clients</span>
                  </li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="rounded-2xl border border-border/70 bg-card p-6">
                <div className="flex items-center gap-2">
                  <MapPin className="size-5 text-brand" />
                  <h3 className="font-display text-lg font-semibold">Coverage</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {company.location.coverage}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="rounded-2xl band-ink relative overflow-hidden p-6">
                <div className="absolute inset-0 bg-grid-dark opacity-40" />
                <div className="relative">
                  <h3 className="font-display text-lg font-semibold text-white">
                    Prefer a structured quote?
                  </h3>
                  <p className="mt-2 text-sm text-white/70">
                    If you have a defined project in mind, our quote form captures the
                    details we need to give you a precise proposal.
                  </p>
                  <NavButton
                    view="quote"
                    className="mt-4 bg-gold text-gold-foreground hover:bg-gold/90"
                  >
                    Request a quote
                    <ArrowRight className="size-4" />
                  </NavButton>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <ConversionPathCTA />
    </>
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
