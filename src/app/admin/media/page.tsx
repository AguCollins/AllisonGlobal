"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  Images,
  PlusCircle,
  Search,
  Loader2,
  Trash2,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  PageHeader,
  EmptyState,
  API,
  formatDate,
} from "@/components/admin/shared";

// ───────────────────────── Types ─────────────────────────

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
  category: string;
  createdAt: string;
}

interface ListResponse {
  items: MediaItem[];
  total: number;
}

// ───────────────────────── Constants ─────────────────────────

const MIME_OPTIONS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];

const CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "hero", label: "Hero" },
  { value: "service", label: "Service" },
  { value: "project", label: "Project" },
  { value: "blog", label: "Blog" },
  { value: "team", label: "Team" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All categories" },
  ...CATEGORY_OPTIONS,
];

interface NewFormState {
  url: string;
  filename: string;
  mimeType: string;
  category: string;
  altText: string;
  caption: string;
}

const emptyForm: NewFormState = {
  url: "",
  filename: "",
  mimeType: "image/jpeg",
  category: "general",
  altText: "",
  caption: "",
};

// ───────────────────────── Helpers ─────────────────────────

function detectMimeFromUrl(url: string): string {
  const cleaned = url.split("?")[0].split("#")[0].toLowerCase();
  if (cleaned.endsWith(".jpg") || cleaned.endsWith(".jpeg")) return "image/jpeg";
  if (cleaned.endsWith(".png")) return "image/png";
  if (cleaned.endsWith(".webp")) return "image/webp";
  if (cleaned.endsWith(".gif")) return "image/gif";
  if (cleaned.endsWith(".svg")) return "image/svg+xml";
  if (cleaned.endsWith(".avif")) return "image/avif";
  return "image/jpeg";
}

function detectFilenameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname;
    const parts = path.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last ? decodeURIComponent(last) : "image";
  } catch {
    if (!url) return "";
    const parts = url.split("/").filter(Boolean);
    const last = parts[parts.length - 1]?.split("?")[0]?.split("#")[0];
    return last ? decodeURIComponent(last) : "image";
  }
}

function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ───────────────────────── Inline alt-text editor ─────────────────────────

function AltTextEditor({
  item,
  onSaved,
}: {
  item: MediaItem;
  onSaved?: (updated: MediaItem) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(item.altText ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setValue(item.altText ?? "");
  }, [item.altText]);

  async function save() {
    if (value === (item.altText ?? "")) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(API.media, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, altText: value }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Alt text updated");
      onSaved?.({ ...item, altText: value });
      setEditing(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update alt text");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="block w-full text-left text-xs text-muted-foreground hover:text-foreground"
        title="Click to edit alt text"
      >
        {item.altText ? (
          <span className="line-clamp-2">{item.altText}</span>
        ) : (
          <span className="italic text-amber-600 dark:text-amber-400">
            Add alt text…
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        placeholder="Describe the image for screen readers"
        disabled={saving}
        className="text-xs"
        autoFocus
      />
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          disabled={saving}
          onClick={() => {
            setValue(item.altText ?? "");
            setEditing(false);
          }}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-8 bg-brand px-2 text-xs text-brand-foreground hover:bg-brand/90"
          disabled={saving}
          onClick={save}
        >
          {saving ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Check className="size-3" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}

// ───────────────────────── Add Media dialog ─────────────────────────

function AddMediaDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (item: MediaItem) => void;
}) {
  const [form, setForm] = React.useState<NewFormState>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  function update<K extends keyof NewFormState>(key: K, value: NewFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleUrlChange(url: string) {
    update("url", url);
    // Auto-detect mime + filename from URL when those fields are empty
    if (!form.filename || form.filename === detectFilenameFromUrl(form.url)) {
      update("filename", detectFilenameFromUrl(url));
    }
    const detected = detectMimeFromUrl(url);
    if (url) {
      update("mimeType", detected);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.url.trim()) {
      toast.error("URL is required");
      return;
    }
    if (!form.filename.trim()) {
      toast.error("Filename is required");
      return;
    }
    setSubmitting(true);
    try {
      // Try to fetch image headers to get size + dimensions (best effort,
      // ignored on failure — server may not allow CORS).
      const res = await fetch(API.media, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: form.url.trim(),
          filename: form.filename.trim(),
          mimeType: form.mimeType,
          size: 0,
          altText: form.altText.trim(),
          caption: form.caption.trim() || null,
          category: form.category,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as { item: MediaItem };
      toast.success("Media added");
      onCreated?.(json.item);
      setForm(emptyForm);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add media");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setForm(emptyForm);
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add media</DialogTitle>
          <DialogDescription>
            Register an existing publicly-accessible image URL in the library.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Image URL *</Label>
            <Input
              id="url"
              type="url"
              value={form.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://…"
              className="h-10"
              required
            />
          </div>

          {form.url && (
            <div className="overflow-hidden rounded-md border border-border">
              <div
                className="relative w-full bg-muted/40"
                style={{ aspectRatio: "16 / 9" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.url}
                  alt="Preview"
                  className="absolute inset-0 size-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                  }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="filename">Filename *</Label>
              <Input
                id="filename"
                value={form.filename}
                onChange={(e) => update("filename", e.target.value)}
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mimeType">MIME type</Label>
              <Select
                value={form.mimeType}
                onValueChange={(v) => update("mimeType", v)}
              >
                <SelectTrigger id="mimeType" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MIME_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => update("category", v)}
              >
                <SelectTrigger id="category" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="altText">Alt text</Label>
              <Input
                id="altText"
                value={form.altText}
                onChange={(e) => update("altText", e.target.value)}
                placeholder="Describe the image for accessibility"
                className="h-10"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="caption">Caption (optional)</Label>
              <Textarea
                id="caption"
                value={form.caption}
                onChange={(e) => update("caption", e.target.value)}
                rows={2}
                placeholder="Caption shown beneath the image (optional)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="min-h-10"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PlusCircle className="size-4" />
              )}
              Add media
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ───────────────────────── Page ─────────────────────────

export default function AdminMediaPage() {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [addOpen, setAddOpen] = React.useState(false);

  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<MediaItem | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (category !== "all") params.set("category", category);
      if (debounced) params.set("q", debounced);
      const res = await fetch(`${API.media}?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ListResponse;
      setItems(json.items ?? []);
      setTotal(json.total ?? 0);
    } catch (e) {
      setItems([]);
      setTotal(0);
      setError(
        e instanceof Error
          ? `Database unavailable — ${e.message}`
          : "Database unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }, [category, debounced]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(
        `${API.media}?id=${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setItems((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Media deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete media");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  function handleItemUpdated(updated: MediaItem) {
    setItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  function handleCreated(item: MediaItem) {
    setItems((prev) => [item, ...prev]);
    setTotal((t) => t + 1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Images}
        title="Media Library"
        description={`${total} ${total === 1 ? "asset" : "assets"}`}
        action={
          <Button
            size="lg"
            className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => setAddOpen(true)}
          >
            <PlusCircle className="size-4" />
            Add Media
          </Button>
        }
      />

      {error && (
        <div className="flex items-start gap-3 rounded-md border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filename or alt text…"
            aria-label="Search media"
            className="h-10 pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-10 w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div
                className="w-full animate-pulse bg-muted/40"
                style={{ aspectRatio: "1 / 1" }}
              />
              <CardContent className="space-y-2 p-3">
                <div className="h-3 w-3/4 animate-pulse rounded bg-muted/60" />
                <div className="h-2 w-1/2 animate-pulse rounded bg-muted/60" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Images}
          title={debounced ? "No matching media" : "No media yet"}
          description={
            debounced
              ? "Try a different search term or category."
              : "Add your first image to start building the library."
          }
          actionLabel={debounced ? undefined : "Add Media"}
          onAction={debounced ? undefined : () => setAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <Card
              key={m.id}
              className="group flex flex-col overflow-hidden transition hover:shadow-sm"
            >
              <div className="relative aspect-square w-full bg-muted/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.url}
                  alt={m.altText || m.filename}
                  className="absolute inset-0 size-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                  }}
                />
                <div className="absolute right-2 top-2 flex gap-1">
                  <Badge className="bg-background/90 text-foreground shadow-sm">
                    {m.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="flex flex-1 flex-col gap-2 p-3">
                <p
                  className="line-clamp-1 text-sm font-medium"
                  title={m.filename}
                >
                  {m.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {m.width && m.height
                    ? `${m.width}×${m.height}`
                    : "Dimensions unknown"}
                  {" · "}
                  {formatSize(m.size)}
                </p>
                <AltTextEditor item={m} onSaved={handleItemUpdated} />
                <div className="mt-auto flex items-center justify-between pt-1">
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(m.createdAt)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 hover:text-destructive"
                    title="Delete"
                    disabled={deletingId === m.id}
                    onClick={() => setDeleteTarget(m)}
                  >
                    {deletingId === m.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddMediaDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={handleCreated}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete media?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.filename}
              </span>
              . The original file at{" "}
              <span className="break-all font-mono text-xs">
                {deleteTarget?.url}
              </span>{" "}
              will remain where it is hosted — only the library entry is
              removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
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
