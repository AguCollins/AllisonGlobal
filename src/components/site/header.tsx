"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
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
import { LogoMark } from "@/components/site/primitives";

// Types for CMS-provided data
interface NavLinkItem {
  label: string;
  href: string;
  type: string;
  visible: boolean;
  openInNewTab: boolean;
  order: number;
}

interface ServiceCategoryItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  services: { slug: string; name: string }[];
}

interface CompanyInfo {
  contact: {
    phoneDisplay: string;
    phoneIntl: string;
    email: string;
    hours: string;
  };
  location: { city: string; country: string };
}

interface HeaderProps {
  navItems: NavLinkItem[];
  utilityNavItems: NavLinkItem[];
  company: CompanyInfo;
  serviceCategories: ServiceCategoryItem[];
}

export function Header({ navItems, utilityNavItems, company: companyInfo, serviceCategories }: HeaderProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [megaOpen, setMegaOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const megaRef = React.useRef<HTMLDivElement>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const closeMega = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 120);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/90 backdrop-blur-md shadow-sm"
          : "border-b border-border/60 bg-background",
      )}
    >
      {/* Top utility bar */}
      <div className="hidden border-b border-border/60 bg-muted/40 lg:block">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-1 text-[0.7rem] text-muted-foreground">
          <div className="flex items-center gap-5">
            <a
              href={`tel:${companyInfo.contact.phoneIntl}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <PhoneCall className="size-3 text-brand" />
              {companyInfo.contact.phoneDisplay}
            </a>
            <a
              href={`mailto:${companyInfo.contact.email}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Mail className="size-3 text-brand" />
              {companyInfo.contact.email}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span>{companyInfo.location.city}, {companyInfo.location.country}</span>
            <span className="text-border">|</span>
            <span>Mon–Sat 8am–6pm · 24/7 emergency support</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Allison Global — home" className="shrink-0">
          <LogoMark />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => {
            const isServicesMega = item.label === "Services";
            if (isServicesMega) {
              return (
                <div
                  key={item.href}
                  ref={megaRef}
                  className="relative"
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive(item.href)
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
                  </Link>
                  {megaOpen && (
                    <div className="absolute left-1/2 top-full z-50 w-[min(56rem,92vw)] -translate-x-1/2 pt-3">
                      <div className="overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl">
                        <div className="grid grid-cols-3 gap-0">
                          {serviceCategories.map((cat) => (
                            <div
                              key={cat.id}
                              className="group border-b border-border/60 p-5 last:border-b-0 sm:border-r sm:last:border-r-0 transition-colors hover:bg-accent/40"
                            >
                              <Link
                                href={`/services#cat-${cat.id}`}
                                className="flex w-full items-start gap-3 text-left"
                              >
                                <span className="block">
                                  <span className="block font-display text-sm font-semibold">
                                    {cat.name}
                                  </span>
                                  <span className="mt-0.5 block text-xs text-muted-foreground">
                                    {cat.tagline}
                                  </span>
                                </span>
                              </Link>
                              <ul className="mt-3 space-y-1">
                                {cat.services.map((svc) => (
                                  <li key={svc.slug}>
                                    <Link
                                      href={`/services/${svc.slug}`}
                                      className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-[0.8rem] text-muted-foreground transition-colors hover:bg-background hover:text-brand"
                                    >
                                      <span className="size-1 rounded-full bg-brand/50" />
                                      {svc.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between gap-4 bg-muted/50 px-5 py-3">
                          <p className="text-xs text-muted-foreground">
                            Not sure what you need? Browse solutions by outcome.
                          </p>
                          <div className="flex gap-2">
                            <Button asChild variant="ghost" size="sm">
                              <Link href="/solutions">Solutions</Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm">
                              <Link href="/industries">Industries</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "text-brand"
                    : "text-foreground/80 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="hidden sm:inline-flex bg-brand text-brand-foreground hover:bg-brand/90 shadow-sm">
            <Link href="/quote">
              Request a Quote
              <ArrowRight className="size-4" />
            </Link>
          </Button>

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
              <div className="px-2 py-3">
                <Accordion type="multiple" className="w-full">
                  {navItems.map((item) => {
                    const isServicesMega = item.label === "Services";
                    if (isServicesMega) {
                      return (
                        <AccordionItem key={item.href} value="services" className="border-b-0">
                          <AccordionTrigger className="px-3 text-sm font-medium hover:no-underline">
                            Services
                          </AccordionTrigger>
                          <AccordionContent className="pb-2">
                            <div className="space-y-3 px-3">
                              {serviceCategories.map((cat) => (
                                <div key={cat.id}>
                                  <Link
                                    href={`/services#cat-${cat.id}`}
                                    className="flex items-center gap-2 text-left text-sm font-semibold text-foreground"
                                  >
                                    {cat.name}
                                  </Link>
                                  <ul className="mt-1 space-y-0.5 pl-6">
                                    {cat.services.map((svc) => (
                                      <li key={svc.slug}>
                                        <Link
                                          href={`/services/${svc.slug}`}
                                          className="text-left text-[0.8rem] text-muted-foreground hover:text-brand"
                                        >
                                          {svc.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    }
                    return (
                      <div key={item.href} className="border-b border-border/60">
                        <Link
                          href={item.href}
                          className="flex w-full items-center justify-between px-3 py-3 text-sm font-medium"
                        >
                          {item.label}
                          <ArrowRight className="size-4 text-muted-foreground" />
                        </Link>
                      </div>
                    );
                  })}
                </Accordion>

                <div className="mt-2 px-3">
                  <p className="px-0 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    More
                  </p>
                  {utilityNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex w-full items-center justify-between border-b border-border/40 py-2.5 text-sm font-medium text-foreground/80 hover:text-brand"
                    >
                      {item.label}
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
              <div className="border-t border-border p-5">
                <Button asChild className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
                  <Link href="/quote">
                    Request a Quote
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <a
                    href={`tel:${companyInfo.contact.phoneIntl}`}
                    className="flex items-center gap-2 transition-colors hover:text-brand"
                  >
                    <PhoneCall className="size-4 text-brand" />
                    {companyInfo.contact.phoneDisplay}
                  </a>
                  <a
                    href={`mailto:${companyInfo.contact.email}`}
                    className="flex items-center gap-2 transition-colors hover:text-brand"
                  >
                    <Mail className="size-4 text-brand" />
                    {companyInfo.contact.email}
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

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
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
