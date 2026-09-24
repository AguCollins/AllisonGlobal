"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  PageHeader,
  ErrorState,
  API,
  csvToArray,
  arrayToCsv,
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

interface IndustryRecord {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  imageQuery: string;
  iconName: string;
  sortOrder: number;
  challenges: string[];
  solutions: string[];
  outcomes: string[];
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

function toForm(p: IndustryRecord): IndustryForm {
  return {
    name: p.name ?? "",
    tagline: p.tagline ?? "",
    summary: p.summary ?? "",
    imageQuery: p.imageQuery ?? "",
    iconName: p.iconName ?? "Building2",
    sortOrder: Number(p.sortOrder ?? 0),
    challenges: arrayToCsv(p.challenges),
    solutions: arrayToCsv(p.solutions),
    outcomes: arrayToCsv(p.outcomes),
  };
}

export default function EditIndustryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  const [form, setForm] = React.useState<IndustryForm>(emptyForm);
  const [original, setOriginal] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API.industries}?drafts=true&limit=200`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { items: IndustryRecord[] };
      const found = json.items.find((i) => i.id === id);
      if (!found) throw new Error("Industry not found");
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

  function update<K extends keyof IndustryForm>(key: K, value: IndustryForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload() {
    return {
      id,
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
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Industry updated");
      router.push("/admin/industries");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update industry");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`${API.industries}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Industry deleted");
      router.push("/admin/industries");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete industry");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={PlusCircle} title="Edit industry" backHref="/admin/industries" />
        <div className="h-32 rounded-xl border border-border bg-muted/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader icon={PlusCircle} title="Edit industry" backHref="/admin/industries" />
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PlusCircle}
        title="Edit Industry"
        description={form.name}
        backHref="/admin/industries"
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="solutions">Solutions (service slugs)</Label>
              <Textarea
                id="solutions"
                value={form.solutions}
                onChange={(e) => update("solutions", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outcomes">Outcomes</Label>
              <Textarea
                id="outcomes"
                value={form.outcomes}
                onChange={(e) => update("outcomes", e.target.value)}
                rows={3}
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
            Save changes
          </Button>
        </div>
      </form>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete industry?</AlertDialogTitle>
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
