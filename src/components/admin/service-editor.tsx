"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/alert-dialog";
import {
  PlusCircle,
  Loader2,
  Save,
  Trash2,
  FileText,
  Search,
  Eye,
  EyeOff,
  Image as ImageIcon,
  AlertCircle,
  X,
} from "lucide-react";
import { serviceCategories } from "@/lib/data/services";
import {
  PageHeader,
  ErrorState,
  API,
  slugify,
  csvToArray,
  arrayToCsv,
  useUnsavedChanges,
} from "@/components/admin/shared";
import { MediaPicker } from "@/components/admin/media-picker";
import { SeoTab, type SeoState } from "@/components/admin/seo-tab";
import { RichTextField } from "@/components/admin/rich-text-field";

// ───────────────────────── Types ─────────────────────────

interface ServiceForm {
  name: string;
  slug: string;
  categoryId: string;
  tagline: string;
  shortDescription: string;
  overview: unknown;
  solution: unknown;
  featured: boolean;
  published: boolean;
  iconName: string;
  sortOrder: number;
  problem: string;
  benefits: string;
  tech: string;
  relatedServices: string;
  relatedIndustries: string;
  imageUrl: string;
  seo: SeoState;
}

interface ServiceRecord {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  tagline: string;
  shortDescription: string;
  overview: unknown;
  solution: unknown;
  featured: boolean;
  published: boolean;
  iconName: string;
  sortOrder: number;
  problem?: string[];
  benefits?: string[];
  tech?: string[];
  relatedServices?: string[];
  relatedIndustries?: string[];
  imageUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
}

export type { ServiceRecord };

export interface ServiceEditorProps {
  mode: "create" | "edit";
  serviceId?: string;
  initial?: ServiceRecord | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

// ───────────────────────── Defaults ─────────────────────────

function emptyForm(): ServiceForm {
  return {
    name: "",
    slug: "",
    categoryId: serviceCategories[0]?.id ?? "network",
    tagline: "",
    shortDescription: "",
    overview: "",
    solution: "",
    featured: false,
    published: true,
    iconName: "Wrench",
    sortOrder: 0,
    problem: "",
    benefits: "",
    tech: "",
    relatedServices: "",
    relatedIndustries: "",
    imageUrl: "",
    seo: {
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
      canonicalUrl: "",
      noindex: false,
    },
  };
}

function formFromRecord(rec: ServiceRecord): ServiceForm {
  return {
    name: rec.name ?? "",
    slug: rec.slug ?? "",
    categoryId: rec.categoryId ?? serviceCategories[0]?.id ?? "network",
    tagline: rec.tagline ?? "",
    shortDescription: rec.shortDescription ?? "",
    overview: rec.overview ?? "",
    solution: rec.solution ?? "",
    featured: Boolean(rec.featured),
    published: rec.published ?? true,
    iconName: rec.iconName ?? "Wrench",
    sortOrder: Number(rec.sortOrder ?? 0),
    problem: arrayToCsv(rec.problem),
    benefits: arrayToCsv(rec.benefits),
    tech: arrayToCsv(rec.tech),
    relatedServices: arrayToCsv(rec.relatedServices),
    relatedIndustries: arrayToCsv(rec.relatedIndustries),
    imageUrl: rec.imageUrl ?? "",
    seo: {
      metaTitle: rec.metaTitle ?? "",
      metaDescription: rec.metaDescription ?? "",
      ogImage: rec.ogImage ?? "",
      canonicalUrl: rec.canonicalUrl ?? "",
      noindex: rec.noindex ?? false,
    },
  };
}

function buildPayload(form: ServiceForm, id?: string): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    categoryId: form.categoryId,
    tagline: form.tagline.trim(),
    shortDescription: form.shortDescription.trim(),
    overview: form.overview,
    solution: form.solution,
    featured: form.featured,
    published: form.published,
    iconName: form.iconName.trim() || "Wrench",
    sortOrder: Number(form.sortOrder) || 0,
    problem: csvToArray(form.problem),
    benefits: csvToArray(form.benefits),
    tech: csvToArray(form.tech),
    relatedServices: csvToArray(form.relatedServices),
    relatedIndustries: csvToArray(form.relatedIndustries),
    imageUrl: form.imageUrl.trim() || null,
    metaTitle: form.seo.metaTitle || null,
    metaDescription: form.seo.metaDescription || null,
    ogImage: form.seo.ogImage || null,
    canonicalUrl: form.seo.canonicalUrl || null,
    noindex: form.seo.noindex,
  };
  if (id) payload.id = id;
  return payload;
}

// ───────────────────────── Image preview field ─────────────────────────

function ImageUrlField({
  value,
  onChange,
  label,
  id,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  id: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10"
          placeholder={placeholder}
          type="url"
        />
        <MediaPicker
          value={value}
          onSelect={(url) => onChange(url)}
          defaultCategory="service"
          compact
          label="Pick from media library"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 hover:text-destructive"
            aria-label="Clear image"
            onClick={() => onChange("")}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
      {value && (
        <div className="overflow-hidden rounded-md border border-border">
          <div
            className="relative w-full bg-muted/40"
            style={{ aspectRatio: "16 / 9" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className="absolute inset-0 size-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Editor ─────────────────────────

export function ServiceEditor({
  mode,
  serviceId,
  initial,
  loading,
  error,
  onRetry,
}: ServiceEditorProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<ServiceForm>(emptyForm);
  const [original, setOriginal] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("content");
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    if (initial) {
      const f = formFromRecord(initial);
      setForm(f);
      setOriginal(JSON.stringify(f));
    }
  }, [initial]);

  // Auto-generate slug from name unless the user has manually edited it.
  React.useEffect(() => {
    if (!slugTouched) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }
  }, [form.name, slugTouched]);

  const dirty = JSON.stringify(form) !== original;
  useUnsavedChanges(dirty || mode === "create");

  function update<K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload(form, mode === "edit" ? serviceId : undefined);
      const res = await fetch(API.services, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success(mode === "edit" ? "Service updated" : "Service created");
      router.push("/admin/services");
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : mode === "edit"
            ? "Failed to update service"
            : "Failed to create service",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublish() {
    if (!serviceId) return;
    setSubmitting(true);
    try {
      const res = await fetch(API.services, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: serviceId, published: !form.published }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = { ...form, published: !form.published };
      setForm(updated);
      setOriginal(JSON.stringify(updated));
      toast.success(form.published ? "Service unpublished" : "Service published");
    } catch {
      toast.error("Failed to update service");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!serviceId) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `${API.services}?id=${encodeURIComponent(serviceId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Service deleted");
      router.push("/admin/services");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete service");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  // ── Loading / error states ──
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={PlusCircle}
          title={mode === "edit" ? "Edit service" : "New service"}
          backHref="/admin/services"
        />
        <div className="space-y-4">
          <div className="h-32 rounded-xl border border-border bg-muted/30" />
          <div className="h-32 rounded-xl border border-border bg-muted/30" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={PlusCircle}
          title={mode === "edit" ? "Edit service" : "New service"}
          backHref="/admin/services"
        />
        <ErrorState message={error} onRetry={() => onRetry?.()} />
      </div>
    );
  }

  const headerAction =
    mode === "edit" ? (
      <Button
        variant="outline"
        className="min-h-10 hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
        disabled={deleting}
      >
        {deleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        Delete
      </Button>
    ) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PlusCircle}
        title={mode === "edit" ? "Edit Service" : "New Service"}
        description={
          mode === "edit"
            ? form.name || "Editing existing service"
            : "Add a new service to the catalogue"
        }
        backHref="/admin/services"
        action={headerAction}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
        <TabsList className="h-10">
          <TabsTrigger value="content" className="min-h-8">
            <FileText className="size-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="seo" className="min-h-8">
            <Search className="size-4" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* ───────────── Content tab ───────────── */}
        <TabsContent value="content" className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6" id="service-form">
            <Card>
              <CardHeader>
                <CardTitle>Basics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      update("slug", slugify(e.target.value));
                    }}
                    className="h-10 font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from name. Edit carefully — used in URLs.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) => update("categoryId", v)}
                  >
                    <SelectTrigger id="categoryId" className="h-10 w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iconName">Icon name</Label>
                  <Input
                    id="iconName"
                    value={form.iconName}
                    onChange={(e) => update("iconName", e.target.value)}
                    className="h-10"
                    placeholder="Wrench"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lucide icon name (e.g. Camera, ShieldCheck, Network).
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={form.tagline}
                    onChange={(e) => update("tagline", e.target.value)}
                    className="h-10"
                    placeholder="One-line value proposition"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="shortDescription">Short description</Label>
                  <Input
                    id="shortDescription"
                    value={form.shortDescription}
                    onChange={(e) => update("shortDescription", e.target.value)}
                    className="h-10"
                    placeholder="Used in cards and search results"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="overview">Overview</Label>
                  <RichTextField
                    value={form.overview}
                    onChange={(doc) => update("overview", doc)}
                    placeholder="Long-form description of the service — supports formatting"
                    minHeight={200}
                    label="Service overview"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports bold, italic, headings, lists, and links.
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="solution">Solution</Label>
                  <RichTextField
                    value={form.solution}
                    onChange={(doc) => update("solution", doc)}
                    placeholder="How the service solves the client's problem — supports formatting"
                    minHeight={150}
                    label="Service solution"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lists (comma-separated)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="problem">Problem points</Label>
                  <Textarea
                    id="problem"
                    value={form.problem}
                    onChange={(e) => update("problem", e.target.value)}
                    rows={3}
                    placeholder="Slow, intermittent connections, No documentation, …"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    value={form.benefits}
                    onChange={(e) => update("benefits", e.target.value)}
                    rows={3}
                    placeholder="Reliable gigabit performance, Clean documentation, …"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tech">Technologies</Label>
                  <Input
                    id="tech"
                    value={form.tech}
                    onChange={(e) => update("tech", e.target.value)}
                    className="h-10"
                    placeholder="Cat6/Cat6A, Fibre, …"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relatedServices">Related service slugs</Label>
                  <Input
                    id="relatedServices"
                    value={form.relatedServices}
                    onChange={(e) => update("relatedServices", e.target.value)}
                    className="h-10 font-mono"
                    placeholder="lan-wan, wifi-installation, …"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="relatedIndustries">Related industry IDs</Label>
                  <Input
                    id="relatedIndustries"
                    value={form.relatedIndustries}
                    onChange={(e) => update("relatedIndustries", e.target.value)}
                    className="h-10 font-mono"
                    placeholder="corporate, education, healthcare, …"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image */}
            <Card>
              <CardHeader>
                <CardTitle>Hero image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUrlField
                  id="imageUrl"
                  label="Image URL"
                  value={form.imageUrl}
                  onChange={(v) => update("imageUrl", v)}
                  placeholder="https://… (overrides image query / placeholder)"
                />
                <p className="text-xs text-muted-foreground">
                  If provided, this image is used on the service detail page and
                  cards. Use the picker to choose from the media library.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display &amp; publishing</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => update("sortOrder", Number(e.target.value))}
                    className="h-10"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    id="featured"
                    checked={form.featured}
                    onCheckedChange={(v) => update("featured", v)}
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Featured
                  </Label>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    id="published"
                    checked={form.published}
                    onCheckedChange={(v) => update("published", v)}
                  />
                  <Label htmlFor="published" className="cursor-pointer">
                    Published
                  </Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-2">
              {mode === "edit" ? (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-10"
                  onClick={togglePublish}
                  disabled={submitting}
                >
                  {form.published ? (
                    <>
                      <EyeOff className="size-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="size-4" />
                      Publish
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon className="size-4" />
                  All fields saved on submit.
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-10"
                  onClick={() => router.push("/admin/services")}
                  disabled={submitting}
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
                    <Save className="size-4" />
                  )}
                  {mode === "edit" ? "Save changes" : "Create service"}
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        {/* ───────────── SEO tab ───────────── */}
        <TabsContent value="seo" className="space-y-6">
          <SeoTab
            value={form.seo}
            onChange={(seo) => update("seo", seo)}
            title={form.name}
            slug={form.slug}
            pathPrefix="/services/"
            fallbackImage={form.imageUrl}
            bodyText={typeof form.overview === "string" ? form.overview : JSON.stringify(form.overview || "")}
            excerpt={form.shortDescription}
            category={form.categoryId}
          />

          <Separator />

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-10"
              onClick={() => router.push("/admin/services")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
              disabled={submitting}
              onClick={async () => {
                if (!form.name.trim()) {
                  toast.error("Name is required");
                  setActiveTab("content");
                  return;
                }
                setSubmitting(true);
                try {
                  const payload = buildPayload(
                    form,
                    mode === "edit" ? serviceId : undefined,
                  );
                  const res = await fetch(API.services, {
                    method: mode === "edit" ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  if (!res.ok) {
                    const j = (await res.json().catch(() => null)) as {
                      error?: string;
                    } | null;
                    throw new Error(j?.error || `HTTP ${res.status}`);
                  }
                  toast.success(
                    mode === "edit" ? "Service updated" : "Service created",
                  );
                  router.push("/admin/services");
                } catch (e) {
                  toast.error(
                    e instanceof Error
                      ? e.message
                      : "Failed to save service",
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {mode === "edit" ? "Save changes" : "Create service"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {mode === "edit" && dirty && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300/40 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertCircle className="size-3.5" />
          Unsaved changes — remember to click Save before navigating away.
        </div>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{" "}
              <span className="font-medium text-foreground">{form.name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
