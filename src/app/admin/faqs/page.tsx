"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  HelpCircle,
  PlusCircle,
  Search,
  Trash2,
  Pencil,
  Save,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { faqs as staticFaqs } from "@/lib/data/faqs";
import {
  PageHeader,
  EmptyState,
  API,
} from "@/components/admin/shared";

interface FaqRow {
  id: string;
  question: string;
  answer: unknown;
  category: string;
  sortOrder: number;
}

interface ListResponse {
  items: FaqRow[];
  total: number;
}

interface DraftRow {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isNew: boolean;
}

function toDraft(f: FaqRow): DraftRow {
  return {
    id: f.id,
    question: f.question,
    answer: typeof f.answer === "string" ? f.answer : "",
    category: f.category,
    sortOrder: f.sortOrder ?? 0,
    isNew: false,
  };
}

function staticFallback(): FaqRow[] {
  return staticFaqs.map((f, idx) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: f.category,
    sortOrder: idx,
  }));
}

const CATEGORIES = [
  "Services & Scope",
  "Pricing & Contracts",
  "Support & Maintenance",
  "Security & Compliance",
  "Process",
];

export default function AdminFaqsPage() {
  const [rows, setRows] = React.useState<DraftRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<DraftRow | null>(null);

  const [drafts, setDrafts] = React.useState<Record<string, DraftRow>>({});

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API.faqs}?drafts=true&limit=500`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ListResponse;
      const list = (json.items ?? []).sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );
      setRows(list.map(toDraft));
    } catch (e) {
      setRows(staticFallback().map(toDraft));
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

  function startEdit(row: DraftRow) {
    setDrafts((d) => ({ ...d, [row.id]: { ...row } }));
    setEditingId(row.id);
  }

  function cancelEdit(id: string) {
    setDrafts((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });
    setEditingId(null);
    setRows((prev) => prev.filter((r) => !(r.isNew && r.id === id)));
  }

  function updateDraft(id: string, patch: Partial<DraftRow>) {
    setDrafts((d) => ({
      ...d,
      [id]: { ...(d[id] ?? ({} as DraftRow)), ...patch },
    }));
  }

  async function saveRow(id: string) {
    const draft = drafts[id];
    if (!draft) return;
    if (!draft.question.trim()) {
      toast.error("Question is required");
      return;
    }
    if (!draft.answer.trim()) {
      toast.error("Answer is required");
      return;
    }
    setSavingId(id);
    try {
      if (draft.isNew) {
        const res = await fetch(API.faqs, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: draft.question.trim(),
            answer: draft.answer.trim(),
            category: draft.category.trim(),
            sortOrder: Number(draft.sortOrder) || 0,
          }),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as { item: FaqRow };
        const saved = toDraft(json.item);
        setRows((prev) =>
          prev
            .map((r) => (r.id === id ? saved : r))
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        );
      } else {
        const res = await fetch(API.faqs, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            question: draft.question.trim(),
            answer: draft.answer.trim(),
            category: draft.category.trim(),
            sortOrder: Number(draft.sortOrder) || 0,
          }),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as { item: FaqRow };
        const saved = toDraft(json.item);
        setRows((prev) =>
          prev
            .map((r) => (r.id === id ? saved : r))
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        );
      }
      setDrafts((d) => {
        const next = { ...d };
        delete next[id];
        return next;
      });
      setEditingId(null);
      toast.success("FAQ saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save FAQ");
    } finally {
      setSavingId(null);
    }
  }

  function addRow() {
    const id = `new-${Date.now()}`;
    const nextSort = rows.length;
    const draft: DraftRow = {
      id,
      question: "",
      answer: "",
      category: CATEGORIES[0],
      sortOrder: nextSort,
      isNew: true,
    };
    setRows((prev) => [draft, ...prev]);
    setDrafts((d) => ({ ...d, [id]: draft }));
    setEditingId(id);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.isNew) {
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      return;
    }
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`${API.faqs}?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success("FAQ deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete FAQ");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  const filtered = React.useMemo(() => {
    if (!debounced) return rows;
    const q = debounced.toLowerCase();
    return rows.filter(
      (r) =>
        r.question.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q),
    );
  }, [rows, debounced]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HelpCircle}
        title="FAQs"
        description={`${rows.length} questions`}
        action={
          <Button
            size="lg"
            className="min-h-10 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={addRow}
          >
            <PlusCircle className="size-4" />
            Add FAQ
          </Button>
        }
      />

      {error && (
        <div className="rounded-md border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs…"
            aria-label="Search FAQs"
            className="h-10 pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="min-h-10"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-md border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title={debounced ? "No matching FAQs" : "No FAQs yet"}
          description={
            debounced
              ? "Try a different search term."
              : "Add your first frequently asked question."
          }
          actionLabel={debounced ? undefined : "Add FAQ"}
          onAction={debounced ? undefined : addRow}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] px-4">Order</TableHead>
                <TableHead className="px-4">Question</TableHead>
                <TableHead className="w-[180px] px-4">Category</TableHead>
                <TableHead className="w-[180px] px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => {
                const isEditing = editingId === row.id;
                const draft = drafts[row.id] ?? row;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="px-4 py-3 align-top">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={draft.sortOrder}
                          onChange={(e) =>
                            updateDraft(row.id, {
                              sortOrder: Number(e.target.value),
                            })
                          }
                          className="h-9 w-16"
                        />
                      ) : (
                        <span className="font-mono text-sm text-muted-foreground">
                          {row.sortOrder}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={draft.question}
                            onChange={(e) =>
                              updateDraft(row.id, { question: e.target.value })
                            }
                            className="h-9"
                            placeholder="Question"
                          />
                          <Textarea
                            value={draft.answer}
                            onChange={(e) =>
                              updateDraft(row.id, { answer: e.target.value })
                            }
                            rows={3}
                            placeholder="Answer"
                          />
                          <Label
                            htmlFor={`cat-${row.id}`}
                            className="text-xs text-muted-foreground"
                          >
                            Category
                          </Label>
                          <Input
                            id={`cat-${row.id}`}
                            value={draft.category}
                            onChange={(e) =>
                              updateDraft(row.id, { category: e.target.value })
                            }
                            className="h-9"
                            list="faq-categories"
                          />
                          <datalist id="faq-categories">
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c} />
                            ))}
                          </datalist>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium">{row.question}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {row.answer}
                          </p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      {isEditing ? null : (
                        <Badge variant="secondary">{row.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-10 text-emerald-600"
                              onClick={() => saveRow(row.id)}
                              disabled={savingId === row.id}
                              title="Save"
                            >
                              {savingId === row.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Save className="size-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-10"
                              onClick={() => cancelEdit(row.id)}
                              disabled={savingId === row.id}
                              title="Cancel"
                            >
                              <X className="size-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-10"
                              onClick={() => startEdit(row)}
                              title="Edit inline"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-10 hover:text-destructive"
                              onClick={() => setDeleteTarget(row)}
                              disabled={deletingId === row.id}
                              title="Delete"
                            >
                              {deletingId === row.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete this FAQ. This action cannot be
              undone.
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
