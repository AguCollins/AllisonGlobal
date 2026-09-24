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
import { PlusCircle, Loader2, Save, Trash2 } from "lucide-react";
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

interface ServiceForm {
  name: string;
  slug: string;
  categoryId: string;
  tagline: string;
  shortDescription: string;
  overview: string;
  solution: string;
  featured: boolean;
  published: boolean;
  iconName: string;
  sortOrder: number;
  problem: string;
  benefits: string;
  tech: string;
  relatedServices: string;
  relatedIndustries: string;
}

function toForm(item: Record<string, unknown>): ServiceForm {
  return {
    name: String(item.name ?? ""),
    slug: String(item.slug ?? ""),
    categoryId: String(item.categoryId ?? serviceCategories[0]?.id ?? "network"),
    tagline: String(item.tagline ?? ""),
    shortDescription: String(item.shortDescription ?? ""),
    overview: String(item.overview ?? ""),
    solution: String(item.solution ?? ""),
    featured: Boolean(item.featured),
    published: Boolean(item.published ?? true),
    iconName: String(item.iconName ?? "Wrench"),
    sortOrder: Number(item.sortOrder ?? 0),
    problem: arrayToCsv(item.problem as string[]),
    benefits: arrayToCsv(item.benefits as string[]),
    tech: arrayToCsv(item.tech as string[]),
    relatedServices: arrayToCsv(item.relatedServices as string[]),
    relatedIndustries: arrayToCsv(item.relatedIndustries as string[]),
  };
}

const emptyForm: ServiceForm = {
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
};

export default function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  const [form, setForm] = React.useState<ServiceForm>(emptyForm);
  const [original, setOriginal] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API.services}?drafts=true&limit=200`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { items: Record<string, unknown>[] };
      const found = json.items.find((it) => String(it.id) === id);
      if (!found) throw new Error("Service not found");
      const f = toForm(found);
      setForm(f);
      setOriginal(JSON.stringify(f));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const dirty = JSON.stringify(form) !== original;
  useUnsavedChanges(dirty);

  function update<K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload() {
    return {
      id,
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      categoryId: form.categoryId,
      tagline: form.tagline.trim(),
      shortDescription: form.shortDescription.trim(),
      overview: form.overview.trim(),
      solution: form.solution.trim(),
      featured: form.featured,
      published: form.published,
      iconName: form.iconName.trim() || "Wrench",
      sortOrder: Number(form.sortOrder) || 0,
      problem: csvToArray(form.problem),
      benefits: csvToArray(form.benefits),
      tech: csvToArray(form.tech),
      relatedServices: csvToArray(form.relatedServices),
      relatedIndustries: csvToArray(form.relatedIndustries),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(API.services, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      const updated = toForm((await res.json()).item as Record<string, unknown>);
      setForm(updated);
      setOriginal(JSON.stringify(updated));
      toast.success("Service updated");
      router.push("/admin/services");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update service");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePublishToggle() {
    setSubmitting(true);
    try {
      const res = await fetch(API.services, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, published: !form.published }),
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
    setDeleting(true);
    try {
      const res = await fetch(`${API.services}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
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

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={PlusCircle} title="Edit service" backHref="/admin/services" />
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
        <PageHeader icon={PlusCircle} title="Edit service" backHref="/admin/services" />
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PlusCircle}
        title="Edit Service"
        description={form.name}
        backHref="/admin/services"
        action={
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
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
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
                onChange={(e) => update("slug", slugify(e.target.value))}
                className="h-10 font-mono"
              />
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
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={form.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="shortDescription">Short description</Label>
              <Input
                id="shortDescription"
                value={form.shortDescription}
                onChange={(e) => update("shortDescription", e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="overview">Overview</Label>
              <Textarea
                id="overview"
                value={form.overview}
                onChange={(e) => update("overview", e.target.value)}
                rows={5}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="solution">Solution</Label>
              <Textarea
                id="solution"
                value={form.solution}
                onChange={(e) => update("solution", e.target.value)}
                rows={4}
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
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                value={form.benefits}
                onChange={(e) => update("benefits", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tech">Technologies</Label>
              <Input
                id="tech"
                value={form.tech}
                onChange={(e) => update("tech", e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relatedServices">Related service slugs</Label>
              <Input
                id="relatedServices"
                value={form.relatedServices}
                onChange={(e) => update("relatedServices", e.target.value)}
                className="h-10 font-mono"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="relatedIndustries">Related industry IDs</Label>
              <Input
                id="relatedIndustries"
                value={form.relatedIndustries}
                onChange={(e) => update("relatedIndustries", e.target.value)}
                className="h-10 font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display & publishing</CardTitle>
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
          <Button
            type="button"
            variant="outline"
            className="min-h-10"
            onClick={handlePublishToggle}
            disabled={submitting}
          >
            {form.published ? "Unpublish" : "Publish"}
          </Button>
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
              Save changes
            </Button>
          </div>
        </div>
      </form>

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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
