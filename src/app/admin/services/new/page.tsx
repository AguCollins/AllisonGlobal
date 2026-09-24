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
import { PlusCircle, Loader2, Save } from "lucide-react";
import { serviceCategories } from "@/lib/data/services";
import {
  PageHeader,
  API,
  slugify,
  csvToArray,
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

export default function NewServicePage() {
  const router = useRouter();
  const [form, setForm] = React.useState<ServiceForm>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(false);

  // Auto-generate slug from name unless the user has manually edited it.
  React.useEffect(() => {
    if (!slugTouched) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }
  }, [form.name, slugTouched]);

  useUnsavedChanges(true);

  function update<K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload() {
    return {
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
    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(API.services, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Service created");
      router.push("/admin/services");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create service");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PlusCircle}
        title="New Service"
        description="Add a new service to the catalogue"
        backHref="/admin/services"
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
              <Textarea
                id="overview"
                value={form.overview}
                onChange={(e) => update("overview", e.target.value)}
                rows={5}
                placeholder="Long-form description of the service"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="solution">Solution</Label>
              <Textarea
                id="solution"
                value={form.solution}
                onChange={(e) => update("solution", e.target.value)}
                rows={4}
                placeholder="How the service solves the client's problem"
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
            type="submit"
            className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {submitting ? "Creating…" : "Create service"}
          </Button>
        </div>
      </form>
    </div>
  );
}
