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
  AlertCircle,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { industries } from "@/lib/data/industries";
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

interface ProjectForm {
  title: string;
  slug: string;
  category: string;
  industry: string;
  location: string;
  scope: string;
  description: unknown;
  year: string;
  featured: boolean;
  published: boolean;
  imageQuery: string;
  highlights: string;
  services: string;
  sortOrder: number;
  // New
  gallery: string; // one URL per line in the textarea
  technologies: string; // comma-separated
  client: string;
  completionDate: string;
  seo: SeoState;
}

interface ProjectRecord {
  id: string;
  title: string;
  slug?: string | null;
  category: string;
  industry: string;
  location: string;
  scope: string;
  description: unknown;
  year: string;
  featured: boolean;
  published: boolean;
  imageQuery: string;
  highlights?: string[];
  services?: string[];
  sortOrder: number;
  gallery?: string[] | null;
  technologies?: string[] | null;
  client?: string | null;
  completionDate?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
}

export type { ProjectRecord };

export interface ProjectEditorProps {
  mode: "create" | "edit";
  projectId?: string;
  initial?: ProjectRecord | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

// ───────────────────────── Defaults ─────────────────────────

function emptyForm(): ProjectForm {
  return {
    title: "",
    slug: "",
    category: "",
    industry: industries[0]?.id ?? "corporate",
    location: "",
    scope: "",
    description: "",
    year: String(new Date().getFullYear()),
    featured: false,
    published: true,
    imageQuery: "",
    highlights: "",
    services: "",
    sortOrder: 0,
    gallery: "",
    technologies: "",
    client: "",
    completionDate: "",
    seo: {
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
      canonicalUrl: "",
      noindex: false,
    },
  };
}

/** Convert a gallery array (one URL per entry) to a textarea-friendly string. */
function galleryToText(arr?: string[] | null): string {
  if (!Array.isArray(arr)) return "";
  return arr.filter(Boolean).join("\n");
}

/** Parse textarea contents (one URL per line / comma-separated) into a clean array. */
function textToGallery(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function formFromRecord(rec: ProjectRecord): ProjectForm {
  return {
    title: rec.title ?? "",
    slug: rec.slug ?? "",
    category: rec.category ?? "",
    industry: rec.industry ?? industries[0]?.id ?? "corporate",
    location: rec.location ?? "",
    scope: rec.scope ?? "",
    description: rec.description ?? "",
    year: rec.year ?? "",
    featured: Boolean(rec.featured),
    published: rec.published ?? true,
    imageQuery: rec.imageQuery ?? "",
    highlights: arrayToCsv(rec.highlights),
    services: arrayToCsv(rec.services),
    sortOrder: Number(rec.sortOrder ?? 0),
    gallery: galleryToText(rec.gallery),
    technologies: arrayToCsv(rec.technologies as string[] | null),
    client: rec.client ?? "",
    completionDate: rec.completionDate ?? "",
    seo: {
      metaTitle: rec.metaTitle ?? "",
      metaDescription: rec.metaDescription ?? "",
      ogImage: rec.ogImage ?? "",
      canonicalUrl: rec.canonicalUrl ?? "",
      noindex: rec.noindex ?? false,
    },
  };
}

function buildPayload(form: ProjectForm, id?: string): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    title: form.title.trim(),
    slug: form.slug.trim() || slugify(form.title),
    category: form.category.trim(),
    industry: form.industry,
    location: form.location.trim(),
    scope: form.scope.trim(),
    description: form.description,
    year: form.year.trim(),
    featured: form.featured,
    published: form.published,
    imageQuery: form.imageQuery.trim(),
    highlights: csvToArray(form.highlights),
    services: csvToArray(form.services),
    sortOrder: Number(form.sortOrder) || 0,
    gallery: textToGallery(form.gallery),
    technologies: csvToArray(form.technologies),
    client: form.client.trim() || null,
    completionDate: form.completionDate.trim() || null,
    metaTitle: form.seo.metaTitle || null,
    metaDescription: form.seo.metaDescription || null,
    ogImage: form.seo.ogImage || null,
    canonicalUrl: form.seo.canonicalUrl || null,
    noindex: form.seo.noindex,
  };
  if (id) payload.id = id;
  return payload;
}

// ───────────────────────── Editor ─────────────────────────

export function ProjectEditor({
  mode,
  projectId,
  initial,
  loading,
  error,
  onRetry,
}: ProjectEditorProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<ProjectForm>(emptyForm);
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

  // Auto-generate slug from title unless the user has manually edited it.
  React.useEffect(() => {
    if (!slugTouched) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, slugTouched]);

  const dirty = JSON.stringify(form) !== original;
  useUnsavedChanges(dirty || mode === "create");

  const galleryUrls = React.useMemo(
    () => textToGallery(form.gallery),
    [form.gallery],
  );

  function update<K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload(form, mode === "edit" ? projectId : undefined);
      const res = await fetch(API.projects, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success(mode === "edit" ? "Project updated" : "Project created");
      router.push("/admin/projects");
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : mode === "edit"
            ? "Failed to update project"
            : "Failed to create project",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!projectId) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `${API.projects}?id=${encodeURIComponent(projectId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Project deleted");
      router.push("/admin/projects");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete project");
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
          title={mode === "edit" ? "Edit project" : "New project"}
          backHref="/admin/projects"
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
          title={mode === "edit" ? "Edit project" : "New project"}
          backHref="/admin/projects"
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
        title={mode === "edit" ? "Edit Project" : "New Project"}
        description={
          mode === "edit"
            ? form.title || "Editing existing project"
            : "Add a project case study"
        }
        backHref="/admin/projects"
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
          <form onSubmit={handleSubmit} className="space-y-6" id="project-form">
            <Card>
              <CardHeader>
                <CardTitle>Project details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
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
                    placeholder="auto-generated-from-title"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from title. Edit carefully — used in URLs.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="h-10"
                    placeholder="Surveillance & Alarms"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={form.industry}
                    onValueChange={(v) => update("industry", v)}
                  >
                    <SelectTrigger id="industry" className="h-10 w-full">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scope">Scope</Label>
                  <Input
                    id="scope"
                    value={form.scope}
                    onChange={(e) => update("scope", e.target.value)}
                    className="h-10"
                    placeholder="8 retail locations · unified monitoring"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    value={form.year}
                    onChange={(e) => update("year", e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client (optional)</Label>
                  <Input
                    id="client"
                    value={form.client}
                    onChange={(e) => update("client", e.target.value)}
                    className="h-10"
                    placeholder="e.g. Allied Retail Holdings"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="completionDate">
                    Completion date (optional)
                  </Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={form.completionDate}
                    onChange={(e) => update("completionDate", e.target.value)}
                    className="h-10"
                  />
                </div>
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
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <RichTextField
                    value={form.description}
                    onChange={(doc) => update("description", doc)}
                    placeholder="Project description — supports formatting"
                    minHeight={200}
                    label="Project description"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports bold, italic, headings, lists, and links.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lists &amp; media</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="highlights">Highlights (comma-separated)</Label>
                  <Textarea
                    id="highlights"
                    value={form.highlights}
                    onChange={(e) => update("highlights", e.target.value)}
                    rows={3}
                    placeholder="Standardised CCTV across 8 branches, Centralised monitoring, …"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="services">
                    Services (comma-separated slugs)
                  </Label>
                  <Input
                    id="services"
                    value={form.services}
                    onChange={(e) => update("services", e.target.value)}
                    className="h-10 font-mono"
                    placeholder="cctv-installation, lan-wan, video-monitoring"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="technologies">
                    Technologies (comma-separated)
                  </Label>
                  <Input
                    id="technologies"
                    value={form.technologies}
                    onChange={(e) => update("technologies", e.target.value)}
                    className="h-10"
                    placeholder="Hikvision, Genetec, Milestone, …"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="imageQuery">Image query (fallback)</Label>
                  <Input
                    id="imageQuery"
                    value={form.imageQuery}
                    onChange={(e) => update("imageQuery", e.target.value)}
                    className="h-10"
                    placeholder="retail store surveillance camera system"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used when no gallery images are present. Generates a
                    placeholder image based on the query.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="gallery">Image URLs</Label>
                    <MediaPicker
                      value=""
                      onSelect={(url) => {
                        const next = form.gallery
                          ? `${form.gallery.trim()}\n${url}`
                          : url;
                        update("gallery", next);
                        toast.success("Image added to gallery");
                      }}
                      defaultCategory="project"
                      label="Add from media library"
                    />
                  </div>
                  <Textarea
                    id="gallery"
                    value={form.gallery}
                    onChange={(e) => update("gallery", e.target.value)}
                    rows={5}
                    placeholder={
                      "One URL per line (or comma-separated):\nhttps://…/photo-1.jpg\nhttps://…/photo-2.jpg"
                    }
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    {galleryUrls.length} {galleryUrls.length === 1 ? "image" : "images"} in
                    gallery. Use the picker to add images from the media
                    library, or paste URLs manually below.
                  </p>
                </div>

                {galleryUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {galleryUrls.map((url, i) => (
                      <div
                        key={`${url}-${i}`}
                        className="group relative overflow-hidden rounded-md border border-border"
                      >
                        <div className="relative aspect-square w-full bg-muted/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Gallery image ${i + 1}`}
                            className="absolute inset-0 size-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.opacity =
                                "0.3";
                            }}
                          />
                          <button
                            type="button"
                            aria-label={`Remove image ${i + 1}`}
                            onClick={() =>
                              update(
                                "gallery",
                                galleryUrls
                                  .filter((_, idx) => idx !== i)
                                  .join("\n"),
                              )
                            }
                            className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition hover:text-destructive group-hover:opacity-100"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display &amp; publishing</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 pt-2 md:col-span-1">
                  <Switch
                    id="featured"
                    checked={form.featured}
                    onCheckedChange={(v) => update("featured", v)}
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Featured
                  </Label>
                </div>
                <div className="flex items-center gap-3 pt-2 md:col-span-1">
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

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-10"
                onClick={() => router.push("/admin/projects")}
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
                {mode === "edit"
                  ? "Save changes"
                  : submitting
                    ? "Creating…"
                    : "Create project"}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* ───────────── SEO tab ───────────── */}
        <TabsContent value="seo" className="space-y-6">
          <SeoTab
            value={form.seo}
            onChange={(seo) => update("seo", seo)}
            title={form.title}
            slug={form.slug}
            pathPrefix="/projects/"
            fallbackImage={galleryUrls[0]}
            bodyText={typeof form.description === "string" ? form.description : JSON.stringify(form.description || "")}
            excerpt={form.scope}
            category={form.category}
          />

          <Separator />

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-10"
              onClick={() => router.push("/admin/projects")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
              disabled={submitting}
              onClick={async () => {
                if (!form.title.trim()) {
                  toast.error("Title is required");
                  setActiveTab("content");
                  return;
                }
                setSubmitting(true);
                try {
                  const payload = buildPayload(
                    form,
                    mode === "edit" ? projectId : undefined,
                  );
                  const res = await fetch(API.projects, {
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
                    mode === "edit" ? "Project updated" : "Project created",
                  );
                  router.push("/admin/projects");
                } catch (e) {
                  toast.error(
                    e instanceof Error
                      ? e.message
                      : "Failed to save project",
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
              {mode === "edit" ? "Save changes" : "Create project"}
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

      {galleryUrls.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ImageIcon className="size-3.5" />
          No gallery images yet — falling back to the image query.
        </div>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{" "}
              <span className="font-medium text-foreground">{form.title}</span>.
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
