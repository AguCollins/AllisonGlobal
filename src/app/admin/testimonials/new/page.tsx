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
import { PlusCircle, Loader2, Save } from "lucide-react";
import { industries } from "@/lib/data/industries";
import {
  PageHeader,
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

const emptyForm: TestimonialForm = {
  quote: "",
  authorRole: "",
  sector: industries[0]?.id ?? "corporate",
  rating: 5,
  projectType: "",
};

export default function NewTestimonialPage() {
  const router = useRouter();
  const [form, setForm] = React.useState<TestimonialForm>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  useUnsavedChanges(true);

  function update<K extends keyof TestimonialForm>(key: K, value: TestimonialForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload() {
    return {
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
    if (!form.authorRole.trim()) {
      toast.error("Author role is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(API.testimonials, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Testimonial created");
      router.push("/admin/testimonials");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create testimonial");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PlusCircle}
        title="New Testimonial"
        description="Add a client quote"
        backHref="/admin/testimonials"
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
                placeholder="What the client said…"
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
                  placeholder="Operations Manager"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Select
                  value={form.sector}
                  onValueChange={(v) => update("sector", v)}
                >
                  <SelectTrigger id="sector" className="h-10 w-full">
                    <SelectValue placeholder="Select sector" />
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
                  placeholder="Multi-Site Surveillance & Alarms"
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
            {submitting ? "Creating…" : "Create testimonial"}
          </Button>
        </div>
      </form>
    </div>
  );
}
