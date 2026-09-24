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
  PlusCircle,
  Loader2,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
} from "lucide-react";
import {
  PageHeader,
  API,
  slugify,
  csvToArray,
  useUnsavedChanges,
} from "@/components/admin/shared";

interface BlogForm {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  readTime: string;
  date: string;
  imageQuery: string;
  featured: boolean;
  published: boolean;
  tags: string;
}

interface ContentBlock {
  heading: string;
  body: string;
}

const emptyForm: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  category: "Surveillance",
  author: "",
  authorRole: "",
  readTime: "5 min read",
  date: new Date().toISOString().slice(0, 10),
  imageQuery: "",
  featured: false,
  published: true,
  tags: "",
};

export default function NewBlogPage() {
  const router = useRouter();
  const [form, setForm] = React.useState<BlogForm>(emptyForm);
  const [blocks, setBlocks] = React.useState<ContentBlock[]>([
    { heading: "", body: "" },
  ]);
  const [submitting, setSubmitting] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(false);

  React.useEffect(() => {
    if (!slugTouched) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, slugTouched]);

  useUnsavedChanges(true);

  function update<K extends keyof BlogForm>(key: K, value: BlogForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateBlock(i: number, patch: Partial<ContentBlock>) {
    setBlocks((prev) =>
      prev.map((b, idx) => (idx === i ? { ...b, ...patch } : b)),
    );
  }

  function addBlock() {
    setBlocks((prev) => [...prev, { heading: "", body: "" }]);
  }

  function removeBlock(i: number) {
    setBlocks((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  function moveBlock(i: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const next = [...prev];
      const target = i + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  }

  function buildPayload() {
    return {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt.trim(),
      category: form.category.trim(),
      author: form.author.trim(),
      authorRole: form.authorRole.trim(),
      readTime: form.readTime.trim(),
      date: form.date,
      imageQuery: form.imageQuery.trim(),
      featured: form.featured,
      published: form.published,
      tags: csvToArray(form.tags),
      content: blocks
        .filter((b) => b.body.trim() || b.heading.trim())
        .map((b) => ({
          heading: b.heading.trim() || undefined,
          body: b.body.trim(),
        })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }
    if (!form.author.trim()) {
      toast.error("Author is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(API.blog, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Blog post created");
      router.push("/admin/blog");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PlusCircle}
        title="New Blog Post"
        description="Write an article or insight"
        backHref="/admin/blog"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Article details</CardTitle>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => update("excerpt", e.target.value)}
                rows={3}
                placeholder="Short summary shown in cards and previews"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => update("author", e.target.value)}
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorRole">Author role</Label>
              <Input
                id="authorRole"
                value={form.authorRole}
                onChange={(e) => update("authorRole", e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="readTime">Read time</Label>
              <Input
                id="readTime"
                value={form.readTime}
                onChange={(e) => update("readTime", e.target.value)}
                className="h-10"
                placeholder="7 min read"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="imageQuery">Image query</Label>
              <Input
                id="imageQuery"
                value={form.imageQuery}
                onChange={(e) => update("imageQuery", e.target.value)}
                className="h-10"
                placeholder="cctv security camera installation"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                className="h-10"
                placeholder="CCTV, Surveillance, Security"
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

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Content blocks</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-9"
              onClick={addBlock}
            >
              <Plus className="size-4" />
              Add block
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {blocks.map((b, i) => (
              <div
                key={i}
                className="space-y-3 rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    Block {i + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9"
                      onClick={() => moveBlock(i, -1)}
                      disabled={i === 0}
                      title="Move up"
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9"
                      onClick={() => moveBlock(i, 1)}
                      disabled={i === blocks.length - 1}
                      title="Move down"
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 hover:text-destructive"
                      onClick={() => removeBlock(i)}
                      disabled={blocks.length === 1}
                      title="Remove block"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`heading-${i}`}>Heading (optional)</Label>
                  <Input
                    id={`heading-${i}`}
                    value={b.heading}
                    onChange={(e) => updateBlock(i, { heading: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`body-${i}`}>Body</Label>
                  <Textarea
                    id={`body-${i}`}
                    value={b.body}
                    onChange={(e) => updateBlock(i, { body: e.target.value })}
                    rows={5}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-10"
            onClick={() => router.push("/admin/blog")}
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
            {submitting ? "Creating…" : "Create post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
