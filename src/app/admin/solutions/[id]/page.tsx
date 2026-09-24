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

interface SolutionRecord {
  id: string;
  name: string;
  summary: string;
  description: string;
  iconName: string;
  sortOrder: number;
  components: string[];
  outcomes: string[];
  bestFor: string[];
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

function toForm(s: SolutionRecord): SolutionForm {
  return {
    name: s.name ?? "",
    summary: s.summary ?? "",
    description: s.description ?? "",
    iconName: s.iconName ?? "ShieldCheck",
    sortOrder: Number(s.sortOrder ?? 0),
    components: arrayToCsv(s.components),
    outcomes: arrayToCsv(s.outcomes),
    bestFor: arrayToCsv(s.bestFor),
  };
}

export default function EditSolutionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  const [form, setForm] = React.useState<SolutionForm>(emptyForm);
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
      const res = await fetch(`${API.solutions}?drafts=true&limit=200`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { items: SolutionRecord[] };
      const found = json.items.find((s) => s.id === id);
      if (!found) throw new Error("Solution not found");
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

  function update<K extends keyof SolutionForm>(key: K, value: SolutionForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload() {
    return {
      id,
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
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Solution updated");
      router.push("/admin/solutions");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update solution");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`${API.solutions}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Solution deleted");
      router.push("/admin/solutions");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete solution");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={PlusCircle}
          title="Edit solution"
          backHref="/admin/solutions"
        />
        <div className="h-32 rounded-xl border border-border bg-muted/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={PlusCircle}
          title="Edit solution"
          backHref="/admin/solutions"
        />
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PlusCircle}
        title="Edit Solution"
        description={form.name}
        backHref="/admin/solutions"
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
            <div className="space-y-2">
              <Label htmlFor="bestFor">Best for (industry IDs)</Label>
              <Textarea
                id="bestFor"
                value={form.bestFor}
                onChange={(e) => update("bestFor", e.target.value)}
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
            Save changes
          </Button>
        </div>
      </form>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete solution?</AlertDialogTitle>
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
