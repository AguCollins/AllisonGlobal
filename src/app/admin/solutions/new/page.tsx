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

interface SolutionForm {
  name: string;
  summary: string;
  description: string;
  iconName: string;
  sortOrder: number;
  components: string;
  outcomes: string;
  bestFor: string;
}

const emptyForm: SolutionForm = {
  name: "",
  summary: "",
  description: "",
  iconName: "ShieldCheck",
  sortOrder: 0,
  components: "",
  outcomes: "",
  bestFor: "",
};

export default function NewSolutionPage() {
  const router = useRouter();
  const [form, setForm] = React.useState<SolutionForm>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  useUnsavedChanges(true);

  function update<K extends keyof SolutionForm>(key: K, value: SolutionForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload() {
    return {
      name: form.name.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      iconName: form.iconName.trim() || "ShieldCheck",
      sortOrder: Number(form.sortOrder) || 0,
      components: csvToArray(form.components),
      outcomes: csvToArray(form.outcomes),
      bestFor: csvToArray(form.bestFor),
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
      const res = await fetch(API.solutions, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Solution created");
      router.push("/admin/solutions");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create solution");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PlusCircle}
        title="New Solution"
        description="Add a cross-cutting solution bundle"
        backHref="/admin/solutions"
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
                placeholder="ShieldCheck"
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
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                value={form.summary}
                onChange={(e) => update("summary", e.target.value)}
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
            <CardTitle>Lists (comma-separated)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="components">Components (service slugs)</Label>
              <Textarea
                id="components"
                value={form.components}
                onChange={(e) => update("components", e.target.value)}
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
                placeholder="Incidents detected faster, Single platform, …"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bestFor">Best for (industry IDs)</Label>
              <Textarea
                id="bestFor"
                value={form.bestFor}
                onChange={(e) => update("bestFor", e.target.value)}
                rows={3}
                placeholder="corporate, retail, finance, …"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-10"
            onClick={() => router.push("/admin/solutions")}
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
            {submitting ? "Creating…" : "Create solution"}
          </Button>
        </div>
      </form>
    </div>
  );
}
