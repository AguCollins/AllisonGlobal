"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { useSite } from "@/store/site-store";
import type { ViewId, NavParam } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Reveal — scroll-triggered fade/slide up                           */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  once = true,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-60px 0px -60px 0px" });
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      ref={ref as React.Ref<HTMLDivElement>}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section — consistent vertical rhythm                              */
/* ------------------------------------------------------------------ */
export function Section({
  children,
  className,
  id,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
}) {
  return (
    <section
      id={id}
      className={cn("py-16 sm:py-20 lg:py-24", className)}
    >
      <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SectionHeader — eyebrow, title, subtitle                           */
/* ------------------------------------------------------------------ */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  light = false,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]",
            light ? "text-emerald-300" : "text-brand",
          )}
        >
          <span className="h-px w-6 bg-current opacity-60" />
          {eyebrow}
        </div>
      )}
      <h2
        className={cn(
          "text-balance text-3xl font-bold leading-[1.1] sm:text-4xl lg:text-[2.7rem]",
          light ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-pretty text-base leading-relaxed sm:text-lg",
            light ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  IconBadge — rounded icon container                                 */
/* ------------------------------------------------------------------ */
export function IconBadge({
  icon: Icon,
  className,
  size = "md",
  variant = "brand",
}: {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "brand" | "solid" | "gold" | "outline" | "muted";
}) {
  const sizes = {
    sm: "size-9 rounded-lg",
    md: "size-12 rounded-xl",
    lg: "size-14 rounded-2xl",
  };
  const iconSize = { sm: "size-4", md: "size-5", lg: "size-7" };
  const variants = {
    brand:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-1 ring-emerald-600/15",
    solid: "bg-brand text-brand-foreground",
    gold: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-amber-500/20",
    outline:
      "bg-background text-brand ring-1 ring-border",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        sizes[size],
        variants[variant],
        className,
      )}
    >
      <Icon className={iconSize[size]} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LogoMark — Allison Global brand mark (shield + circuit nodes)     */
/* ------------------------------------------------------------------ */
export function LogoMark({
  className,
  withText = true,
  light = false,
}: {
  className?: string;
  withText?: boolean;
  light?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 40 40"
        className="size-9 shrink-0"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ag-grad" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="oklch(0.55 0.11 168)" />
            <stop offset="100%" stopColor="oklch(0.45 0.10 175)" />
          </linearGradient>
        </defs>
        <path
          d="M20 2.5 5 8.2v10.3c0 9.1 6.3 17.6 15 19 8.7-1.4 15-9.9 15-19V8.2L20 2.5Z"
          fill="url(#ag-grad)"
        />
        <path
          d="M20 2.5 5 8.2v10.3c0 9.1 6.3 17.6 15 19 8.7-1.4 15-9.9 15-19V8.2L20 2.5Z"
          stroke="oklch(0.78 0.14 78)"
          strokeOpacity="0.5"
          strokeWidth="1"
          fill="none"
        />
        {/* circuit nodes forming an 'A' */}
        <circle cx="20" cy="12" r="2" fill="oklch(0.95 0.02 90)" />
        <circle cx="13" cy="27" r="2" fill="oklch(0.95 0.02 90)" />
        <circle cx="27" cy="27" r="2" fill="oklch(0.95 0.02 90)" />
        <path
          d="M20 12 13 27M20 12l7 15M15 22h10"
          stroke="oklch(0.95 0.02 90)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      {withText && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[1.05rem] font-bold tracking-tight",
              light ? "text-white" : "text-foreground",
            )}
          >
            Allison<span className="text-brand"> Global</span>
          </span>
          <span
            className={cn(
              "mt-0.5 text-[0.62rem] font-medium uppercase tracking-[0.22em]",
              light ? "text-white/50" : "text-muted-foreground",
            )}
          >
            ICT · Security
          </span>
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  NavButton — a Button that drives client-side navigation           */
/* ------------------------------------------------------------------ */
type NavButtonProps = {
  view: ViewId;
  params?: NavParam;
  children: React.ReactNode;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
  slug?: string;
  subject?: string;
};

export function NavButton({
  view,
  params,
  children,
  variant = "default",
  size,
  className,
  slug,
  subject,
}: NavButtonProps) {
  const navigate = useSite((s) => s.navigate);
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() =>
        navigate(view, { ...params, slug: slug ?? params?.slug, subject: subject ?? params?.subject })
      }
    >
      {children}
    </Button>
  );
}

/** A link-styled element that drives view navigation. */
export function NavLink({
  view,
  params,
  slug,
  subject,
  children,
  className,
  onClick,
}: {
  view: ViewId;
  params?: NavParam;
  slug?: string;
  subject?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const navigate = useSite((s) => s.navigate);
  return (
    <button
      type="button"
      onClick={() => {
        navigate(view, {
          ...params,
          slug: slug ?? params?.slug,
          subject: subject ?? params?.subject,
        });
        onClick?.();
      }}
      className={cn("text-left", className)}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  PhoneLink / ExternalLink                                          */
/* ------------------------------------------------------------------ */
export function PhoneLink({
  className,
  display,
}: {
  className?: string;
  display?: string;
}) {
  const phone = "09152158801";
  return (
    <a href={`tel:${phone}`} className={cn("transition-colors hover:text-brand", className)}>
      {display ?? phone}
    </a>
  );
}

export function WhatsAppLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const wa = "2349152158801";
  return (
    <a
      href={`https://wa.me/${wa}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

/** Next.js Link shim (kept for any standard href use). */
export { Link };
