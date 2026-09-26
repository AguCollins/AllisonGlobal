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
  Puzzle,
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { solutions as staticSolutions } from "@/lib/data/solutions";
import {
  PageHeader,
  EmptyState,
  TableSkeleton,
  API,
} from "@/components/admin/shared";

interface SolutionRow {
  id: string;
  name: string;
  summary: unknown;
  iconName: string;
  sortOrder: number;
}

interface ListResponse {
  items: SolutionRow[];
  total: number;
}

function staticFallback(): SolutionRow[] {
  return staticSolutions.map((s, idx) => ({
    id: s.id,
    name: s.name,
    summary: s.summary,
    iconName: "ShieldCheck",
    sortOrder: idx,
  }));
}

export default function AdminSolutionsPage() {
  const router = useRouter();
  const [items, setItems] = React.useState<SolutionRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<SolutionRow | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API.solutions}?drafts=true&limit=200`, {
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

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(
        `${API.solutions}?id=${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setItems((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success("Solution deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete solution");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  const filtered = React.useMemo(() => {
    if (!debounced) return items;
    const q = debounced.toLowerCase();
    return items.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (typeof s.summary === "string" ? s.summary : "").toLowerCase().includes(q),
    );
  }, [items, debounced]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Puzzle}
        title="Solutions"
        description={`${items.length} cross-cutting solutions`}
        action={
          <Button
            size="lg"
            className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => router.push("/admin/solutions/new")}
          >
            <PlusCircle className="size-4" />
            New Solution
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
          placeholder="Search solutions…"
          aria-label="Search solutions"
          className="h-10 pl-9"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Puzzle}
          title={debounced ? "No matching solutions" : "No solutions yet"}
          description={
            debounced
              ? "Try a different search term."
              : "Add your first cross-cutting solution."
          }
          actionLabel={debounced ? undefined : "New Solution"}
          actionHref={debounced ? undefined : "/admin/solutions/new"}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Name</TableHead>
                <TableHead className="px-4">Summary</TableHead>
                <TableHead className="px-4">Icon</TableHead>
                <TableHead className="px-4">Sort</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="px-4 py-3 font-medium">{s.name}</TableCell>
                  <TableCell className="max-w-[380px] truncate px-4 py-3 text-sm text-muted-foreground">
                    {String(s.summary || "") || "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="secondary" className="font-mono">
                      {s.iconName || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {s.sortOrder ?? 0}
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
                        <Link href="/solutions" target="_blank">
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
                        <Link href={`/admin/solutions/${s.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 hover:text-destructive"
                        title="Delete"
                        disabled={deletingId === s.id}
                        onClick={() => setDeleteTarget(s)}
                      >
                        {deletingId === s.id ? (
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
            <AlertDialogTitle>Delete solution?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
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
