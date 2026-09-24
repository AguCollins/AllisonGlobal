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
import { industries } from "@/lib/data/industries";
import {
  PageHeader,
  ErrorState,
  API,
  useUnsavedChanges,
} from "@/components/admin/shared";

interface TestimonialForm {
  quote: string;
  authorRole: string;
  sector: string;
  rating: number;
  projectType: string;
}

interface TestimonialRecord {
  id: string;
  quote: string;
  authorRole: string;
  sector: string;
  rating: number;
  projectType: string;
}

const emptyForm: TestimonialForm = {
  quote: "",
  authorRole: "",
  sector: industries[0]?.id ?? "corporate",
  rating: 5,
  projectType: "",
};

export default function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  const [form, setForm] = React.useState<TestimonialForm>(emptyForm);
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
      const res = await fetch(`${API.testimonials}?drafts=true&limit=200`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { items: TestimonialRecord[] };
      const found = json.items.find((t) => t.id === id);
      if (!found) throw new Error("Testimonial not found");
      const f: TestimonialForm = {
        quote: found.quote ?? "",
        authorRole: found.authorRole ?? "",
        sector: found.sector ?? industries[0]?.id ?? "corporate",
        rating: found.rating ?? 5,
        projectType: found.projectType ?? "",
      };
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

  function update<K extends keyof TestimonialForm>(key: K, value: TestimonialForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload() {
    return {
      id,
      quote: form.quote.trim(),
      authorRole: form.authorRole.trim(),
      sector: form.sector,
      rating: Math.max(1, Math.min(5, Number(form.rating) || 5)),
      projectType: form.projectType.trim(),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.quote.trim()) {
      toast.error("Quote is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(API.testimonials, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Testimonial updated");
      router.push("/admin/testimonials");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update testimonial");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`${API.testimonials}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Testimonial deleted");
      router.push("/admin/testimonials");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete testimonial");
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
          title="Edit testimonial"
          backHref="/admin/testimonials"
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
          title="Edit testimonial"
          backHref="/admin/testimonials"
        />
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PlusCircle}
        title="Edit Testimonial"
        description={form.authorRole || "Client quote"}
        backHref="/admin/testimonials"
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
            <CardTitle>Testimonial</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quote">Quote *</Label>
              <Textarea
                id="quote"
                value={form.quote}
                onChange={(e) => update("quote", e.target.value)}
                rows={5}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="authorRole">Author role *</Label>
                <Input
                  id="authorRole"
                  value={form.authorRole}
                  onChange={(e) => update("authorRole", e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Select
                  value={form.sector}
                  onValueChange={(v) => update("sector", v)}
                >
                  <SelectTrigger id="sector" className="h-10 w-full">
                    <SelectValue />
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
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Select
                  value={String(form.rating)}
                  onValueChange={(v) => update("rating", Number(v))}
                >
                  <SelectTrigger id="rating" className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <SelectItem key={r} value={String(r)}>
                        {r} star{r > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectType">Project type</Label>
                <Input
                  id="projectType"
                  value={form.projectType}
                  onChange={(e) => update("projectType", e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-10"
            onClick={() => router.push("/admin/testimonials")}
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
            <AlertDialogTitle>Delete testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
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
