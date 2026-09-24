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

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<StatsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

  React.useEffect(() => {
    load();
  }, [load]);

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
