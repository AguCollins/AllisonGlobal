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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  ErrorState,
  API,
  slugify,
  csvToArray,
  arrayToCsv,
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

interface BlogRecord {
  id: string;
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
  tags: string[];
  content: { heading?: string; body: string }[];
}

const emptyForm: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  category: "",
  author: "",
  authorRole: "",
  readTime: "",
  date: "",
  imageQuery: "",
  featured: false,
  published: true,
  tags: "",
};

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  const [form, setForm] = React.useState<BlogForm>(emptyForm);
  const [blocks, setBlocks] = React.useState<ContentBlock[]>([
    { heading: "", body: "" },
  ]);
  const [original, setOriginal] = React.useState("");
  const [originalBlocks, setOriginalBlocks] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API.blog}?drafts=true&limit=200`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { items: BlogRecord[] };
      const found = json.items.find((it) => it.id === id);
      if (!found) throw new Error("Post not found");
      const f: BlogForm = {
        title: found.title,
        slug: found.slug,
        excerpt: found.excerpt,
        category: found.category,
        author: found.author,
        authorRole: found.authorRole,
        readTime: found.readTime,
        date: found.date,
        imageQuery: found.imageQuery,
        featured: found.featured,
        published: found.published,
        tags: arrayToCsv(found.tags),
      };
      const b: ContentBlock[] =
        found.content && found.content.length > 0
          ? found.content.map((c) => ({
              heading: c.heading ?? "",
              body: c.body,
            }))
          : [{ heading: "", body: "" }];
      setForm(f);
      setBlocks(b);
      setOriginal(JSON.stringify(f));
      setOriginalBlocks(JSON.stringify(b));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const dirty = JSON.stringify(form) !== original || JSON.stringify(blocks) !== originalBlocks;
  useUnsavedChanges(dirty);

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
    setBlocks((prev) =>
      prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i),
    );
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
      id,
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
    setSubmitting(true);
    try {
      const res = await fetch(API.blog, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Post updated");
      router.push("/admin/blog");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update post");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`${API.blog}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      toast.success("Post deleted");
      router.push("/admin/blog");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete post");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={PlusCircle} title="Edit post" backHref="/admin/blog" />
        <div className="h-32 rounded-xl border border-border bg-muted/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader icon={PlusCircle} title="Edit post" backHref="/admin/blog" />
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PlusCircle}
        title="Edit Blog Post"
        description={form.title}
        backHref="/admin/blog"
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
                onChange={(e) => update("slug", slugify(e.target.value))}
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => update("author", e.target.value)}
                className="h-10"
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
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                className="h-10"
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
            Save changes
          </Button>
        </div>
      </form>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{" "}
              <span className="font-medium text-foreground">{form.title}</span>.
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
