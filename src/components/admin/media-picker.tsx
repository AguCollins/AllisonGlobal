"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ImageIcon,
  Search,
  Loader2,
  Link2,
  Check,
  PlusCircle,
} from "lucide-react";
import { API } from "@/components/admin/shared";

// ───────────────────────── Types ─────────────────────────

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  altText?: string | null;
  category: string;
  width?: number | null;
  height?: number | null;
}

interface MediaListResponse {
  items: MediaItem[];
  total: number;
}

export interface MediaPickerProps {
  /** Currently selected image URL (so the picker can highlight it). */
  value?: string;
  /** Called when the user picks a media item. */
  onSelect: (url: string, altText: string) => void;
  /** Optional category filter applied by default. */
  defaultCategory?: string;
  /** Button label. */
  label?: string;
  /** Render as a small icon-only button. */
  compact?: boolean;
  /** Optional className applied to the trigger. */
  className?: string;
}

// ───────────────────────── Constants ─────────────────────────

const CATEGORY_OPTIONS = [
  { value: "all", label: "All categories" },
  { value: "general", label: "General" },
  { value: "hero", label: "Hero" },
  { value: "service", label: "Service" },
  { value: "project", label: "Project" },
  { value: "blog", label: "Blog" },
  { value: "team", label: "Team" },
];

// ───────────────────────── Component ─────────────────────────

export function MediaPicker({
  value,
  onSelect,
  defaultCategory = "all",
  label = "Pick from library",
  compact = false,
  className,
}: MediaPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState(defaultCategory);
  const [manualOpen, setManualOpen] = React.useState(false);
  const [manualUrl, setManualUrl] = React.useState("");
  const [manualAlt, setManualAlt] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (category !== "all") params.set("category", category);
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`${API.media}?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as MediaListResponse;
      setItems(json.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  React.useEffect(() => {
    if (open) load();
  }, [open, load]);

  function handlePick(item: MediaItem) {
    onSelect(item.url, item.altText ?? "");
    setOpen(false);
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    onSelect(manualUrl.trim(), manualAlt.trim());
    setManualUrl("");
    setManualAlt("");
    setManualOpen(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={`size-10 ${className ?? ""}`}
            aria-label={label}
            title={label}
          >
            <ImageIcon className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className={`min-h-10 ${className ?? ""}`}
          >
            <ImageIcon className="size-4" />
            {label}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
          <DialogDescription>
            Pick an existing image, or enter a URL manually.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
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
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        <ScrollArea className="max-h-[55vh]">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ImageIcon className="size-5" />
              </div>
              <p className="text-sm font-medium">No media found</p>
              <p className="max-w-md text-xs text-muted-foreground">
                Add media from the Media Library page, or enter a URL manually
                below.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-1 sm:grid-cols-3 md:grid-cols-4">
              {items.map((m) => {
                const active = value === m.url;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => handlePick(m)}
                    className="group relative flex flex-col overflow-hidden rounded-lg border border-border text-left transition hover:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Select ${m.filename}`}
                  >
                    <div className="relative aspect-square w-full bg-muted/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.url}
                        alt={m.altText || m.filename}
                        className="absolute inset-0 size-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.opacity =
                            "0.3";
                        }}
                      />
                      {active && (
                        <div className="absolute inset-0 flex items-center justify-center bg-brand/30">
                          <span className="flex size-8 items-center justify-center rounded-full bg-brand text-brand-foreground">
                            <Check className="size-4" />
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 p-2">
                      <p className="line-clamp-1 text-xs font-medium">
                        {m.filename}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className="px-1.5 py-0 text-[10px]"
                        >
                          {m.category}
                        </Badge>
                        {m.width && m.height ? (
                          <span className="text-[10px] text-muted-foreground">
                            {m.width}×{m.height}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Manual URL fallback */}
        <DialogFooter className="flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Dialog
            open={manualOpen}
            onOpenChange={(o) => {
              setManualOpen(o);
              if (!o) {
                setManualUrl("");
                setManualAlt("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="min-h-10 sm:mr-auto"
              >
                <Link2 className="size-4" />
                Enter URL manually
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Enter image URL</DialogTitle>
                <DialogDescription>
                  Paste any publicly-accessible image URL.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="mp-url">Image URL *</Label>
                  <Input
                    id="mp-url"
                    type="url"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://…"
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mp-alt">Alt text</Label>
                  <Input
                    id="mp-alt"
                    value={manualAlt}
                    onChange={(e) => setManualAlt(e.target.value)}
                    placeholder="Describe the image for accessibility"
                    className="h-10"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-10"
                    onClick={() => setManualOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
                  >
                    <PlusCircle className="size-4" />
                    Use this URL
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            type="button"
            variant="ghost"
            className="min-h-10"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
