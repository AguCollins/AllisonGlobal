"use client";

import * as React from "react";
import Link from "next/link";
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  ArrowUp,
  Linkedin,
  Facebook,
  Instagram,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/site/primitives";
import { company, mainNav, utilityNav, legalNav } from "@/lib/data/company";
import { serviceCategories } from "@/lib/data/services";
import { industries } from "@/lib/data/industries";
import { href } from "@/lib/nav";
import type { ViewId } from "@/lib/types";

export function Footer() {
  return (
    <footer className="mt-auto band-ink relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-dark opacity-30" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* CTA band */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur sm:p-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Ready to engineer something secure?
            </h3>
            <p className="mt-2 text-white/60">
              Talk to our team about your site, your risks and your goals. One
              conversation is usually all it takes.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
              <Link href="/quote">Request a Quote</Link>
            </Button>
            <a
              href={`tel:${company.contact.phoneIntl}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <PhoneCall className="size-4" />
              Call now
            </a>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <LogoMark light />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              {company.shortPitch}
            </p>
            <div className="mt-5 space-y-2.5 text-sm">
              <a
                href={`tel:${company.contact.phoneIntl}`}
                className="flex items-center gap-2.5 text-white/70 transition-colors hover:text-white"
              >
                <PhoneCall className="size-4 text-emerald-400" />
                {company.contact.phoneDisplay}
              </a>
              <a
                href={`mailto:${company.contact.email}`}
                className="flex items-center gap-2.5 text-white/70 transition-colors hover:text-white"
              >
                <Mail className="size-4 text-emerald-400" />
                {company.contact.email}
              </a>
              <div className="flex items-center gap-2.5 text-white/70">
                <MapPin className="size-4 text-emerald-400" />
                {company.location.addressLine}
              </div>
              <div className="flex items-start gap-2.5 text-white/70">
                <Clock className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                <span>{company.contact.hours}</span>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              {[
                { icon: Linkedin, href: company.social.linkedin, label: "LinkedIn" },
                { icon: Facebook, href: company.social.facebook, label: "Facebook" },
                { icon: Instagram, href: company.social.instagram, label: "Instagram" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-emerald-400/40 hover:text-white"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
              <a
                href={`https://wa.me/${company.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-emerald-400/40 hover:text-white"
              >
                <MessageCircle className="size-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-white">
              Services
            </h4>
            <ul className="mt-4 space-y-2.5">
              {serviceCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={href("services", { anchor: `cat-${cat.id}` })}
                    className="flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-emerald-300"
                  >
                    <ChevronRight className="size-3.5 text-emerald-400/60" />
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/solutions"
                  className="flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-emerald-300"
                >
                  <ChevronRight className="size-3.5 text-emerald-400/60" />
                  Solutions by Outcome
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-white">
              Company
            </h4>
            <ul className="mt-4 space-y-2.5">
              {[...mainNav, ...utilityNav].map((item) => (
                <li key={item.label}>
                  <Link
                    href={href(item.view as ViewId)}
                    className="text-sm text-white/60 transition-colors hover:text-emerald-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries quick */}
          <div className="lg:col-span-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-white">
              Industries
            </h4>
            <ul className="mt-4 grid grid-cols-1 gap-2.5">
              {industries.slice(0, 7).map((ind) => (
                <li key={ind.id}>
                  <Link
                    href={href("industry-detail", { slug: ind.id })}
                    className="text-sm text-white/60 transition-colors hover:text-emerald-300"
                  >
                    {ind.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/industries"
                  className="text-sm font-semibold text-emerald-300 transition-colors hover:text-emerald-200"
                >
                  View all industries →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {company.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalNav.map((item) => (
              <Link
                key={item.view}
                href={href(item.view as ViewId)}
                className="text-xs text-white/50 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}

function BackToTop() {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-5 right-5 z-40 flex size-11 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:bg-brand/90",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
