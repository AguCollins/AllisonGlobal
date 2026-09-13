"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  PhoneCall,
  Moon,
  Sun,
  ArrowRight,
  Mail,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LogoMark, NavButton, NavLink } from "@/components/site/primitives";
import { useSite } from "@/store/site-store";
import { mainNav, utilityNav, company } from "@/lib/data/company";
import { serviceCategories, services } from "@/lib/data/services";
import type { ViewId } from "@/lib/types";

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [megaOpen, setMegaOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { view, navigate } = useSite();
  const megaRef = React.useRef<HTMLDivElement>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile sheet on view change
  React.useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [view]);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const closeMega = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 120);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-md shadow-sm"
          : "border-b border-transparent bg-background",
      )}
    >
      {/* Top utility bar */}
      <div className="hidden border-b border-border/60 bg-muted/40 lg:block">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <a
              href={`tel:${company.contact.phoneIntl}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <PhoneCall className="size-3.5 text-brand" />
              {company.contact.phoneDisplay}
            </a>
            <a
              href={`mailto:${company.contact.email}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Mail className="size-3.5 text-brand" />
              {company.contact.email}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span>{company.location.city}, {company.location.country}</span>
            <span className="text-border">|</span>
            <span>{company.contact.hours}</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("home")}
          aria-label="Allison Global home"
        >
          <LogoMark />
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {mainNav.map((item) =>
            item.hasMega ? (
              <div
                key={item.view}
                ref={megaRef}
                className="relative"
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                <button
                  type="button"
                  onClick={() => navigate("services")}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    view === "services" || view === "service-detail"
                      ? "text-brand"
                      : "text-foreground/80 hover:text-foreground",
                  )}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform",
                      megaOpen && "rotate-180",
                    )}
                  />
                </button>
                {megaOpen && <ServiceMegaMenu />}
              </div>
            ) : (
              <button
                key={item.view}
                type="button"
                onClick={() => navigate(item.view as ViewId)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  view === item.view
                    ? "text-brand"
                    : "text-foreground/80 hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NavButton
            view="quote"
            size="sm"
            className="hidden sm:inline-flex bg-brand text-brand-foreground hover:bg-brand/90 shadow-sm"
          >
            Request a Quote
            <ArrowRight className="size-4" />
          </NavButton>

          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-md overflow-y-auto p-0">
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle asChild>
                  <div>
                    <LogoMark />
                  </div>
                </SheetTitle>
              </SheetHeader>
              <MobileNav />
              <div className="border-t border-border p-5">
                <NavButton
                  view="quote"
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  Request a Quote
                  <ArrowRight className="size-4" />
                </NavButton>
                <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <a
                    href={`tel:${company.contact.phoneIntl}`}
                    className="flex items-center gap-2 transition-colors hover:text-brand"
                  >
                    <PhoneCall className="size-4 text-brand" />
                    {company.contact.phoneDisplay}
                  </a>
                  <a
                    href={`mailto:${company.contact.email}`}
                    className="flex items-center gap-2 transition-colors hover:text-brand"
                  >
                    <Mail className="size-4 text-brand" />
                    {company.contact.email}
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Service mega menu                                                  */
/* ------------------------------------------------------------------ */
function ServiceMegaMenu() {
  const { navigate } = useSite();
  return (
    <div className="absolute left-1/2 top-full z-50 w-[min(56rem,92vw)] -translate-x-1/2 pt-3">
      <div className="overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl">
        <div className="grid grid-cols-3 gap-0">
          {serviceCategories.map((cat) => (
            <div
              key={cat.id}
              className={cn(
                "group border-b border-border/60 p-5 last:border-b-0 sm:border-r sm:last:border-r-0",
                "transition-colors hover:bg-accent/40",
              )}
            >
              <button
                type="button"
                onClick={() => navigate("services", { anchor: `cat-${cat.id}` })}
                className="flex w-full items-start gap-3 text-left"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <cat.icon className="size-4.5" />
                </span>
                <span>
                  <span className="block font-display text-sm font-semibold">
                    {cat.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {cat.tagline}
                  </span>
                </span>
              </button>
              <ul className="mt-3 space-y-1">
                {cat.services.map((slug) => {
                  const svc = services.find((s) => s.slug === slug);
                  if (!svc) return null;
                  return (
                    <li key={slug}>
                      <button
                        type="button"
                        onClick={() => navigate("service-detail", { slug })}
                        className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-[0.8rem] text-muted-foreground transition-colors hover:bg-background hover:text-brand"
                      >
                        <span className="size-1 rounded-full bg-brand/50" />
                        {svc.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 bg-muted/50 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Not sure what you need? Browse solutions by outcome.
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("solutions")}
            >
              Solutions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("industries")}
            >
              Industries
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile nav (inside sheet)                                         */
/* ------------------------------------------------------------------ */
function MobileNav() {
  const { navigate } = useSite();
  return (
    <div className="px-2 py-3">
      <Accordion type="multiple" className="w-full">
        {mainNav.map((item) =>
          item.hasMega ? (
            <AccordionItem key={item.view} value="services" className="border-b-0">
              <AccordionTrigger className="px-3 text-sm font-medium hover:no-underline">
                Services
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="space-y-3 px-3">
                  {serviceCategories.map((cat) => (
                    <div key={cat.id}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate("services", { anchor: `cat-${cat.id}` })
                        }
                        className="flex items-center gap-2 text-left text-sm font-semibold text-foreground"
                      >
                        <cat.icon className="size-4 text-brand" />
                        {cat.name}
                      </button>
                      <ul className="mt-1 space-y-0.5 pl-6">
                        {cat.services.map((slug) => {
                          const svc = services.find((s) => s.slug === slug);
                          if (!svc) return null;
                          return (
                            <li key={slug}>
                              <button
                                type="button"
                                onClick={() => navigate("service-detail", { slug })}
                                className="text-left text-[0.8rem] text-muted-foreground hover:text-brand"
                              >
                                {svc.name}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ) : (
            <div key={item.view} className="border-b border-border/60">
              <button
                type="button"
                onClick={() => navigate(item.view as ViewId)}
                className="flex w-full items-center justify-between px-3 py-3 text-sm font-medium"
              >
                {item.label}
                <ArrowRight className="size-4 text-muted-foreground" />
              </button>
            </div>
          ),
        )}
      </Accordion>

      <div className="mt-2 px-3">
        <p className="px-0 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          More
        </p>
        {utilityNav.map((item) => (
          <button
            key={item.view}
            type="button"
            onClick={() => navigate(item.view as ViewId)}
            className="flex w-full items-center justify-between border-b border-border/40 py-2.5 text-sm font-medium text-foreground/80 hover:text-brand"
          >
            {item.label}
            <ArrowRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Theme toggle                                                       */
/* ------------------------------------------------------------------ */
function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" className="size-9">
        <Sun className="size-4" />
      </Button>
    );
  }
  const isDark = resolvedTheme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className="size-9"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
