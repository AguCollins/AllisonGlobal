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
  Megaphone,
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
  API,
} from "@/components/admin/shared";

// ─────────────────────────── Types ───────────────────────────

type CtaTheme = "brand" | "ink" | "light" | "amber";

interface Cta {
  id: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  theme: string;
  visible: boolean;
}

interface CtaForm {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  theme: CtaTheme;
  visible: boolean;
}

// ─────────────────────────── Static fallback ───────────────────────────

function staticFallback(): Cta[] {
  return [
    {
      id: "cta-1",
      title: "Let's secure what matters",
      description:
        "Choose the path that fits — or just reach out. One conversation with our engineering team is usually all it takes to get clarity on your next step.",
      primaryLabel: "Get a quote",
      primaryHref: "/quote",
      secondaryLabel: "Talk to us",
      secondaryHref: "/contact",
      theme: "brand",
      visible: true,
    },
    {
      id: "cta-2",
      title: "Ready to talk?",
      description: "Book a consultation with our engineering team today.",
      primaryLabel: "Book consultation",
      primaryHref: "/contact",
      secondaryLabel: "",
      secondaryHref: "",
      theme: "ink",
      visible: true,
    },
  ];
}

function emptyForm(): CtaForm {
  return {
    title: "",
    description: "",
    primaryLabel: "",
    primaryHref: "",
    secondaryLabel: "",
    secondaryHref: "",
    theme: "brand",
    visible: true,
  };
}

// ─────────────────────────── Page ───────────────────────────

export default function AdminCtasPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isSuperadmin = role === "superadmin";

  const [items, setItems] = React.useState<Cta[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Cta | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<CtaForm>(emptyForm());

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API.ctas, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { items: Cta[] };
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

  function openEdit(c: Cta) {
    setEditingId(c.id);
    setForm({
      title: c.title,
      description: c.description,
      primaryLabel: c.primaryLabel,
      primaryHref: c.primaryHref,
      secondaryLabel: c.secondaryLabel,
      secondaryHref: c.secondaryHref,
      theme: (c.theme as CtaTheme) || "brand",
      visible: c.visible,
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
      if (editingId) {
        const res = await fetch(API.ctas, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...form }),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as { item: Cta };
        setItems((prev) => prev.map((c) => (c.id === editingId ? json.item : c)));
        toast.success("CTA updated");
      } else {
        const res = await fetch(API.ctas, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as { item: Cta };
        setItems((prev) => [...prev, json.item]);
        toast.success("CTA created");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save CTA");
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`${API.ctas}?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setItems((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success("CTA deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete CTA");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  // ── Forbidden ──
  if (status !== "loading" && !isSuperadmin) {
    return (
      <div className="space-y-6">
        <PageHeader icon={Megaphone} title="Call-to-Actions" />
        <CardForbidden />
      </div>
    );
  }

  if (loading || status === "loading") {
    return (
      <div className="space-y-6">
        <PageHeader icon={Megaphone} title="Call-to-Actions" description="Manage conversion CTAs shown across the site." />
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Megaphone}
        title="Call-to-Actions"
        description="Manage conversion CTAs shown across the site."
        action={
          <Button
            type="button"
            className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={openCreate}
          >
            <Plus className="size-4" /> New CTA
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
          icon={Megaphone}
          title="No CTAs yet"
          description="Create your first call-to-action to drive conversions."
          actionLabel="New CTA"
          onAction={openCreate}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Title</TableHead>
                <TableHead className="px-4">Description</TableHead>
                <TableHead className="w-[120px] px-4">Theme</TableHead>
                <TableHead className="w-[100px] px-4 text-center">Visible</TableHead>
                <TableHead className="w-[140px] px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="px-4 py-3 font-medium">
                    {c.title || <span className="text-muted-foreground">Untitled</span>}
                  </TableCell>
                  <TableCell className="max-w-md px-4 py-3 text-sm text-muted-foreground">
                    <p className="line-clamp-2">{c.description}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="secondary" className="capitalize">{c.theme}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {c.visible ? (
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
                        onClick={() => openEdit(c)}
                        title="Edit"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 hover:text-destructive"
                        disabled={deletingId === c.id}
                        onClick={() => setDeleteTarget(c)}
                        title="Delete"
                      >
                        {deletingId === c.id ? (
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit CTA" : "Create CTA"}</DialogTitle>
            <DialogDescription>
              Configure how this call-to-action appears on the site.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cta-title">Title</Label>
              <Input
                id="cta-title"
                className="h-10"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Let's secure what matters"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cta-desc">Description</Label>
              <Textarea
                id="cta-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short supporting copy…"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cta-pl">Primary button label</Label>
                <Input
                  id="cta-pl"
                  className="h-10"
                  value={form.primaryLabel}
                  onChange={(e) => setForm({ ...form, primaryLabel: e.target.value })}
                  placeholder="Get a quote"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cta-ph">Primary button href</Label>
                <Input
                  id="cta-ph"
                  className="h-10"
                  value={form.primaryHref}
                  onChange={(e) => setForm({ ...form, primaryHref: e.target.value })}
                  placeholder="/quote"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cta-sl">Secondary button label</Label>
                <Input
                  id="cta-sl"
                  className="h-10"
                  value={form.secondaryLabel}
                  onChange={(e) => setForm({ ...form, secondaryLabel: e.target.value })}
                  placeholder="Talk to us"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cta-sh">Secondary button href</Label>
                <Input
                  id="cta-sh"
                  className="h-10"
                  value={form.secondaryHref}
                  onChange={(e) => setForm({ ...form, secondaryHref: e.target.value })}
                  placeholder="/contact"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Theme</Label>
                <Select
                  value={form.theme}
                  onValueChange={(v) => setForm({ ...form, theme: v as CtaTheme })}
                >
                  <SelectTrigger className="h-10 w-full" aria-label="Theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand">Brand (emerald-teal)</SelectItem>
                    <SelectItem value="ink">Ink (dark)</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="amber">Amber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch
                  id="cta-vis"
                  checked={form.visible}
                  onCheckedChange={(c) => setForm({ ...form, visible: c })}
                />
                <Label htmlFor="cta-vis" className="cursor-pointer text-sm">
                  Visible on site
                </Label>
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
                    <Megaphone className="size-4" />
                    {editingId ? "Save changes" : "Create CTA"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete CTA?</AlertDialogTitle>
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
            Managing call-to-actions is restricted to superadmin accounts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
