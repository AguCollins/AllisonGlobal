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
import { industries } from "@/lib/data/industries";
import {
  PageHeader,
  API,
  csvToArray,
  useUnsavedChanges,
} from "@/components/admin/shared";

interface ProjectForm {
  title: string;
  category: string;
  industry: string;
  location: string;
  scope: string;
  description: string;
  year: string;
  featured: boolean;
  published: boolean;
  imageQuery: string;
  highlights: string;
  services: string;
  sortOrder: number;
}

const emptyForm: ProjectForm = {
  title: "",
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
};

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = React.useState<ProjectForm>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  useUnsavedChanges(true);

  function update<K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload() {
    return {
      title: form.title.trim(),
      category: form.category.trim(),
      industry: form.industry,
      location: form.location.trim(),
      scope: form.scope.trim(),
      description: form.description.trim(),
      year: form.year.trim(),
      featured: form.featured,
      published: form.published,
      imageQuery: form.imageQuery.trim(),
      highlights: csvToArray(form.highlights),
      services: csvToArray(form.services),
      sortOrder: Number(form.sortOrder) || 0,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(API.projects, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Project created");
      router.push("/admin/projects");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PlusCircle}
        title="New Project"
        description="Add a project case study"
        backHref="/admin/projects"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
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
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lists & media</CardTitle>
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
              <Label htmlFor="services">Services (comma-separated slugs)</Label>
              <Input
                id="services"
                value={form.services}
                onChange={(e) => update("services", e.target.value)}
                className="h-10 font-mono"
                placeholder="cctv-installation, lan-wan, video-monitoring"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="imageQuery">Image query</Label>
              <Input
                id="imageQuery"
                value={form.imageQuery}
                onChange={(e) => update("imageQuery", e.target.value)}
                className="h-10"
                placeholder="retail store surveillance camera system"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch
                id="featured"
                checked={form.featured}
                onCheckedChange={(v) => update("featured", v)}
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured
              </Label>
            </div>
            <div className="flex items-center gap-3 pt-2">
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
            {submitting ? "Creating…" : "Create project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
