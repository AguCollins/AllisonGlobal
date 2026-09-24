"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  Menu as MenuIcon,
  ShieldAlert,
  Loader2,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  PageHeader,
  EmptyState,
  TableSkeleton,
  useUnsavedChanges,
  API,
} from "@/components/admin/shared";
import { mainNav, utilityNav } from "@/lib/data/company";

// ─────────────────────────── Types ───────────────────────────

type NavType = "link" | "dropdown" | "cta";

interface NavItem {
  id: string;
  label: string;
  href: string;
  type: NavType;
  visible: boolean;
  openInNewTab: boolean;
  order: number;
}

// ─────────────────────────── Static fallback ───────────────────────────

function staticFallback(): NavItem[] {
  const items: NavItem[] = [];
  mainNav.forEach((n, i) => {
    items.push({
      id: `main-${i}`,
      label: n.label,
      href: `/${n.view === "home" ? "" : n.view}`,
      type: n.hasMega ? "dropdown" : "link",
      visible: true,
      openInNewTab: false,
      order: i,
    });
  });
  utilityNav.forEach((n, i) => {
    items.push({
      id: `util-${i}`,
      label: n.label,
      href: `/${n.view}`,
      type: "link",
      visible: true,
      openInNewTab: false,
      order: mainNav.length + i,
    });
  });
  return items;
}

function newId(): string {
  return `nav-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─────────────────────────── Page ───────────────────────────

export default function AdminNavigationPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isSuperadmin = role === "superadmin";

  const [items, setItems] = React.useState<NavItem[]>([]);
  const [original, setOriginal] = React.useState<NavItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<NavItem | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API.navigation, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { items: NavItem[] };
      const list = (json.items ?? []).slice().sort((a, b) => a.order - b.order);
      setItems(list);
      setOriginal(list);
    } catch (e) {
      const fb = staticFallback();
      setItems(fb);
      setOriginal(fb);
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

  const dirty = React.useMemo(() => {
    if (items.length !== original.length) return true;
    return items.some((it, i) => {
      const o = original[i];
      return (
        !o ||
        o.id !== it.id ||
        o.label !== it.label ||
        o.href !== it.href ||
        o.type !== it.type ||
        o.visible !== it.visible ||
        o.openInNewTab !== it.openInNewTab ||
        o.order !== it.order
      );
    });
  }, [items, original]);
  useUnsavedChanges(dirty);

  // ── Mutations ──
  function update(id: string, patch: Partial<NavItem>) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  }
  function move(id: string, dir: -1 | 1) {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.id === id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((it, i) => ({ ...it, order: i }));
    });
  }
  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        id: newId(),
        label: "New link",
        href: "/",
        type: "link",
        visible: true,
        openInNewTab: false,
        order: prev.length,
      },
    ]);
  }
  function removeItem(id: string) {
    setItems((prev) =>
      prev
        .filter((it) => it.id !== id)
        .map((it, i) => ({ ...it, order: i })),
    );
  }

  async function saveAll() {
    setSaving(true);
    try {
      const res = await fetch(API.navigation, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setOriginal(items);
      toast.success(`Navigation saved (${items.length} items)`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save navigation");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    // Optimistic UI removal (server-side save happens on Save)
    removeItem(deleteTarget.id);
    setDeleteTarget(null);
    setDeletingId(null);
    toast.success("Item removed — remember to save changes");
  }

  // ── Forbidden state ──
  if (status !== "loading" && !isSuperadmin) {
    return (
      <div className="space-y-6">
        <PageHeader icon={MenuIcon} title="Navigation" />
        <CardForbidden />
      </div>
    );
  }

  if (loading || status === "loading") {
    return (
      <div className="space-y-6">
        <PageHeader icon={MenuIcon} title="Navigation" description="Manage the links shown in the site header and footer." />
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={MenuIcon}
        title="Navigation"
        description="Manage the links shown in the site header and footer. Reorder with the arrows; save to publish."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-10"
              onClick={addItem}
              disabled={saving}
            >
              <Plus className="size-4" /> Add link
            </Button>
            <Button
              type="button"
              onClick={saveAll}
              disabled={saving || !dirty}
              className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="size-4" /> Save order
                </>
              )}
            </Button>
          </div>
        }
      />

      {error && (
        <div className="rounded-md border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          {error}
        </div>
      )}

      {dirty && (
        <div className="rounded-md border border-amber-300/40 bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          ● You have unsaved changes. Click “Save order” to publish.
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={MenuIcon}
          title="No navigation items"
          description="Add a link to start building your site navigation."
          actionLabel="Add link"
          onAction={addItem}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] px-4">Order</TableHead>
                <TableHead className="px-4">Label</TableHead>
                <TableHead className="px-4">Href</TableHead>
                <TableHead className="w-[150px] px-4">Type</TableHead>
                <TableHead className="w-[110px] px-4 text-center">Visible</TableHead>
                <TableHead className="w-[120px] px-4 text-center">New tab</TableHead>
                <TableHead className="w-[100px] px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it, i) => (
                <TableRow key={it.id}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        disabled={i === 0}
                        onClick={() => move(it.id, -1)}
                        title="Move up"
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        disabled={i === items.length - 1}
                        onClick={() => move(it.id, 1)}
                        title="Move down"
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <span className="ml-1 font-mono text-xs text-muted-foreground">
                        {it.order}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Input
                      className="h-9"
                      value={it.label}
                      onChange={(e) => update(it.id, { label: e.target.value })}
                      aria-label="Label"
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Input
                        className="h-9 font-mono text-xs"
                        value={it.href}
                        onChange={(e) => update(it.id, { href: e.target.value })}
                        aria-label="Href"
                      />
                      {it.href && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9"
                          asChild
                          title="View link"
                        >
                          <a href={it.href} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="size-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Select
                      value={it.type}
                      onValueChange={(v) => update(it.id, { type: v as NavType })}
                    >
                      <SelectTrigger className="h-9 w-full" aria-label="Type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="link">Link</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                        <SelectItem value="cta">CTA</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Switch
                        checked={it.visible}
                        onCheckedChange={(c) => update(it.id, { visible: c })}
                        aria-label="Visible"
                      />
                      {it.visible ? (
                        <Eye className="size-3.5 text-emerald-600" />
                      ) : (
                        <EyeOff className="size-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <Switch
                      checked={it.openInNewTab}
                      onCheckedChange={(c) => update(it.id, { openInNewTab: c })}
                      aria-label="Open in new tab"
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        {it.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 hover:text-destructive"
                        disabled={deletingId === it.id}
                        onClick={() => setDeleteTarget(it)}
                        title="Delete"
                      >
                        {deletingId === it.id ? (
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

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete navigation item?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to remove{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.label}
              </span>{" "}
              from the navigation. Save your changes to apply.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-10">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-10 bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CardForbidden() {
  return (
    <div className="rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-12 text-center dark:bg-amber-500/5">
      <ShieldAlert className="mx-auto size-10 text-amber-600 dark:text-amber-400" />
      <p className="mt-3 font-display text-lg font-bold">
        Superadmin access required
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Navigation management is restricted to superadmin accounts.
      </p>
    </div>
  );
}
