"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Briefcase,
  ShieldAlert,
  Loader2,
  Pencil,
  Trash2,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  PageHeader,
  EmptyState,
  TableSkeleton,
  arrayToCsv,
  csvToArray,
  API,
} from "@/components/admin/shared";
import { jobs as staticJobs } from "@/lib/data/careers";

// ─────────────────────────── Types ───────────────────────────

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  published: boolean;
}

interface JobForm {
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string;
  requirements: string;
  niceToHave: string;
  published: boolean;
}

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Volunteer",
];

// ─────────────────────────── Static fallback ───────────────────────────

function staticFallback(): Job[] {
  return staticJobs.map((j) => ({
    id: j.id,
    title: j.title,
    department: j.department,
    location: j.location,
    type: j.type,
    summary: j.summary,
    responsibilities: j.responsibilities,
    requirements: j.requirements,
    niceToHave: j.niceToHave ?? [],
    published: true,
  }));
}

function emptyForm(): JobForm {
  return {
    title: "",
    department: "",
    location: "Lagos, Nigeria",
    type: "Full-time",
    summary: "",
    responsibilities: "",
    requirements: "",
    niceToHave: "",
    published: true,
  };
}

// ─────────────────────────── Page ───────────────────────────

export default function AdminCareersPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isSuperadmin = role === "superadmin";

  const [items, setItems] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Job | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<JobForm>(emptyForm());

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API.jobs, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { items: Job[] };
      setItems(json.items ?? []);
    } catch (e) {
      setItems(staticFallback());
      setError(
        e instanceof Error
          ? `Database unavailable — showing static seed data. (${e.message})`
          : "Database unavailable — showing static seed data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isSuperadmin) load();
    else if (status !== "loading") setLoading(false);
  }, [load, isSuperadmin, status]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(j: Job) {
    setEditingId(j.id);
    setForm({
      title: j.title,
      department: j.department,
      location: j.location,
      type: j.type,
      summary: j.summary,
      responsibilities: arrayToCsv(j.responsibilities),
      requirements: arrayToCsv(j.requirements),
      niceToHave: arrayToCsv(j.niceToHave),
      published: j.published,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSavingId(editingId ?? "new");
    try {
      const payload = {
        title: form.title.trim(),
        department: form.department.trim(),
        location: form.location.trim(),
        type: form.type.trim(),
        summary: form.summary.trim(),
        responsibilities: csvToArray(form.responsibilities),
        requirements: csvToArray(form.requirements),
        niceToHave: csvToArray(form.niceToHave),
        published: form.published,
      };
      if (editingId) {
        const res = await fetch(API.jobs, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as { item: Job };
        setItems((prev) => prev.map((j) => (j.id === editingId ? json.item : j)));
        toast.success("Job updated");
      } else {
        const res = await fetch(API.jobs, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as { item: Job };
        setItems((prev) => [...prev, json.item]);
        toast.success("Job created");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save job");
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`${API.jobs}?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setItems((prev) => prev.filter((j) => j.id !== deleteTarget.id));
      toast.success("Job deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete job");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  // ── Forbidden ──
  if (status !== "loading" && !isSuperadmin) {
    return (
      <div className="space-y-6">
        <PageHeader icon={Briefcase} title="Careers" />
        <CardForbidden />
      </div>
    );
  }

  if (loading || status === "loading") {
    return (
      <div className="space-y-6">
        <PageHeader icon={Briefcase} title="Careers" description="Manage open positions on the careers page." />
        <TableSkeleton rows={4} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Briefcase}
        title="Careers"
        description="Manage open positions shown on the careers page."
        action={
          <Button
            type="button"
            className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={openCreate}
          >
            <Plus className="size-4" /> New job
          </Button>
        }
      />

      {error && (
        <div className="rounded-md border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No open positions"
          description="Add a job posting to start building your careers page."
          actionLabel="New job"
          onAction={openCreate}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Title</TableHead>
                <TableHead className="px-4">Department</TableHead>
                <TableHead className="px-4">Location</TableHead>
                <TableHead className="px-4">Type</TableHead>
                <TableHead className="w-[110px] px-4 text-center">Published</TableHead>
                <TableHead className="w-[140px] px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="px-4 py-3 font-medium">{j.title}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="secondary">{j.department || "—"}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">{j.location}</TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">{j.type}</TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {j.published ? (
                      <Eye className="mx-auto size-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="mx-auto size-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10"
                        onClick={() => openEdit(j)}
                        title="Edit"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 hover:text-destructive"
                        disabled={deletingId === j.id}
                        onClick={() => setDeleteTarget(j)}
                        title="Delete"
                      >
                        {deletingId === j.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit job posting" : "Create job posting"}</DialogTitle>
            <DialogDescription>
              Lists, responsibilities and requirements are comma-separated.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="j-title">Title</Label>
              <Input
                id="j-title"
                className="h-10"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Network & Security Engineer"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="j-dept">Department</Label>
                <Input
                  id="j-dept"
                  className="h-10"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Engineering"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="j-loc">Location</Label>
                <Input
                  id="j-loc"
                  className="h-10"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Lagos, Nigeria (field-based)"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v })}
                >
                  <SelectTrigger className="h-10 w-full" aria-label="Type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch
                  id="j-pub"
                  checked={form.published}
                  onCheckedChange={(c) => setForm({ ...form, published: c })}
                />
                <Label htmlFor="j-pub" className="cursor-pointer text-sm">
                  Published
                </Label>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="j-sum">Summary</Label>
              <Textarea
                id="j-sum"
                rows={3}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="One-paragraph role overview…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="j-resp">
                Responsibilities{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (comma-separated)
                </span>
              </Label>
              <Textarea
                id="j-resp"
                rows={3}
                value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                placeholder="Design networks, Configure firewalls, Commission systems"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="j-req">
                Requirements{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (comma-separated)
                </span>
              </Label>
              <Textarea
                id="j-req"
                rows={3}
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                placeholder="Degree in EE, Hands-on networking experience, Strong troubleshooting"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="j-nice">
                Nice-to-have{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (comma-separated, optional)
                </span>
              </Label>
              <Textarea
                id="j-nice"
                rows={2}
                value={form.niceToHave}
                onChange={(e) => setForm({ ...form, niceToHave: e.target.value })}
                placeholder="Vendor certifications, Surveillance integration experience"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="min-h-10">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={savingId !== null}
                className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {savingId !== null ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {editingId ? "Saving…" : "Creating…"}
                  </>
                ) : (
                  <>
                    <Briefcase className="size-4" />
                    {editingId ? "Save changes" : "Create job"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete job posting?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.title}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-10">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-10 bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CardForbidden() {
  return (
    <Card className="border-amber-300/40 bg-amber-50 dark:bg-amber-500/5">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
          <ShieldAlert className="size-7" />
        </div>
        <div>
          <p className="font-display text-lg font-bold">Superadmin access required</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Managing job postings is restricted to superadmin accounts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
