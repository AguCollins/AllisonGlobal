"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
  Workflow,
  ShieldAlert,
  Loader2,
  Pencil,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  PageHeader,
  EmptyState,
  TableSkeleton,
  arrayToCsv,
  csvToArray,
  API,
} from "@/components/admin/shared";
import { processSteps as staticProcess } from "@/lib/data/process";

// ─────────────────────────── Types ───────────────────────────

interface ProcessStep {
  id: string;
  step: number;
  title: string;
  summary: string;
  description: string;
  activities: string[];
  deliverable: string;
  iconName: string;
}

interface ProcessForm {
  step: number;
  title: string;
  summary: string;
  description: string;
  activities: string;
  deliverable: string;
  iconName: string;
}

// ─────────────────────────── Static fallback ───────────────────────────

function staticFallback(): ProcessStep[] {
  return staticProcess.map((s) => ({
    id: s.id,
    step: s.step,
    title: s.title,
    summary: s.summary,
    description: s.description,
    activities: s.activities,
    deliverable: s.deliverable,
    iconName: s.icon.name,
  }));
}

function emptyForm(step: number): ProcessForm {
  return {
    step,
    title: "",
    summary: "",
    description: "",
    activities: "",
    deliverable: "",
    iconName: "ClipboardList",
  };
}

// ─────────────────────────── Page ───────────────────────────

export default function AdminProcessPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isSuperadmin = role === "superadmin";

  const [items, setItems] = React.useState<ProcessStep[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ProcessStep | null>(null);
  const [movingId, setMovingId] = React.useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<ProcessForm>(emptyForm(1));

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API.process, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { items: ProcessStep[] };
      const list = (json.items ?? []).slice().sort((a, b) => a.step - b.step);
      setItems(list.length > 0 ? list : staticFallback());
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
    const nextStep = items.length + 1;
    setEditingId(null);
    setForm(emptyForm(nextStep));
    setDialogOpen(true);
  }

  function openEdit(s: ProcessStep) {
    setEditingId(s.id);
    setForm({
      step: s.step,
      title: s.title,
      summary: s.summary,
      description: s.description,
      activities: arrayToCsv(s.activities),
      deliverable: s.deliverable,
      iconName: s.iconName,
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
        step: Number(form.step) || 0,
        title: form.title.trim(),
        summary: form.summary.trim(),
        description: form.description.trim(),
        activities: csvToArray(form.activities),
        deliverable: form.deliverable.trim(),
        iconName: form.iconName.trim() || "ClipboardList",
      };
      if (editingId) {
        const res = await fetch(API.process, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as { item: ProcessStep };
        setItems((prev) =>
          prev.map((s) => (s.id === editingId ? json.item : s)).sort((a, b) => a.step - b.step),
        );
        toast.success("Process step updated");
      } else {
        const res = await fetch(API.process, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as { item: ProcessStep };
        setItems((prev) => [...prev, json.item].sort((a, b) => a.step - b.step));
        toast.success("Process step created");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save step");
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`${API.process}?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setItems((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success("Process step deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete step");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  async function move(id: string, dir: -1 | 1) {
    setMovingId(id);
    const idx = items.findIndex((s) => s.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= items.length) {
      setMovingId(null);
      return;
    }
    const a = items[idx];
    const b = items[target];
    // Swap step numbers via PATCH (two parallel requests)
    try {
      await Promise.all([
        fetch(API.process, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: a.id, step: b.step }),
        }),
        fetch(API.process, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: b.id, step: a.step }),
        }),
      ]);
      setItems((prev) => {
        const next = [...prev];
        [next[idx], next[target]] = [next[target], next[idx]];
        return next.slice().sort((a, b) => a.step - b.step);
      });
      toast.success("Order updated");
    } catch {
      toast.error("Failed to reorder steps");
    } finally {
      setMovingId(null);
    }
  }

  // ── Forbidden ──
  if (status !== "loading" && !isSuperadmin) {
    return (
      <div className="space-y-6">
        <PageHeader icon={Workflow} title="Process Steps" />
        <CardForbidden />
      </div>
    );
  }

  if (loading || status === "loading") {
    return (
      <div className="space-y-6">
        <PageHeader icon={Workflow} title="Process Steps" description="Manage the six-step delivery process shown on the site." />
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Workflow}
        title="Process Steps"
        description="Manage the six-step delivery process shown on the site."
        action={
          <Button
            type="button"
            className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={openCreate}
          >
            <Plus className="size-4" /> New step
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
          icon={Workflow}
          title="No process steps"
          description="Add your first process step to describe how you deliver projects."
          actionLabel="New step"
          onAction={openCreate}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] px-4">Step</TableHead>
                <TableHead className="px-4">Title</TableHead>
                <TableHead className="px-4">Summary</TableHead>
                <TableHead className="w-[140px] px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s, i) => (
                <TableRow key={s.id}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        disabled={i === 0 || movingId === s.id}
                        onClick={() => move(s.id, -1)}
                        title="Move up"
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        disabled={i === items.length - 1 || movingId === s.id}
                        onClick={() => move(s.id, 1)}
                        title="Move down"
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <span className="ml-1 font-mono text-sm font-semibold text-brand">
                        {s.step}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium">
                    {s.title}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {s.iconName}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-md px-4 py-3 text-sm text-muted-foreground">
                    <p className="line-clamp-2">{s.summary}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10"
                        onClick={() => openEdit(s)}
                        title="Edit"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 hover:text-destructive"
                        disabled={deletingId === s.id}
                        onClick={() => setDeleteTarget(s)}
                        title="Delete"
                      >
                        {deletingId === s.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : movingId === s.id ? (
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
            <DialogTitle>{editingId ? "Edit process step" : "Create process step"}</DialogTitle>
            <DialogDescription>
              Step number controls display order. Activities are comma-separated.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
              <div className="space-y-1.5">
                <Label htmlFor="p-step">Step #</Label>
                <Input
                  id="p-step"
                  type="number"
                  min={1}
                  className="h-10"
                  value={form.step}
                  onChange={(e) => setForm({ ...form, step: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-title">Title</Label>
                <Input
                  id="p-title"
                  className="h-10"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Consultation & Site Assessment"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-summary">Summary</Label>
              <Input
                id="p-summary"
                className="h-10"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Short one-line summary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea
                id="p-desc"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Longer description of what happens in this step…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-act">
                Activities{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (comma-separated)
                </span>
              </Label>
              <Textarea
                id="p-act"
                rows={3}
                value={form.activities}
                onChange={(e) => setForm({ ...form, activities: e.target.value })}
                placeholder="Requirements discussion, Site walk-through, Risk assessment"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="p-deliv">Deliverable</Label>
                <Input
                  id="p-deliv"
                  className="h-10"
                  value={form.deliverable}
                  onChange={(e) => setForm({ ...form, deliverable: e.target.value })}
                  placeholder="Site assessment report"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-icon">Icon name</Label>
                <Input
                  id="p-icon"
                  className="h-10 font-mono text-xs"
                  value={form.iconName}
                  onChange={(e) => setForm({ ...form, iconName: e.target.value })}
                  placeholder="ClipboardList"
                />
              </div>
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
                    <Workflow className="size-4" />
                    {editingId ? "Save changes" : "Create step"}
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
            <AlertDialogTitle>Delete process step?</AlertDialogTitle>
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
            Managing process steps is restricted to superadmin accounts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
