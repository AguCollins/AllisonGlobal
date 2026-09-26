"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Image as ImageIcon,
  Search,
  Loader2,
  PlusCircle,
  Upload,
  X,
  Cloud,
  CloudOff,
} from "lucide-react";
import { toast } from "sonner";
import { API } from "@/components/admin/shared";
import { cn } from "@/lib/utils";

// ───────────────────────── Types ─────────────────────────

export interface MediaItem {
  id: string;
  url: string;
  publicId?: string | null;
  originalUrl?: string | null;
  filename: string;
  mimeType: string;
  format?: string | null;
  size: number;
  altText?: string | null;
  caption?: string | null;
  title?: string | null;
  folder?: string | null;
  category: string;
  width?: number | null;
  height?: number | null;
}

interface MediaListResponse {
  items: MediaItem[];
  total: number;
  pages: number;
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

// ───────────────────────── Props ─────────────────────────

export interface MediaPickerProps {
  /** Current selected image URL */
  value: string;
  /** Called when an image is selected */
  onSelect: (url: string, altText: string, media?: MediaItem) => void;
  /** Default folder/category for uploads */
  defaultCategory?: string;
  /** Show as compact button (inline) vs full card */
  compact?: boolean;
  /** Label for the picker trigger */
  label?: string;
  /** Show alt text editor inline */
  showAltText?: boolean;
  /** Alt text value (controlled by parent) */
  altText?: string;
  /** Called when alt text changes */
  onAltTextChange?: (altText: string) => void;
}

// ───────────────────────── Component ─────────────────────────

export function MediaPicker({
  value,
  onSelect,
  defaultCategory = "general",
  compact = false,
  label = "Select image",
  showAltText = false,
  altText = "",
  onAltTextChange,
}: MediaPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState(defaultCategory);
  const [cloudinaryStatus, setCloudinaryStatus] = React.useState<"unknown" | "configured" | "not-configured">("unknown");
  const [uploading, setUploading] = React.useState(false);
  const [manualUrl, setManualUrl] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState<MediaItem | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Check Cloudinary configuration on mount
  React.useEffect(() => {
    fetch("/api/admin/cloudinary/sign")
      .then((r) => r.json())
      .then((data: CloudinarySignResponse) => {
        setCloudinaryStatus(data.configured ? "configured" : "not-configured");
      })
      .catch(() => setCloudinaryStatus("not-configured"));
  }, []);

  // Load media library items
  const loadItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== "all") params.set("category", category);
      if (search) params.set("q", search);
      params.set("limit", "60");
      const res = await fetch(`${API.media}?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as MediaListResponse;
      setItems(data.items || []);
    } catch {
      toast.error("Failed to load media library");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  React.useEffect(() => {
    if (open) loadItems();
  }, [open, loadItems]);

  // ── Upload to Cloudinary ──
  async function handleUpload(file: File) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }

    setUploading(true);
    try {
      // Get signed upload params
      const signRes = await fetch("/api/admin/cloudinary/sign");
      const signData = (await signRes.json()) as CloudinarySignResponse;

      if (!signData.configured) {
        toast.error("Cloudinary not configured. Add CLOUDINARY_* env vars or use manual URL.");
        return;
      }

      // Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey!);
      formData.append("timestamp", String(signData.timestamp));
      if (signData.uploadPreset) {
        formData.append("upload_preset", signData.uploadPreset);
      } else {
        formData.append("signature", signData.signature!);
      }
      // Set folder in Cloudinary
      const folder = `allison-global/${defaultCategory}`;
      formData.append("folder", folder);

      const uploadRes = await fetch(signData.uploadUrl!, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => null);
        throw new Error(err?.error || `Upload failed: ${uploadRes.status}`);
      }

      const uploaded = (await uploadRes.json()) as {
        public_id: string;
        secure_url: string;
        url: string;
        width: number;
        height: number;
        bytes: number;
        format: string;
        original_filename: string;
      };

      // Store in our Media table
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
          folder: defaultCategory,
          category: defaultCategory,
          altText: "",
        }),
      });

      if (!storeRes.ok) throw new Error("Failed to store media record");

      const stored = (await storeRes.json()) as { item: MediaItem };
      toast.success("Image uploaded to Cloudinary");
      setItems((prev) => [stored.item, ...prev]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // ── Add manual URL ──
  async function handleAddManualUrl() {
    if (!manualUrl.trim()) return;
    setUploading(true);
    try {
      const filename = manualUrl.split("/").pop()?.split("?")[0] || "image";
      const res = await fetch(API.media, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: manualUrl,
          filename,
          mimeType: "image/jpeg",
          size: 0,
          folder: defaultCategory,
          category: defaultCategory,
        }),
      });
      if (!res.ok) throw new Error("Failed to add media");
      const data = (await res.json()) as { item: MediaItem };
      toast.success("Image added");
      setItems((prev) => [data.item, ...prev]);
      setManualUrl("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add URL");
    } finally {
      setUploading(false);
    }
  }

  function handleSelect(item: MediaItem) {
    setSelectedItem(item);
    onSelect(item.url, item.altText || "", item);
    setOpen(false);
  }

  // ── Render ──
  if (compact) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-1.5"
        >
          <ImageIcon className="size-3.5" />
          {label}
        </Button>
        <MediaPickerDialog
          open={open}
          onOpenChange={setOpen}
          items={items}
          loading={loading}
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          cloudinaryStatus={cloudinaryStatus}
          uploading={uploading}
          manualUrl={manualUrl}
          setManualUrl={setManualUrl}
          onUpload={handleUpload}
          onAddManualUrl={handleAddManualUrl}
          onSelect={handleSelect}
          fileInputRef={fileInputRef}
          showAltText={showAltText}
          altText={altText}
          onAltTextChange={onAltTextChange}
          selectedItem={selectedItem}
        />
      </>
    );
  }

  return (
    <>
      <Card className="border-dashed">
        <CardContent className="p-4">
          {value ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt={altText || "Selected image"}
                  className="max-h-48 w-full object-contain bg-muted/20"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 size-7"
                  onClick={() => {
                    onSelect("", "", undefined);
                    setSelectedItem(null);
                  }}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
              {selectedItem && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{selectedItem.filename}</span>
                  {selectedItem.width && selectedItem.height && (
                    <Badge variant="secondary" className="text-[10px]">
                      {selectedItem.width}×{selectedItem.height}
                    </Badge>
                  )}
                </div>
              )}
              {showAltText && onAltTextChange && (
                <div className="space-y-1">
                  <Label htmlFor="alt-text" className="text-xs">Alt text</Label>
                  <Input
                    id="alt-text"
                    value={altText}
                    onChange={(e) => onAltTextChange(e.target.value)}
                    placeholder="Describe the image for accessibility and SEO"
                    className="h-9"
                  />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className="w-full"
              >
                <Upload className="size-3.5" />
                Replace image
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex w-full flex-col items-center justify-center gap-2 py-8 text-muted-foreground transition-colors hover:text-foreground"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <ImageIcon className="size-5" />
              </div>
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-muted-foreground/70">
                Click to browse or upload
              </span>
            </button>
          )}
        </CardContent>
      </Card>
      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        items={items}
        loading={loading}
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        cloudinaryStatus={cloudinaryStatus}
        uploading={uploading}
        manualUrl={manualUrl}
        setManualUrl={setManualUrl}
        onUpload={handleUpload}
        onAddManualUrl={handleAddManualUrl}
        onSelect={handleSelect}
        fileInputRef={fileInputRef}
        showAltText={showAltText}
        altText={altText}
        onAltTextChange={onAltTextChange}
        selectedItem={selectedItem}
      />
    </>
  );
}

// ───────────────────────── Dialog ─────────────────────────

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: MediaItem[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  category: string;
  setCategory: (c: string) => void;
  cloudinaryStatus: "unknown" | "configured" | "not-configured";
  uploading: boolean;
  manualUrl: string;
  setManualUrl: (s: string) => void;
  onUpload: (file: File) => void;
  onAddManualUrl: () => void;
  onSelect: (item: MediaItem) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  showAltText?: boolean;
  altText?: string;
  onAltTextChange?: (altText: string) => void;
  selectedItem: MediaItem | null;
}

function MediaPickerDialog({
  open,
  onOpenChange,
  items,
  loading,
  search,
  setSearch,
  category,
  setCategory,
  cloudinaryStatus,
  uploading,
  manualUrl,
  setManualUrl,
  onUpload,
  onAddManualUrl,
  onSelect,
  fileInputRef,
  selectedItem,
}: MediaPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Media Library
            {cloudinaryStatus === "configured" ? (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Cloud className="size-3" />
                Cloudinary connected
              </Badge>
            ) : cloudinaryStatus === "not-configured" ? (
              <Badge variant="outline" className="gap-1 text-xs text-amber-600">
                <CloudOff className="size-3" />
                Manual URL mode
              </Badge>
            ) : null}
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar: search + filter + upload */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by filename or alt text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="hero">Hero</SelectItem>
              <SelectItem value="service">Services</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="branding">Branding</SelectItem>
            </SelectContent>
          </Select>

          {cloudinaryStatus === "configured" && (
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Upload
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </div>

        {/* Manual URL fallback */}
        {cloudinaryStatus === "not-configured" && (
          <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
            <Input
              placeholder="https://example.com/image.jpg"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="h-9"
            />
            <Button
              type="button"
              onClick={onAddManualUrl}
              disabled={uploading || !manualUrl.trim()}
              variant="outline"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <PlusCircle className="size-4" />}
              Add
            </Button>
          </div>
        )}

        {/* Grid of media items */}
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <ImageIcon className="size-8" />
              <p className="text-sm">No images yet</p>
              {cloudinaryStatus === "configured" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  Upload your first image
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-1 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border bg-muted/20 transition-all hover:border-brand hover:ring-2 hover:ring-brand/20",
                    selectedItem?.id === item.id && "border-brand ring-2 ring-brand/30",
                  )}
                >
                  <div className="aspect-square overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.altText || item.filename}
                      className="size-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
                      }}
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                    <p className="truncate text-[10px] text-white/90">
                      {item.filename}
                    </p>
                    {item.width && item.height && (
                      <p className="text-[9px] text-white/60">
                        {item.width}×{item.height}
                      </p>
                    )}
                  </div>
                  {item.publicId && (
                    <Badge className="absolute left-1 top-1 gap-0.5 bg-black/50 text-[8px] text-white">
                      <Cloud className="size-2.5" />
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
