"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  RefreshCw,
  PlusCircle,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";

// ─────────────────────────── Helpers ───────────────────────────

/** Convert any string to a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Convert a comma-separated string into a clean string array. */
export function csvToArray(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Convert a string array into a comma-separated string for input display. */
export function arrayToCsv(arr: string[] | null | undefined): string {
  if (!arr || !Array.isArray(arr)) return "";
  return arr.join(", ");
}

/** Best-effort date formatter. */
export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─────────────────────────── Hooks ───────────────────────────

/**
 * Warn the user before they navigate away or close the tab if a form has
 * unsaved changes.
 *
 * Usage: const dirty = useUnsavedChanges(formDirty);
 */
export function useUnsavedChanges(dirty: boolean) {
  React.useEffect(() => {
    if (!dirty) return;
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

// ─────────────────────────── Shared UI ───────────────────────────

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
}

/** Consistent page header: icon + title + description + optional action. */
export function PageHeader({
  icon: Icon,
  title,
  description,
  backHref,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {backHref && (
          <Button
            variant="ghost"
            size="icon"
            className="size-10 shrink-0"
            asChild
          >
            <Link href={backHref} aria-label="Back">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        )}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Icon className="size-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Branded error card with retry button. */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-col items-start gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Failed to load</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="min-h-10"
          onClick={onRetry}
        >
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

/** Friendly empty state with optional create button. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Icon className="size-7" />
        </div>
        <div>
          <p className="font-display text-lg font-bold">{title}</p>
          {description && (
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actionLabel &&
          (actionHref ? (
            <Button
              size="lg"
              className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
              asChild
            >
              <Link href={actionHref}>
                <PlusCircle className="size-4" />
                {actionLabel}
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={onAction}
            >
              <PlusCircle className="size-4" />
              {actionLabel}
            </Button>
          ))}
      </CardContent>
    </Card>
  );
}

/** Skeleton rows for a table while loading. */
export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: cols }).map((_, i) => (
            <TableCell key={i}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, r) => (
          <TableRow key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <TableCell key={c}>
                <Skeleton className="h-5 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─────────────────────────── Constants ───────────────────────────

/** Admin API endpoints (factory-generated CRUD + JSON-array stores). */
export const API = {
  services: "/api/admin/services",
  blog: "/api/admin/blog",
  projects: "/api/admin/projects",
  industries: "/api/admin/industries",
  faqs: "/api/admin/faqs",
  testimonials: "/api/admin/testimonials",
  solutions: "/api/admin/solutions",
  media: "/api/admin/media",
  // Global site-config endpoints (CompanySettings key/value store)
  settings: "/api/admin/settings",
  navigation: "/api/admin/navigation",
  ctas: "/api/admin/ctas",
  process: "/api/admin/process",
  jobs: "/api/admin/jobs",
  legal: (type: "privacy" | "terms") => `/api/admin/legal/${type}`,
} as const;
