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
  Quote,
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Star,
} from "lucide-react";
import { testimonials as staticTestimonials } from "@/lib/data/testimonials";
import { industries } from "@/lib/data/industries";
import {
  PageHeader,
  EmptyState,
  TableSkeleton,
  API,
} from "@/components/admin/shared";

interface TestimonialRow {
  id: string;
  quote: string;
  authorRole: string;
  sector: string;
  rating: number;
  projectType: string;
}

interface ListResponse {
  items: TestimonialRow[];
  total: number;
}

function sectorName(id: string): string {
  return industries.find((i) => i.id === id)?.name ?? id;
}

function staticFallback(): TestimonialRow[] {
  return staticTestimonials.map((t) => ({ ...t }));
}

export default function AdminTestimonialsPage() {
  const router = useRouter();
  const [items, setItems] = React.useState<TestimonialRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<TestimonialRow | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API.testimonials}?drafts=true&limit=200`, {
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
        `${API.testimonials}?id=${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setItems((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast.success("Testimonial deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete testimonial");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  const filtered = React.useMemo(() => {
    if (!debounced) return items;
    const q = debounced.toLowerCase();
    return items.filter(
      (t) =>
        t.quote.toLowerCase().includes(q) ||
        t.authorRole.toLowerCase().includes(q) ||
        t.projectType.toLowerCase().includes(q),
    );
  }, [items, debounced]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Quote}
        title="Testimonials"
        description={`${items.length} client quotes`}
        action={
          <Button
            size="lg"
            className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => router.push("/admin/testimonials/new")}
          >
            <PlusCircle className="size-4" />
            New Testimonial
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
          placeholder="Search testimonials…"
          aria-label="Search testimonials"
          className="h-10 pl-9"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Quote}
          title={debounced ? "No matching testimonials" : "No testimonials yet"}
          description={
            debounced
              ? "Try a different search term."
              : "Add your first client testimonial."
          }
          actionLabel={debounced ? undefined : "New Testimonial"}
          actionHref={debounced ? undefined : "/admin/testimonials/new"}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] px-4">Rating</TableHead>
                <TableHead className="px-4">Quote</TableHead>
                <TableHead className="px-4">Author role</TableHead>
                <TableHead className="px-4">Sector</TableHead>
                <TableHead className="px-4">Project type</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={
                            i < t.rating
                              ? "size-3.5 fill-amber-400 text-amber-400"
                              : "size-3.5 text-muted-foreground/40"
                          }
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] px-4 py-3 text-sm">
                    <p className="line-clamp-2 italic text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">{t.authorRole}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="secondary">{sectorName(t.sector)}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">{t.projectType}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10"
                        asChild
                        title="Edit"
                      >
                        <Link href={`/admin/testimonials/${t.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 hover:text-destructive"
                        title="Delete"
                        disabled={deletingId === t.id}
                        onClick={() => setDeleteTarget(t)}
                      >
                        {deletingId === t.id ? (
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
