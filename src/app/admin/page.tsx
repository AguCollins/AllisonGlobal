"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Inbox,
  Sparkles,
  Wrench,
  Newspaper,
  Users as UsersIcon,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  ScrollText,
  FileText,
  Briefcase,
  Quote,
  HelpCircle,
  ShieldCheck,
  Activity,
} from "lucide-react";

interface Stats {
  totalLeads: number;
  newLeads: number;
  totalServices: number;
  totalPosts: number;
  totalUsers: number;
}

interface RecentLead {
  id: string;
  name: string;
  email: string;
  type: string;
  status: string;
  createdAt: string;
}

interface StatsResponse {
  stats: Stats;
  recentLeads: RecentLead[];
}

// ───────────────────────── Content health types ─────────────────────────

interface ContentHealth {
  blog: {
    published: number;
    drafts: number;
    missingSeo: number;
    total: number;
  };
  services: {
    published: number;
    missingMeta: number;
    total: number;
  };
  projects: {
    published: number;
    missingImages: number;
    total: number;
  };
  testimonials: {
    published: number;
    total: number;
  };
  faqs: {
    published: number;
    total: number;
  };
}

interface CrudRow {
  id: string;
  published?: boolean;
  status?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  gallery?: unknown;
  ogImage?: string | null;
  featuredImage?: string | null;
}

interface CrudResponse {
  items: CrudRow[];
  total: number;
}

const STATUS_STYLES: Record<string, string> = {
  new: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  contacted: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  qualified: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  won: "bg-brand text-brand-foreground",
  lost: "bg-destructive/15 text-destructive",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status] || "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string) {
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

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardDescription className="text-xs font-medium uppercase tracking-wider">
            {label}
          </CardDescription>
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Icon className="size-4" />
          </div>
        </div>
        <CardTitle className="font-display text-3xl font-bold tracking-tight">
          {value}
        </CardTitle>
      </CardHeader>
      {hint && (
        <CardContent className="pt-0 text-xs text-muted-foreground">
          {hint}
        </CardContent>
      )}
    </Card>
  );
}

function StatSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="size-9 rounded-lg" />
        </div>
        <Skeleton className="mt-2 h-8 w-16" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
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
        <Button variant="outline" size="lg" className="min-h-10" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

// ───────────────────────── Content health card ─────────────────────────

interface MetricRow {
  label: string;
  value: number;
  tone?: "default" | "warning" | "danger";
}

function ContentHealthCard({
  title,
  href,
  icon: Icon,
  metrics,
  loading,
}: {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  metrics: MetricRow[];
  loading?: boolean;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="font-display text-base">{title}</CardTitle>
            <CardDescription className="text-xs">Content overview</CardDescription>
          </div>
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Icon className="size-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 pt-0">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : (
          <dl className="space-y-2">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <dt className="text-muted-foreground">{m.label}</dt>
                <dd
                  className={
                    m.tone === "warning"
                      ? "font-semibold text-amber-600 dark:text-amber-400"
                      : m.tone === "danger"
                        ? "font-semibold text-destructive"
                        : "font-semibold text-foreground"
                  }
                >
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mt-auto min-h-10 justify-start text-brand hover:bg-brand/5 hover:text-brand"
        >
          <Link href={href}>
            Manage {title.toLowerCase()}
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ───────────────────────── Helpers for content health ─────────────────────────

function isNonEmptyString(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

function arrayLength(v: unknown): number {
  return Array.isArray(v) ? v.length : 0;
}

// ───────────────────────── Dashboard ─────────────────────────

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<StatsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [health, setHealth] = React.useState<ContentHealth | null>(null);
  const [healthLoading, setHealthLoading] = React.useState(true);
  const [healthError, setHealthError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as StatsResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHealth = React.useCallback(async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      // Fetch all draft+published items for each content type (limit 200)
      const [blogRes, servicesRes, projectsRes, testimonialsRes, faqsRes] =
        await Promise.all([
          fetch("/api/admin/blog?drafts=true&limit=200", { cache: "no-store" }),
          fetch("/api/admin/services?drafts=true&limit=200", { cache: "no-store" }),
          fetch("/api/admin/projects?drafts=true&limit=200", { cache: "no-store" }),
          fetch("/api/admin/testimonials?drafts=true&limit=200", { cache: "no-store" }),
          fetch("/api/admin/faqs?drafts=true&limit=200", { cache: "no-store" }),
        ]);

      const responses: Array<{ label: string; res: Response }> = [
        { label: "blog", res: blogRes },
        { label: "services", res: servicesRes },
        { label: "projects", res: projectsRes },
        { label: "testimonials", res: testimonialsRes },
        { label: "faqs", res: faqsRes },
      ];
      const failed = responses.find(({ res }) => !res.ok);
      if (failed) {
        throw new Error(`Failed to load ${failed.label} (HTTP ${failed.res.status})`);
      }

      const [blog, services, projects, testimonials, faqs] = (await Promise.all([
        blogRes.json(),
        servicesRes.json(),
        projectsRes.json(),
        testimonialsRes.json(),
        faqsRes.json(),
      ])) as [
        CrudResponse,
        CrudResponse,
        CrudResponse,
        CrudResponse,
        CrudResponse,
      ];

      const blogItems = blog.items ?? [];
      const serviceItems = services.items ?? [];
      const projectItems = projects.items ?? [];
      const testimonialItems = testimonials.items ?? [];
      const faqItems = faqs.items ?? [];

      setHealth({
        blog: {
          total: blog.total ?? blogItems.length,
          published: blogItems.filter((p) => p.status === "published").length,
          drafts: blogItems.filter((p) => p.status === "draft").length,
          missingSeo: blogItems.filter(
            (p) => !isNonEmptyString(p.metaTitle) || !isNonEmptyString(p.metaDescription),
          ).length,
        },
        services: {
          total: services.total ?? serviceItems.length,
          published: serviceItems.filter((s) => s.published).length,
          missingMeta: serviceItems.filter(
            (s) => !isNonEmptyString(s.metaDescription),
          ).length,
        },
        projects: {
          total: projects.total ?? projectItems.length,
          published: projectItems.filter((p) => p.published).length,
          missingImages:
            projectItems.filter(
              (p) =>
                arrayLength(p.gallery) === 0 &&
                !isNonEmptyString(p.featuredImage) &&
                !isNonEmptyString(p.ogImage),
            ).length,
        },
        testimonials: {
          total: testimonials.total ?? testimonialItems.length,
          published: testimonialItems.filter((t) => t.published).length,
        },
        faqs: {
          total: faqs.total ?? faqItems.length,
          published: faqItems.filter((f) => f.published).length,
        },
      });
    } catch (e) {
      setHealthError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setHealthLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    loadHealth();
  }, [load, loadHealth]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of leads, content and admin activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="lg" className="min-h-10">
            <Link href="/admin/services">
              <Wrench className="size-4" />
              Manage services
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-h-10">
            <Link href="/admin/users">
              <UsersIcon className="size-4" />
              Manage users
            </Link>
          </Button>
          <Button asChild size="lg" className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90">
            <Link href="/admin/leads">
              <Inbox className="size-4" />
              View leads
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : data ? (
            <>
              <StatCard
                label="Total Leads"
                value={data.stats.totalLeads}
                icon={Inbox}
                hint={`${data.stats.newLeads} new`}
              />
              <StatCard
                label="New Leads"
                value={data.stats.newLeads}
                icon={Sparkles}
                hint="Awaiting first contact"
              />
              <StatCard
                label="Services"
                value={data.stats.totalServices}
                icon={Wrench}
                hint="Published services"
              />
              <StatCard
                label="Blog Posts"
                value={data.stats.totalPosts}
                icon={Newspaper}
                hint="Published posts"
              />
              <StatCard
                label="Admin Users"
                value={data.stats.totalUsers}
                icon={UsersIcon}
                hint="With access"
              />
            </>
          ) : null}
        </div>
      )}

      {/* ─────────────── Content Health section ─────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Activity className="size-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight">
                Content Health
              </h2>
              <p className="text-xs text-muted-foreground">
                Spot missing SEO, drafts, and incomplete records across content types.
              </p>
            </div>
          </div>
          {healthError && (
            <Button
              variant="outline"
              size="sm"
              className="min-h-10"
              onClick={loadHealth}
            >
              <RefreshCw className="size-4" />
              Retry
            </Button>
          )}
        </div>

        {healthError ? (
          <ErrorState message={healthError} onRetry={loadHealth} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ContentHealthCard
              title="Blog"
              href="/admin/blog"
              icon={Newspaper}
              loading={healthLoading}
              metrics={
                health
                  ? [
                      { label: "Published", value: health.blog.published },
                      { label: "Drafts", value: health.blog.drafts, tone: health.blog.drafts > 0 ? "warning" : "default" },
                      { label: "Missing SEO", value: health.blog.missingSeo, tone: health.blog.missingSeo > 0 ? "danger" : "default" },
                    ]
                  : []
              }
            />
            <ContentHealthCard
              title="Services"
              href="/admin/services"
              icon={Briefcase}
              loading={healthLoading}
              metrics={
                health
                  ? [
                      { label: "Published", value: health.services.published },
                      { label: "Missing meta descriptions", value: health.services.missingMeta, tone: health.services.missingMeta > 0 ? "danger" : "default" },
                      { label: "Total", value: health.services.total },
                    ]
                  : []
              }
            />
            <ContentHealthCard
              title="Projects"
              href="/admin/projects"
              icon={Briefcase}
              loading={healthLoading}
              metrics={
                health
                  ? [
                      { label: "Published", value: health.projects.published },
                      { label: "Missing images", value: health.projects.missingImages, tone: health.projects.missingImages > 0 ? "danger" : "default" },
                      { label: "Total", value: health.projects.total },
                    ]
                  : []
              }
            />
            <ContentHealthCard
              title="Testimonials"
              href="/admin/testimonials"
              icon={Quote}
              loading={healthLoading}
              metrics={
                health
                  ? [
                      { label: "Published", value: health.testimonials.published },
                      { label: "Total", value: health.testimonials.total },
                    ]
                  : []
              }
            />
            <ContentHealthCard
              title="FAQs"
              href="/admin/faqs"
              icon={HelpCircle}
              loading={healthLoading}
              metrics={
                health
                  ? [
                      { label: "Published", value: health.faqs.published },
                      { label: "Total", value: health.faqs.total },
                    ]
                  : []
              }
            />
            <ContentHealthCard
              title="Audit & Access"
              href="/admin/audit"
              icon={ShieldCheck}
              loading={false}
              metrics={
                health
                  ? [
                      { label: "Blog total", value: health.blog.total },
                      { label: "Service total", value: health.services.total },
                      { label: "Project total", value: health.projects.total },
                    ]
                  : []
              }
            />
          </div>
        )}
      </section>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Quick actions</CardTitle>
          <CardDescription>
            Jump to the most common admin tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="min-h-10">
            <Link href="/admin/leads">
              <Inbox className="size-4" />
              View all leads
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-10">
            <Link href="/admin/services">
              <Wrench className="size-4" />
              Edit services
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-10">
            <Link href="/admin/users">
              <UsersIcon className="size-4" />
              Manage admin users
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-10">
            <Link href="/admin/audit">
              <ScrollText className="size-4" />
              Audit log
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-10">
            <Link href="/admin/media">
              <FileText className="size-4" />
              Media library
            </Link>
          </Button>
          <Button asChild className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90">
            <Link href="/quote">
              <PlusCircle className="size-4" />
              Open quote form
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent leads */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="font-display text-lg">Recent Leads</CardTitle>
            <CardDescription>Latest 5 submissions across all forms.</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="min-h-10">
            <Link href="/admin/leads">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="space-y-2 px-6 pb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="px-6 pb-4">
              <ErrorState message={error} onRetry={load} />
            </div>
          ) : data && data.recentLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <Inbox className="size-10 text-muted-foreground/50" />
              <div>
                <p className="font-medium">No leads yet</p>
                <p className="text-sm text-muted-foreground">
                  New form submissions will appear here.
                </p>
              </div>
              <Button asChild variant="outline" size="lg" className="min-h-10">
                <Link href="/contact">
                  <PlusCircle className="size-4" />
                  Open contact form
                </Link>
              </Button>
            </div>
          ) : data ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {lead.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
