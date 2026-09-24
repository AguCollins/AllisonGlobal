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
  Briefcase,
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { projects as staticProjects } from "@/lib/data/projects";
import { industries } from "@/lib/data/industries";
import {
  PageHeader,
  EmptyState,
  TableSkeleton,
  API,
} from "@/components/admin/shared";

interface ProjectRow {
  id: string;
  title: string;
  category: string;
  industry: string;
  year: string;
  featured: boolean;
  published: boolean;
}

interface ListResponse {
  items: ProjectRow[];
  total: number;
}

function industryName(id: string): string {
  return industries.find((i) => i.id === id)?.name ?? id;
}

function staticFallback(): ProjectRow[] {
  return staticProjects.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    industry: p.industry,
    year: p.year,
    featured: Boolean(p.featured),
    published: true,
  }));
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [items, setItems] = React.useState<ProjectRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");

  const [pendingPublishId, setPendingPublishId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ProjectRow | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API.projects}?drafts=true&limit=200`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ListResponse;
      setItems(json.items ?? []);
    } catch (e) {
      setItems(staticFallback());
      setError(
        e instanceof Error
          ? `Database unavailable — showing static seed data. (${e.message})`
          : "Database unavailable — showing static seed data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function togglePublish(row: ProjectRow) {
    setPendingPublishId(row.id);
    try {
      const res = await fetch(API.projects, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, published: !row.published }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems((prev) =>
        prev.map((p) => (p.id === row.id ? { ...p, published: !p.published } : p)),
      );
      toast.success(row.published ? "Project unpublished" : "Project published");
    } catch {
      toast.error("Failed to update project");
    } finally {
      setPendingPublishId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`${API.projects}?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setItems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Project deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete project");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  const filtered = React.useMemo(() => {
    if (!debounced) return items;
    const q = debounced.toLowerCase();
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q),
    );
  }, [items, debounced]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Briefcase}
        title="Projects"
        description={`${items.length} case studies`}
        action={
          <Button
            size="lg"
            className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => router.push("/admin/projects/new")}
          >
            <PlusCircle className="size-4" />
            New Project
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
          placeholder="Search projects…"
          aria-label="Search projects"
          className="h-10 pl-9"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={debounced ? "No matching projects" : "No projects yet"}
          description={
            debounced
              ? "Try a different search term."
              : "Add your first project case study."
          }
          actionLabel={debounced ? undefined : "New Project"}
          actionHref={debounced ? undefined : "/admin/projects/new"}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Title</TableHead>
                <TableHead className="px-4">Category</TableHead>
                <TableHead className="px-4">Industry</TableHead>
                <TableHead className="px-4">Year</TableHead>
                <TableHead className="px-4">Featured</TableHead>
                <TableHead className="px-4">Published</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-[280px] truncate px-4 py-3 font-medium">
                    {p.title}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="secondary">{p.category}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {industryName(p.industry)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {p.year}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {p.featured ? (
                      <Badge className="bg-brand text-brand-foreground">Yes</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
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
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10"
                        asChild
                        title="View on site"
                      >
                        <Link href="/projects" target="_blank">
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
                        <Link href={`/admin/projects/${p.id}`}>
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

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
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
