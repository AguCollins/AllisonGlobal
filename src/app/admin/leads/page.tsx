"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  Search,
  Inbox,
  Trash2,
  ChevronDown,
  ChevronRight,
  Download,
  RefreshCw,
  AlertCircle,
  Loader2,
  Phone,
  Building2,
  MessageSquare,
  Wrench,
  Mail,
} from "lucide-react";

interface Lead {
  id: string;
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  subject?: string | null;
  status: string;
  createdAt: string;
  services?: string | null;
  message?: string | null;
}

interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  pages: number;
}

const STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;
type Status = (typeof STATUSES)[number] | "all";

const TYPES = [
  { value: "all", label: "All types" },
  { value: "contact", label: "Contact" },
  { value: "quote", label: "Quote" },
  { value: "consultation", label: "Consultation" },
  { value: "assessment", label: "Assessment" },
  { value: "support", label: "Support" },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function ErrorState({
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
            <p className="font-medium text-destructive">Failed to load leads</p>
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

function exportLeadsCsv(leads: Lead[]) {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Company",
    "Type",
    "Status",
    "Subject",
    "Services",
    "Message",
    "Created At",
  ];
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = leads.map((l) =>
    [
      escape(l.name),
      escape(l.email),
      escape(l.phone),
      escape(l.company),
      escape(l.type),
      escape(l.status),
      escape(l.subject),
      escape(l.services),
      escape(l.message),
      escape(l.createdAt),
    ].join(","),
  );
  const csv = [headers.map(escape).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search input (immediate) + debounced value (drives fetch).
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");

  const [status, setStatus] = React.useState<Status>("all");
  const [type, setType] = React.useState("all");

  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);

  // Debounce search input.
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when filters change.
  React.useEffect(() => {
    setPage(1);
  }, [debounced, status, type]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (debounced) params.set("q", debounced);
      if (status !== "all") params.set("status", status);
      if (type !== "all") params.set("type", type);
      const res = await fetch(`/api/admin/leads?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as LeadsResponse;
      setLeads(json.leads);
      setTotal(json.total);
      setPages(json.pages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [page, debounced, status, type]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, newStatus: string) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { lead: { id: string; status: string } };
      setLeads((prev) =>
        prev.map((l) =>
          l.id === json.lead.id ? { ...l, status: json.lead.status } : l,
        ),
      );
    } catch (e) {
      console.error("Failed to update status:", e);
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteLead(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/leads?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setExpandedId(null);
    } catch (e) {
      console.error("Failed to delete lead:", e);
    } finally {
      setDeletingId(null);
    }
  }

  function handleExport() {
    setExporting(true);
    try {
      exportLeadsCsv(leads);
    } finally {
      setTimeout(() => setExporting(false), 600);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">
            {total > 0 ? `${total} total submissions` : "Manage form submissions"}
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="min-h-10"
          onClick={handleExport}
          disabled={exporting || leads.length === 0}
        >
          <Download className="size-4" />
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search name, email, subject…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-9"
                aria-label="Search leads"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                Type
              </label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-10 min-w-36" aria-label="Filter by type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status filter pills */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by status"
          >
            {(["all", ...STATUSES] as const).map((s) => (
              <Button
                key={s}
                variant={status === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus(s as Status)}
                className={cn(
                  "min-h-10 capitalize",
                  status === s && "bg-brand text-brand-foreground hover:bg-brand/90",
                )}
              >
                {s}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Error / loading / empty / table */}
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <Card>
          <CardContent className="px-0">
            {loading ? (
              <div className="space-y-2 px-6 pb-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <Inbox className="size-12 text-muted-foreground/40" />
                <div>
                  <p className="font-medium">No leads found</p>
                  <p className="text-sm text-muted-foreground">
                    {debounced || status !== "all" || type !== "all"
                      ? "Try adjusting your filters."
                      : "New form submissions will appear here."}
                  </p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => {
                    const isExpanded = expandedId === lead.id;
                    return (
                      <React.Fragment key={lead.id}>
                        <TableRow
                          className={cn(
                            "cursor-pointer",
                            isExpanded && "bg-muted/40",
                          )}
                          onClick={() =>
                            setExpandedId(isExpanded ? null : lead.id)
                          }
                        >
                          <TableCell className="align-middle">
                            {isExpanded ? (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="size-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {lead.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {lead.type}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <Select
                                value={lead.status}
                                onValueChange={(v) => updateStatus(lead.id, v)}
                                disabled={updatingId === lead.id}
                              >
                                <SelectTrigger
                                  className="h-9 min-w-32 capitalize"
                                  aria-label={`Change status for ${lead.name}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUSES.map((s) => (
                                    <SelectItem
                                      key={s}
                                      value={s}
                                      className="capitalize"
                                    >
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {updatingId === lead.id && (
                                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatDate(lead.createdAt)}
                          </TableCell>
                          <TableCell
                            className="align-middle"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-10 text-muted-foreground hover:text-destructive"
                                  aria-label={`Delete lead from ${lead.name}`}
                                  disabled={deletingId === lead.id}
                                >
                                  {deletingId === lead.id ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="size-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete this lead?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the lead from{" "}
                                    <span className="font-medium text-foreground">
                                      {lead.name}
                                    </span>{" "}
                                    (&lt;{lead.email}&gt;). This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="min-h-10">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="min-h-10 bg-destructive text-white hover:bg-destructive/90"
                                    onClick={() => deleteLead(lead.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={7} className="p-0">
                              <div className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-cols-2 lg:grid-cols-3">
                                <DetailField
                                  icon={Mail}
                                  label="Email"
                                  value={lead.email}
                                  href={`mailto:${lead.email}`}
                                />
                                <DetailField
                                  icon={Phone}
                                  label="Phone"
                                  value={lead.phone}
                                  href={
                                    lead.phone
                                      ? `tel:${lead.phone.replace(/\s+/g, "")}`
                                      : undefined
                                  }
                                />
                                <DetailField
                                  icon={Building2}
                                  label="Company"
                                  value={lead.company}
                                />
                                <DetailField
                                  icon={MessageSquare}
                                  label="Subject"
                                  value={lead.subject}
                                />
                                <DetailField
                                  icon={Wrench}
                                  label="Services"
                                  value={lead.services}
                                />
                                <div className="md:col-span-2 lg:col-span-3">
                                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    <MessageSquare className="size-3.5" />
                                    Message
                                  </p>
                                  <p className="whitespace-pre-wrap rounded-md border border-border bg-background p-3 text-sm">
                                    {lead.message || (
                                      <span className="text-muted-foreground italic">
                                        No message provided.
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {/* Pagination */}
          {!loading && leads.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-6 py-3 sm:flex-row">
              <p className="text-xs text-muted-foreground">
                Page {page} of {pages} · {total} leads
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-10"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-10"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  href?: string;
}) {
  const display = value && value.trim() !== "" ? value : "—";
  const isLink = href && value && value.trim() !== "";
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </p>
      {isLink ? (
        <a
          href={href}
          className="text-sm text-brand hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm">{display}</p>
      )}
    </div>
  );
}
