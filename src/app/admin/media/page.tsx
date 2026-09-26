"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  Upload,
  Cloud,
  CloudOff,
  ExternalLink,
  ZoomIn,
} from "lucide-react";
import {
  PageHeader,
  EmptyState,
  API,
  formatDate,
} from "@/components/admin/shared";
import { cn } from "@/lib/utils";

// ───────────────────────── Types ─────────────────────────

interface MediaItem {
  id: string;
  url: string;
  publicId?: string | null;
  originalUrl?: string | null;
  filename: string;
  mimeType: string;
  format?: string | null;
  size: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
  title?: string | null;
  folder?: string | null;
  category: string;
  createdAt: string;
}

interface ListResponse {
  items: MediaItem[];
  total: number;
}

interface CloudinarySignResponse {
  configured: boolean;
  cloudName?: string;
  apiKey?: string;
  timestamp?: number;
  signature?: string;
  uploadPreset?: string;
  uploadUrl?: string;
  error?: string;
}

interface UploadProgress {
  filename: string;
  progress: number; // 0–100
  status: "uploading" | "storing" | "done" | "error";
  error?: string;
}

// ───────────────────────── Constants ─────────────────────────

const CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "hero", label: "Hero" },
  { value: "service", label: "Service" },
  { value: "project", label: "Project" },
  { value: "blog", label: "Blog" },
  { value: "team", label: "Team" },
  { value: "branding", label: "Branding" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All categories" },
  ...CATEGORY_OPTIONS,
];

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ───────────────────────── Helpers ─────────────────────────

function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type);
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

// ───────────────────────── Cloudinary status badge ─────────────────────────

function CloudinaryStatusBadge({
  status,
}: {
  status: "unknown" | "configured" | "not-configured";
}) {
  if (status === "unknown") {
    return (
      <Badge variant="outline" className="gap-1.5">
        <Loader2 className="size-3 animate-spin" />
        Checking Cloudinary…
      </Badge>
    );
  }
  if (status === "configured") {
    return (
      <Badge className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-600/90 dark:bg-emerald-500 dark:text-white">
        <Cloud className="size-3" />
        Cloudinary connected
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
    >
      <CloudOff className="size-3" />
      Cloudinary not configured
    </Badge>
  );
}

// ───────────────────────── Upload dropzone ─────────────────────────

interface DropzoneProps {
  configured: boolean;
  uploading: boolean;
  onFiles: (files: File[]) => void;
  onPick: () => void;
}

function UploadDropzone({ configured, uploading, onFiles, onPick }: DropzoneProps) {
  const [dragging, setDragging] = React.useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!dragging) setDragging(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (!configured) return;
    const files = Array.from(e.dataTransfer.files).filter(isImageFile);
    if (files.length === 0) {
      toast.error("Drop image files only (JPG, PNG, WebP, GIF, SVG, AVIF)");
      return;
    }
    onFiles(files);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        dragging
          ? "border-brand bg-brand/5"
          : "border-border bg-muted/20 hover:border-brand/60 hover:bg-muted/30",
        !configured && "opacity-60",
      )}
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          dragging ? "bg-brand text-brand-foreground" : "bg-brand/10 text-brand",
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <Upload className="size-6" />
        )}
      </div>
      <div>
        <p className="font-medium">
          {dragging ? "Drop to upload" : "Drag & drop images here"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {configured
            ? "Or click to browse — uploads go directly to Cloudinary. Max 10 MB per file."
            : "Cloudinary is not configured — set CLOUDINARY_* env vars to enable uploads."}
        </p>
      </div>
      <Button
        type="button"
        size="lg"
        className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
        disabled={!configured || uploading}
        onClick={onPick}
      >
        <Upload className="size-4" />
        Browse files
      </Button>
      <input
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ───────────────────────── Upload progress list ─────────────────────────

function UploadProgressList({ items }: { items: UploadProgress[] }) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        {items.map((u, i) => (
          <div key={`${u.filename}-${i}`} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate font-medium" title={u.filename}>
                {u.filename}
              </span>
              <span
                className={cn(
                  "shrink-0",
                  u.status === "error"
                    ? "text-destructive"
                    : u.status === "done"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground",
                )}
              >
                {u.status === "error"
                  ? "Failed"
                  : u.status === "done"
                    ? "Done"
                    : u.status === "storing"
                      ? "Storing…"
                      : `${u.progress}%`}
              </span>
            </div>
            <Progress value={u.progress} className="h-1.5" />
            {u.error && (
              <p className="text-[10px] text-destructive">{u.error}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ───────────────────────── Add manual URL dialog ─────────────────────────

interface NewFormState {
  url: string;
  filename: string;
  category: string;
  altText: string;
}

const emptyForm: NewFormState = {
  url: "",
  filename: "",
  category: "general",
  altText: "",
};

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
    const detectedFilename = detectFilenameFromUrl(form.url);
    const nextFilename =
      !form.filename || form.filename === detectedFilename
        ? detectFilenameFromUrl(url)
        : form.filename;
    update("url", url);
    update("filename", nextFilename);
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
      const res = await fetch(API.media, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: form.url.trim(),
          filename: form.filename.trim(),
          mimeType: "image/jpeg",
          size: 0,
          altText: form.altText.trim(),
          caption: null,
          category: form.category,
          folder: form.category,
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
          <DialogTitle>Add media by URL</DialogTitle>
          <DialogDescription>
            Register an existing publicly-accessible image URL in the library.
            Use the dropzone above to upload directly to Cloudinary.
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

// ───────────────────────── Image preview with hover-to-zoom ─────────────────────────

function MediaThumbnail({ item }: { item: MediaItem }) {
  const [zoomed, setZoomed] = React.useState(false);
  return (
    <>
      <div className="relative aspect-square w-full bg-muted/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.url}
          alt={item.altText || item.filename}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
          }}
        />
        {/* hover zoom button */}
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity hover:bg-black/30 hover:opacity-100 focus:opacity-100 focus:outline-none"
          aria-label={`Zoom ${item.filename}`}
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow">
            <ZoomIn className="size-4" />
          </span>
        </button>
        {/* Cloudinary badge */}
        {item.publicId && (
          <Badge
            className="absolute left-2 top-2 gap-1 bg-black/60 text-[10px] font-medium text-white hover:bg-black/60"
            title={`Cloudinary · ${item.publicId}`}
          >
            <Cloud className="size-2.5" />
            Cloud
          </Badge>
        )}
        {/* category badge */}
        <Badge className="absolute right-2 top-2 bg-background/90 text-foreground shadow-sm">
          {item.category}
        </Badge>
      </div>

      <Dialog open={zoomed} onOpenChange={setZoomed}>
        <DialogContent className="max-w-3xl p-0 sm:p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{item.filename}</DialogTitle>
            <DialogDescription>Full preview</DialogDescription>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-auto bg-black/95">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.originalUrl || item.url}
              alt={item.altText || item.filename}
              className="mx-auto max-h-[80vh] w-auto object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
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

  // Cloudinary status: "unknown" while we check, "configured" or "not-configured"
  const [cloudinaryStatus, setCloudinaryStatus] = React.useState<
    "unknown" | "configured" | "not-configured"
  >("unknown");

  // Upload progress
  const [uploads, setUploads] = React.useState<UploadProgress[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Default upload category (driven by the current filter)
  const uploadCategory = category !== "all" ? category : "general";

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Check Cloudinary configuration once on mount
  React.useEffect(() => {
    let cancelled = false;
    fetch(API.cloudinarySign, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: CloudinarySignResponse) => {
        if (cancelled) return;
        setCloudinaryStatus(data.configured ? "configured" : "not-configured");
      })
      .catch(() => {
        if (cancelled) return;
        setCloudinaryStatus("not-configured");
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  // ── Upload a single file to Cloudinary, then store the metadata ──
  const uploadFile = React.useCallback(
    async (file: File) => {
      if (!isImageFile(file)) {
        toast.error(`${file.name}: unsupported type (${file.type || "unknown"})`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: file too large (max 10 MB)`);
        return;
      }

      const slot = { filename: file.name, progress: 0, status: "uploading" as const };
      setUploads((prev) => [...prev, slot]);
      setUploading(true);

      try {
        // 1) Get signed params
        const signRes = await fetch(API.cloudinarySign, { cache: "no-store" });
        const signData = (await signRes.json()) as CloudinarySignResponse;
        if (!signData.configured) {
          throw new Error("Cloudinary not configured");
        }

        // 2) Upload directly to Cloudinary with XHR for progress events
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signData.apiKey!);
        formData.append("timestamp", String(signData.timestamp));
        if (signData.uploadPreset) {
          formData.append("upload_preset", signData.uploadPreset);
        } else {
          formData.append("signature", signData.signature!);
        }
        formData.append("folder", `allison-global/${uploadCategory}`);

        const uploaded = await new Promise<{
          public_id: string;
          secure_url: string;
          url: string;
          width: number;
          height: number;
          bytes: number;
          format: string;
          original_filename: string;
        }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", signData.uploadUrl!);
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              const pct = Math.round((ev.loaded / ev.total) * 100);
              setUploads((prev) =>
                prev.map((u, i) =>
                  i === prev.length - 1 && u.filename === file.name
                    ? { ...u, progress: pct }
                    : u,
                ),
              );
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch (e) {
                reject(e instanceof Error ? e : new Error("Bad JSON"));
              }
            } else {
              reject(new Error(`Upload failed: HTTP ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.send(formData);
        });

        // 3) Storing → update progress UI
        setUploads((prev) =>
          prev.map((u) =>
            u.filename === file.name ? { ...u, status: "storing", progress: 100 } : u,
          ),
        );

        // 4) Persist the media record
        const storeRes = await fetch(API.media, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
            originalUrl: uploaded.url,
            filename: uploaded.original_filename,
            mimeType: file.type,
            format: uploaded.format,
            size: uploaded.bytes,
            width: uploaded.width,
            height: uploaded.height,
            folder: uploadCategory,
            category: uploadCategory,
            altText: "",
          }),
        });
        if (!storeRes.ok) {
          const j = (await storeRes.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error || "Failed to store media record");
        }
        const stored = (await storeRes.json()) as { item: MediaItem };

        // 5) Insert into local state (only if it matches current filter)
        setItems((prev) => {
          // If we're filtered to a category, only show this item if it matches
          if (category !== "all" && stored.item.category !== category) return prev;
          return [stored.item, ...prev];
        });
        setTotal((t) => t + 1);

        setUploads((prev) =>
          prev.map((u) =>
            u.filename === file.name ? { ...u, status: "done", progress: 100 } : u,
          ),
        );
        toast.success(`${file.name} uploaded`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        setUploads((prev) =>
          prev.map((u) =>
            u.filename === file.name ? { ...u, status: "error", error: msg } : u,
          ),
        );
        toast.error(`${file.name}: ${msg}`);
      } finally {
        setUploading(false);
        // Auto-remove completed entries after 4s
        setTimeout(() => {
          setUploads((prev) =>
            prev.filter((u) => u.filename !== file.name || u.status === "uploading"),
          );
        }, 4000);
      }
    },
    [uploadCategory, category],
  );

  function handleFiles(files: File[]) {
    files.forEach((file) => {
      // stagger uploads slightly so the UI updates per file
      void uploadFile(file);
    });
  }

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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="lg"
              variant="outline"
              className="min-h-10"
              onClick={() => setAddOpen(true)}
            >
              <PlusCircle className="size-4" />
              Add by URL
            </Button>
            <Button
              size="lg"
              className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
              disabled={cloudinaryStatus !== "configured" || uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Upload
            </Button>
          </div>
        }
      />

      {/* Cloudinary status banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CloudinaryStatusBadge status={cloudinaryStatus} />
        {cloudinaryStatus === "not-configured" && (
          <div className="flex-1 rounded-md border border-amber-300/40 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <p className="font-medium">Set up Cloudinary to enable uploads</p>
            <p className="mt-1">
              Add these environment variables and restart the server:
            </p>
            <pre className="mt-2 overflow-x-auto rounded bg-amber-100/60 p-2 font-mono text-[11px] dark:bg-amber-500/10">{`CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
# optional:
CLOUDINARY_UPLOAD_PRESET=...`}</pre>
            <a
              href="https://console.cloudinary.com/"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-amber-900 underline decoration-amber-500 underline-offset-2 hover:text-amber-700 dark:text-amber-100"
            >
              Open Cloudinary console
              <ExternalLink className="size-3" />
            </a>
          </div>
        )}
      </div>

      {/* Drag-and-drop upload zone */}
      <UploadDropzone
        configured={cloudinaryStatus === "configured"}
        uploading={uploading}
        onFiles={handleFiles}
        onPick={() => fileInputRef.current?.click()}
      />
      {/* hidden file input used by the Upload button + dropzone Browse button */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) handleFiles(files);
          e.target.value = "";
        }}
      />

      {/* Active uploads */}
      <UploadProgressList items={uploads} />

      {error && (
        <div className="flex items-start gap-3 rounded-md border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search + filter */}
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
              : cloudinaryStatus === "configured"
                ? "Drag and drop images above, or click Upload to add your first asset."
                : "Click \"Add by URL\" to register an existing image URL, or configure Cloudinary to enable uploads."
          }
          actionLabel={debounced ? undefined : "Add by URL"}
          onAction={debounced ? undefined : () => setAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <Card
              key={m.id}
              className="group flex flex-col overflow-hidden transition hover:shadow-sm"
            >
              <MediaThumbnail item={m} />
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
                  {m.format ? ` · ${m.format}` : ""}
                </p>
                <AltTextEditor item={m} onSaved={handleItemUpdated} />
                <div className="mt-auto flex items-center justify-between pt-1">
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(m.createdAt)}
                  </span>
                  <div className="flex items-center gap-1">
                    {m.publicId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        asChild
                        title="Open original in new tab"
                      >
                        <Link
                          href={m.originalUrl || m.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </Button>
                    )}
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
              .{" "}
              {deleteTarget?.publicId ? (
                <>
                  The Cloudinary asset{" "}
                  <span className="break-all font-mono text-xs">
                    {deleteTarget.publicId}
                  </span>{" "}
                  will also be deleted. This action cannot be undone.
                </>
              ) : (
                <>
                  The original file at{" "}
                  <span className="break-all font-mono text-xs">
                    {deleteTarget?.url}
                  </span>{" "}
                  will remain where it is hosted — only the library entry is
                  removed. This action cannot be undone.
                </>
              )}
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
