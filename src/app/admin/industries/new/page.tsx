"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Loader2, Save } from "lucide-react";
import {
  PageHeader,
  API,
  csvToArray,
  useUnsavedChanges,
} from "@/components/admin/shared";

interface IndustryForm {
  name: string;
  tagline: string;
  summary: string;
  imageQuery: string;
  iconName: string;
  sortOrder: number;
  challenges: string;
  solutions: string;
  outcomes: string;
}

const emptyForm: IndustryForm = {
  name: "",
  tagline: "",
  summary: "",
  imageQuery: "",
  iconName: "Building2",
  sortOrder: 0,
  challenges: "",
  solutions: "",
  outcomes: "",
};

export default function NewIndustryPage() {
  const router = useRouter();
  const [form, setForm] = React.useState<IndustryForm>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  useUnsavedChanges(true);

  function update<K extends keyof IndustryForm>(key: K, value: IndustryForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload() {
    return {
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      summary: form.summary.trim(),
      imageQuery: form.imageQuery.trim(),
      iconName: form.iconName.trim() || "Building2",
      sortOrder: Number(form.sortOrder) || 0,
      challenges: csvToArray(form.challenges),
      solutions: csvToArray(form.solutions),
      outcomes: csvToArray(form.outcomes),
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
      const res = await fetch(API.industries, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Industry created");
      router.push("/admin/industries");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create industry");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PlusCircle}
        title="New Industry"
        description="Add a sector served"
        backHref="/admin/industries"
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
              <Label htmlFor="iconName">Icon name</Label>
              <Input
                id="iconName"
                value={form.iconName}
                onChange={(e) => update("iconName", e.target.value)}
                className="h-10"
                placeholder="Building2"
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
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={form.summary}
                onChange={(e) => update("summary", e.target.value)}
                rows={4}
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
            <div className="space-y-2">
              <Label htmlFor="imageQuery">Image query</Label>
              <Input
                id="imageQuery"
                value={form.imageQuery}
                onChange={(e) => update("imageQuery", e.target.value)}
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lists (comma-separated)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="challenges">Challenges</Label>
              <Textarea
                id="challenges"
                value={form.challenges}
                onChange={(e) => update("challenges", e.target.value)}
                rows={3}
                placeholder="Perimeter security, Reliable Wi-Fi coverage, …"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="solutions">Solutions (service slugs)</Label>
              <Textarea
                id="solutions"
                value={form.solutions}
                onChange={(e) => update("solutions", e.target.value)}
                rows={3}
                placeholder="cctv-installation, access-control-systems, …"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outcomes">Outcomes</Label>
              <Textarea
                id="outcomes"
                value={form.outcomes}
                onChange={(e) => update("outcomes", e.target.value)}
                rows={3}
                placeholder="Visible deterrent, Controlled access, …"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-10"
            onClick={() => router.push("/admin/industries")}
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
            {submitting ? "Creating…" : "Create industry"}
          </Button>
        </div>
      </form>
    </div>
  );
}
