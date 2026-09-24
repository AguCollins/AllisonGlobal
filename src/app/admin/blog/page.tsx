"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Newspaper,
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { blogPosts as staticPosts } from "@/lib/data/blog";
import {
  PageHeader,
  EmptyState,
  TableSkeleton,
  API,
  formatDate,
} from "@/components/admin/shared";

interface BlogRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  published: boolean;
  date: string;
}

interface ListResponse {
  items: BlogRow[];
  total: number;
  page: number;
  pages: number;
}

function staticFallback(): BlogRow[] {
  return staticPosts.map((p) => ({
    id: p.slug,
    slug: p.slug,
    title: p.title,
    category: p.category,
    author: p.author,
    published: true,
    date: p.date,
  }));
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [items, setItems] = React.useState<BlogRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");

  const [pendingPublishId, setPendingPublishId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<BlogRow | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        drafts: "true",
        limit: "20",
        page: String(page),
      });
      if (debounced) params.set("q", debounced);
      const res = await fetch(`${API.blog}?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ListResponse;
      setItems(json.items ?? []);
      setTotal(json.total ?? 0);
      setPages(json.pages ?? 1);
    } catch (e) {
      setItems(staticFallback());
      setTotal(staticFallback().length);
      setPages(1);
      setError(
        e instanceof Error
          ? `Database unavailable — showing static seed data. (${e.message})`
          : "Database unavailable — showing static seed data.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, debounced]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    setPage(1);
  }, [debounced]);

  async function togglePublish(row: BlogRow) {
    setPendingPublishId(row.id);
    try {
      const res = await fetch(API.blog, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, published: !row.published }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems((prev) =>
        prev.map((p) => (p.id === row.id ? { ...p, published: !p.published } : p)),
      );
      toast.success(row.published ? "Post unpublished" : "Post published");
    } catch {
      toast.error("Failed to update post");
    } finally {
      setPendingPublishId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`${API.blog}?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setItems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Post deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete post");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Newspaper}
        title="Blog"
        description={`${total} posts`}
        action={
          <Button
            size="lg"
            className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => router.push("/admin/blog/new")}
          >
            <PlusCircle className="size-4" />
            New Post
          </Button>
        }
      />

      {error && (
        <div className="rounded-md border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          {error}
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts…"
          aria-label="Search blog posts"
          className="h-10 pl-9"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title={debounced ? "No matching posts" : "No blog posts yet"}
          description={
            debounced
              ? "Try a different search term."
              : "Publish your first article to start sharing insights."
          }
          actionLabel={debounced ? undefined : "New Post"}
          actionHref={debounced ? undefined : "/admin/blog/new"}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Title</TableHead>
                <TableHead className="px-4">Slug</TableHead>
                <TableHead className="px-4">Category</TableHead>
                <TableHead className="px-4">Author</TableHead>
                <TableHead className="px-4">Published</TableHead>
                <TableHead className="px-4">Date</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-[280px] truncate px-4 py-3 font-medium">
                    {p.title}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {p.slug}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="secondary">{p.category}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">{p.author}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-9 gap-1.5"
                      disabled={pendingPublishId === p.id}
                      onClick={() => togglePublish(p)}
                    >
                      {pendingPublishId === p.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : p.published ? (
                        <Eye className="size-3.5 text-emerald-600" />
                      ) : (
                        <EyeOff className="size-3.5 text-muted-foreground" />
                      )}
                      {p.published ? "Published" : "Draft"}
                    </Button>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(p.date)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10"
                        asChild
                        title="View on site"
                      >
                        <Link href={`/blog/${p.slug}`} target="_blank">
                          <ExternalLink className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10"
                        asChild
                        title="Edit"
                      >
                        <Link href={`/admin/blog/${p.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 hover:text-destructive"
                        title="Delete"
                        disabled={deletingId === p.id}
                        onClick={() => setDeleteTarget(p)}
                      >
                        {deletingId === p.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {pages} · {total} posts
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="min-h-10"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="min-h-10"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages || loading}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.title}
              </span>
              . This action cannot be undone.
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
